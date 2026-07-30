import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowDown,
	ArrowLeft,
	ArrowUp,
	ChevronDown,
	ChevronRight,
	Pencil,
	Play,
	Plus,
	Trash2,
	X,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { JsonTree } from "@/components/common/json-tree";
import { WorkspaceGate } from "@/components/common/workspace-gate";
import { Button } from "@/components/ui/button";
import { DialogWrapper } from "@/components/ui/dialog";
import { InputWrapper, SelectWrapper } from "@/components/ui/field-wrapper-rhf";
import { Input } from "@/components/ui/input";
import {
	useAction,
	useActionRun,
	useActionRuns,
	useCreateStep,
	useDeleteStep,
	useExecuteAction,
	useReorderSteps,
	useUpdateAction,
	useUpdateStep,
} from "@/hooks/use-actions";
import { useResources } from "@/hooks/use-resources";
import { cn } from "@/lib/utils";
import { useCurrentWorkspaceStore } from "@/store/current-workspace";
import type { ActionStep, RunStatus, StepRun } from "@/types/action";
import {
	type ActionFormData,
	type ActionStepFormData,
	actionFormSchema,
	actionStepFormSchema,
} from "@/utils/schemas";

export const Route = createFileRoute("/_app/actions/$actionId")({
	component: ActionDetailPage,
});

type MappingRow = { key: string; value: string };

function mappingToRows(mapping: Record<string, string> | null): MappingRow[] {
	if (!mapping) return [];
	return Object.entries(mapping).map(([key, value]) => ({ key, value }));
}

function rowsToMapping(rows: MappingRow[]): Record<string, string> | undefined {
	const entries = rows.filter((row) => row.key.trim() !== "");
	if (entries.length === 0) return undefined;
	return Object.fromEntries(entries.map((row) => [row.key.trim(), row.value]));
}

function statusDotClass(status: RunStatus): string {
	if (status === "success") return "bg-green-500";
	if (status === "error") return "bg-red-500";
	return "bg-amber-400";
}

