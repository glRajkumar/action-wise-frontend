import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Trash2, Workflow } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { WorkspaceGate } from "@/components/common/workspace-gate";
import { Button } from "@/components/ui/button";
import { DialogWrapper } from "@/components/ui/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { InputWrapper } from "@/components/ui/field-wrapper-rhf";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import {
	useActions,
	useCreateAction,
	useDeleteAction,
} from "@/hooks/use-actions";
import { useCurrentWorkspaceStore } from "@/store/current-workspace";
import type { RunStatus } from "@/types/action";
import { type ActionFormData, actionFormSchema } from "@/utils/schemas";

export const Route = createFileRoute("/_app/actions/")({
	component: ActionsPage,
});

function runStatusLabel(status: RunStatus | null): string {
	if (status === null) return "never run";
	return `last run ${status}`;
}

function ActionsPage() {
	const workspaceId = useCurrentWorkspaceStore((s) => s.activeWorkspaceId);
	const { data: actions, isLoading } = useActions(workspaceId ?? undefined);

	const createMutation = useCreateAction(workspaceId ?? "");
	const deleteMutation = useDeleteAction(workspaceId ?? "");

	const [formOpen, setFormOpen] = useState(false);

	const form = useForm<ActionFormData>({
		resolver: zodResolver(actionFormSchema),
		defaultValues: { name: "", description: "" },
	});

	function onSubmit(data: ActionFormData) {
		if (!workspaceId) return;
		createMutation.mutate(
			{
				workspaceId,
				name: data.name,
				description: data.description || undefined,
			},
			{
				onSuccess: () => {
					setFormOpen(false);
					form.reset();
				},
			},
		);
	}

	if (!workspaceId) return <WorkspaceGate />;

	return (
		<div className="mx-auto max-w-3xl p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-lg font-semibold">Actions</h1>
					<p className="text-sm text-muted-foreground">
						Named units of intent — ordered steps over registry resources.
					</p>
				</div>
				<Button onClick={() => setFormOpen(true)}>
					<Plus size={15} /> New action
				</Button>
			</div>

			<DialogWrapper
				open={formOpen}
				onOpenChange={setFormOpen}
				title="Create action"
				action="Create"
				onAction={form.handleSubmit(onSubmit)}
				loading={createMutation.isPending}
			>
				<div className="flex flex-col gap-4">
					<InputWrapper
						name="name"
						control={form.control}
						label="Name"
						placeholder="Create post and verify"
					/>
					<InputWrapper
						name="description"
						control={form.control}
						label="Description (optional)"
					/>
				</div>
			</DialogWrapper>

			{isLoading ? (
				<p className="text-sm text-muted-foreground">Loading…</p>
			) : actions && actions.length > 0 ? (
				<ItemGroup>
					{actions.map((action) => (
						<Item key={action.id} variant="outline">
							<ItemContent>
								<ItemTitle>
									<Link
										to="/actions/$actionId"
										params={{ actionId: action.id }}
										className="hover:underline"
									>
										{action.name}
									</Link>
								</ItemTitle>
								<ItemDescription>
									{action.stepCount} step{action.stepCount === 1 ? "" : "s"} ·{" "}
									{runStatusLabel(action.lastRunStatus)}
									{action.description ? ` — ${action.description}` : ""}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Button
									variant="ghost"
									size="icon"
									onClick={() =>
										deleteMutation.mutate({ workspaceId, actionId: action.id })
									}
								>
									<Trash2 size={15} />
								</Button>
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
			) : (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Workflow />
						</EmptyMedia>
						<EmptyTitle>No actions yet</EmptyTitle>
						<EmptyDescription>
							Create one, add steps from the registry, then run the whole
							sequence.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</div>
	);
}