function ActionDetailPage() {
	const { actionId } = Route.useParams();
	const workspaceId = useCurrentWorkspaceStore((s) => s.activeWorkspaceId);

	const { data: action, isLoading } = useAction(
		workspaceId ?? undefined,
		actionId,
	);
	const { data: resources } = useResources(workspaceId ?? undefined);
	const { data: runList } = useActionRuns(workspaceId ?? undefined, actionId);

	const updateMutation = useUpdateAction(workspaceId ?? "", actionId);
	const createStepMutation = useCreateStep(workspaceId ?? "", actionId);
	const updateStepMutation = useUpdateStep(workspaceId ?? "", actionId);
	const deleteStepMutation = useDeleteStep(workspaceId ?? "", actionId);
	const reorderMutation = useReorderSteps(workspaceId ?? "", actionId);
	const executeMutation = useExecuteAction(workspaceId ?? "", actionId);

	const [editOpen, setEditOpen] = useState(false);
	const [stepFormOpen, setStepFormOpen] = useState(false);
	const [editingStep, setEditingStep] = useState<ActionStep | null>(null);
	const [mappingRows, setMappingRows] = useState<MappingRow[]>([]);
	const [runOpen, setRunOpen] = useState(false);
	const [variableRows, setVariableRows] = useState<MappingRow[]>([]);
	const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

	const editForm = useForm<ActionFormData>({
		resolver: zodResolver(actionFormSchema),
		defaultValues: { name: "", description: "" },
	});

	const stepForm = useForm<ActionStepFormData>({
		resolver: zodResolver(actionStepFormSchema),
		defaultValues: { resourceId: "", name: "" },
	});

	const latestRunId = selectedRunId ?? runList?.[0]?.id;
	const { data: runDetail } = useActionRun(
		workspaceId ?? undefined,
		actionId,
		latestRunId,
	);

	const httpResources = (resources ?? []).filter((r) => r.kind === "http");
	const resourceItems: itemT[] = httpResources.map((r) => ({
		label: r.name,
		value: r.id,
	}));

	if (!workspaceId) return <WorkspaceGate />;
	if (isLoading || !action) {
		return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
	}

	const steps = action.steps;
	const priorStepNames = editingStep
		? steps.filter((s) => s.order < editingStep.order).map((s) => s.name)
		: steps.map((s) => s.name);

	function openEdit() {
		if (!action) return;
		editForm.reset({
			name: action.name,
			description: action.description ?? "",
		});
		setEditOpen(true);
	}

	function onSubmitEdit(data: ActionFormData) {
		if (!workspaceId) return;
		updateMutation.mutate(
			{
				workspaceId,
				actionId,
				name: data.name,
				description: data.description || null,
			},
			{ onSuccess: () => setEditOpen(false) },
		);
	}

	function openAddStep() {
		setEditingStep(null);
		stepForm.reset({ resourceId: "", name: "" });
		setMappingRows([]);
		setStepFormOpen(true);
	}

	function openEditStep(step: ActionStep) {
		setEditingStep(step);
		stepForm.reset({ resourceId: step.resourceId, name: step.name });
		setMappingRows(mappingToRows(step.inputMapping));
		setStepFormOpen(true);
	}

	function onSubmitStep(data: ActionStepFormData) {
		if (!workspaceId) return;
		const inputMapping = rowsToMapping(mappingRows);
		if (editingStep) {
			updateStepMutation.mutate(
				{
					workspaceId,
					actionId,
					stepId: editingStep.id,
					resourceId: data.resourceId,
					name: data.name,
					inputMapping: inputMapping ?? null,
				},
				{ onSuccess: () => setStepFormOpen(false) },
			);
		} else {
			createStepMutation.mutate(
				{
					workspaceId,
					actionId,
					resourceId: data.resourceId,
					name: data.name,
					inputMapping,
				},
				{ onSuccess: () => setStepFormOpen(false) },
			);
		}
	}

	function moveStep(index: number, delta: -1 | 1) {
		if (!workspaceId) return;
		const target = index + delta;
		if (target < 0 || target >= steps.length) return;
		const ids = steps.map((s) => s.id);
		const [moved] = ids.splice(index, 1);
		ids.splice(target, 0, moved);
		reorderMutation.mutate({ workspaceId, actionId, stepIds: ids });
	}

	function onRun() {
		if (!workspaceId) return;
		const variables = rowsToMapping(variableRows);
		executeMutation.mutate(
			{ workspaceId, actionId, variables },
			{
				onSuccess: (detail) => {
					setSelectedRunId(detail.actionRun.id);
					setRunOpen(false);
				},
			},
		);
	}

	return (
		<div className="mx-auto max-w-3xl p-6">
			<div className="mb-6 flex items-start justify-between gap-3">
				<div className="min-w-0">
					<Link
						to="/actions"
						className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft size={13} /> Actions
					</Link>
					<h1 className="truncate text-lg font-semibold">{action.name}</h1>
					{action.description && (
						<p className="text-sm text-muted-foreground">
							{action.description}
						</p>
					)}
				</div>
				<div className="flex shrink-0 gap-2">
					<Button variant="outline" onClick={openEdit}>
						<Pencil size={15} /> Edit
					</Button>
					<Button
						onClick={() => setRunOpen(true)}
						disabled={steps.length === 0 || executeMutation.isPending}
					>
						<Play size={15} />
						{executeMutation.isPending ? "Running…" : "Run"}
					</Button>
				</div>
			</div>

			<DialogWrapper
				open={editOpen}
				onOpenChange={setEditOpen}
				title="Edit action"
				action="Save"
				onAction={editForm.handleSubmit(onSubmitEdit)}
				loading={updateMutation.isPending}
			>
				<div className="flex flex-col gap-4">
					<InputWrapper name="name" control={editForm.control} label="Name" />
					<InputWrapper
						name="description"
						control={editForm.control}
						label="Description (optional)"
					/>
				</div>
			</DialogWrapper>

			<DialogWrapper
				open={stepFormOpen}
				onOpenChange={setStepFormOpen}
				title={editingStep ? "Edit step" : "Add step"}
				action={editingStep ? "Save" : "Add"}
				onAction={stepForm.handleSubmit(onSubmitStep)}
				loading={createStepMutation.isPending || updateStepMutation.isPending}
			>
				<div className="flex flex-col gap-4">
					<SelectWrapper
						name="resourceId"
						control={stepForm.control}
						label="Resource (http only)"
						items={resourceItems}
					/>
					<InputWrapper
						name="name"
						control={stepForm.control}
						label="Step name"
						placeholder="create_post"
					/>
					<div>
						<p className="mb-1 text-sm font-medium">Input mapping (optional)</p>
						<p className="mb-2 text-xs text-muted-foreground">
							Each key becomes a {"{{variable}}"} for this step's resource.
							Values can reference prior steps, e.g.{" "}
							<code className="rounded bg-muted px-1">
								{"{{steps.login.response.body.token}}"}
							</code>
							{priorStepNames.length > 0 &&
								` — prior steps: ${priorStepNames.join(", ")}`}
						</p>
						<MappingEditor rows={mappingRows} onChange={setMappingRows} />
					</div>
				</div>
			</DialogWrapper>

			<DialogWrapper
				open={runOpen}
				onOpenChange={setRunOpen}
				title="Run action"
				description="Optional starting variables, available to every step's templates."
				action={executeMutation.isPending ? "Running…" : "Run"}
				onAction={onRun}
				loading={executeMutation.isPending}
			>
				<MappingEditor rows={variableRows} onChange={setVariableRows} />
			</DialogWrapper>

			<div className="mb-8">
				<div className="mb-2 flex items-center justify-between">
					<h2 className="text-sm font-semibold">Steps</h2>
					<Button variant="outline" size="sm" onClick={openAddStep}>
						<Plus size={14} /> Add step
					</Button>
				</div>
				{steps.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No steps yet — add resources from the registry in the order they
						should run.
					</p>
				) : (
					<div className="flex flex-col gap-2">
						{steps.map((step, index) => (
							<div
								key={step.id}
								className="flex items-start gap-3 rounded-lg border p-3"
							>
								<span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs tabular-nums">
									{index + 1}
								</span>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium">{step.name}</p>
									<p className="truncate text-xs text-muted-foreground">
										{step.resource.name}
									</p>
									{step.inputMapping &&
										Object.keys(step.inputMapping).length > 0 && (
											<p className="mt-1 truncate text-xs text-muted-foreground">
												{Object.entries(step.inputMapping)
													.map(([k, v]) => `${k} ← ${v}`)
													.join(" · ")}
											</p>
										)}
								</div>
								<div className="flex shrink-0 items-center gap-1">
									<Button
										variant="ghost"
										size="icon"
										disabled={index === 0 || reorderMutation.isPending}
										onClick={() => moveStep(index, -1)}
									>
										<ArrowUp size={14} />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										disabled={
											index === steps.length - 1 || reorderMutation.isPending
										}
										onClick={() => moveStep(index, 1)}
									>
										<ArrowDown size={14} />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => openEditStep(step)}
									>
										<Pencil size={14} />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() =>
											deleteStepMutation.mutate({
												workspaceId,
												actionId,
												stepId: step.id,
											})
										}
									>
										<Trash2 size={14} />
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<div>
				<div className="mb-2 flex items-center justify-between">
					<h2 className="text-sm font-semibold">Run timeline</h2>
					{runList && runList.length > 0 && (
						<select
							className="rounded-md border bg-transparent px-2 py-1 text-xs"
							value={latestRunId ?? ""}
							onChange={(e) => setSelectedRunId(e.target.value)}
						>
							{runList.map((run) => (
								<option key={run.id} value={run.id}>
									{new Date(run.startedAt).toLocaleString()} — {run.status}
								</option>
							))}
						</select>
					)}
				</div>
				{!runDetail ? (
					<p className="text-sm text-muted-foreground">
						No runs yet — hit Run to execute the sequence.
					</p>
				) : (
					<div className="flex flex-col gap-2">
						<p className="text-xs text-muted-foreground">
							<span
								className={cn(
									"mr-1.5 inline-block size-2 rounded-full align-middle",
									statusDotClass(runDetail.actionRun.status),
								)}
							/>
							{runDetail.actionRun.status} · started{" "}
							{new Date(runDetail.actionRun.startedAt).toLocaleString()}
						</p>
						{runDetail.stepRuns.map((stepRun) => (
							<StepRunRow key={stepRun.id} stepRun={stepRun} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function MappingEditor({
	rows,
	onChange,
}: {
	rows: MappingRow[];
	onChange: (rows: MappingRow[]) => void;
}) {
	function setRow(index: number, patch: Partial<MappingRow>) {
		onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
	}

	return (
		<div className="flex flex-col gap-2">
			{rows.map((row, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: rows are positional editor state
				<div key={index} className="flex items-center gap-2">
					<Input
						value={row.key}
						onChange={(e) => setRow(index, { key: e.target.value })}
						placeholder="variable"
						className="max-w-40"
					/>
					<Input
						value={row.value}
						onChange={(e) => setRow(index, { value: e.target.value })}
						placeholder="value or {{steps.x.response.body.y}}"
					/>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onChange(rows.filter((_, i) => i !== index))}
					>
						<X size={14} />
					</Button>
				</div>
			))}
			<Button
				variant="outline"
				size="sm"
				className="self-start"
				onClick={() => onChange([...rows, { key: "", value: "" }])}
			>
				<Plus size={14} /> Add row
			</Button>
		</div>
	);
}

function StepRunRow({ stepRun }: { stepRun: StepRun }) {
	const [open, setOpen] = useState(false);

	return (
		<div className="rounded-lg border">
			<button
				type="button"
				className="flex w-full items-center gap-2 p-3 text-left"
				onClick={() => setOpen((prev) => !prev)}
			>
				{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
				<span
					className={cn(
						"size-2 shrink-0 rounded-full",
						statusDotClass(stepRun.status),
					)}
				/>
				<span className="text-sm font-medium">{stepRun.stepName}</span>
				<span className="ml-auto text-xs tabular-nums text-muted-foreground">
					{stepRun.durationMs != null ? `${stepRun.durationMs} ms` : "—"}
				</span>
			</button>
			{open && (
				<div className="grid gap-3 border-t p-3 md:grid-cols-2">
					<div>
						<p className="mb-1 text-xs font-medium text-muted-foreground">
							Request
						</p>
						<JsonTree data={stepRun.request} defaultDepth={1} />
					</div>
					<div>
						<p className="mb-1 text-xs font-medium text-muted-foreground">
							Response
						</p>
						<JsonTree data={stepRun.response} defaultDepth={2} />
					</div>
				</div>
			)}
		</div>
	);
}
