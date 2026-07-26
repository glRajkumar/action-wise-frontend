import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PlaygroundBoard } from "@/components/playground/playground-board";
import { ResourceConfigFields } from "@/components/resources/resource-config-fields";
import { Button } from "@/components/ui/button";
import { DialogWrapper } from "@/components/ui/dialog";
import { InputWrapper, SelectWrapper } from "@/components/ui/field-wrapper-rhf";
import { useToast } from "@/components/ui/toast";
import { useConnections } from "@/hooks/use-connections";
import {
	useBoards,
	useCreateBoard,
	useCreateTile,
	useDeleteBoard,
	useDeleteTile,
	useExecuteTile,
	useLogFirebaseRun,
	usePromoteTile,
	useTiles,
	useUpdateTile,
} from "@/hooks/use-playground";
import { useResources } from "@/hooks/use-resources";
import { useCurrentWorkspaceStore } from "@/store/current-workspace";
import type { PlaygroundTile, TileLayout } from "@/types/playground";
import { RENDER_MODES } from "@/types/playground";
import type { Resource } from "@/types/resource";
import {
	type AdhocTileFormData,
	adhocTileFormSchema,
	type PromoteTileFormData,
	promoteTileSchema,
	type WorkspaceNameFormData,
	workspaceNameSchema,
} from "@/utils/schemas";

export const Route = createFileRoute("/_app/playground/")({
	component: PlaygroundPage,
});

const RENDER_MODE_ITEMS: itemT[] = RENDER_MODES.map((mode) => ({
	label: mode,
	value: mode,
}));
const DIRECTION_ITEMS: itemT[] = ["invoke", "subscribe", "receive"].map(
	(v) => ({ label: v, value: v }),
);
const DANGER_ITEMS: itemT[] = ["safe", "mutating", "destructive"].map((v) => ({
	label: v,
	value: v,
}));

const DEFAULT_ADHOC_FORM: AdhocTileFormData = {
	kind: "http",
	connectionId: undefined,
	address: "",
	payloadTemplateJson: "",
	method: "GET",
	headersJson: "",
	queryParamsJson: "",
	bodyType: "none",
	mode: undefined,
	eventFilter: undefined,
	renderMode: "json_tree",
};

function adhocFormToConfig(data: AdhocTileFormData): Record<string, unknown> {
	const base = {
		kind: data.kind,
		connectionId: data.connectionId || undefined,
		address: data.address,
	};
	if (data.kind === "http") {
		return {
			...base,
			config: {
				method: data.method,
				bodyType: data.bodyType,
				headers: data.headersJson ? JSON.parse(data.headersJson) : undefined,
				queryParams: data.queryParamsJson
					? JSON.parse(data.queryParamsJson)
					: undefined,
			},
			payloadTemplate: data.payloadTemplateJson
				? JSON.parse(data.payloadTemplateJson)
				: undefined,
		};
	}
	if (data.kind === "firebase_rtdb")
		return {
			...base,
			config: { mode: data.mode, eventFilter: data.eventFilter },
		};
	return { ...base, config: { mode: data.mode } };
}

function nextTilePosition(tiles: PlaygroundTile[]): TileLayout {
	const maxRow = tiles.reduce(
		(max, tile) => Math.max(max, tile.layout.y + tile.layout.h),
		0,
	);
	return { x: 0, y: maxRow, w: 4, h: 3 };
}

function PlaygroundPage() {
	const workspaceId = useCurrentWorkspaceStore((s) => s.activeWorkspaceId);
	const toast = useToast();

	const { data: boards } = useBoards(workspaceId ?? undefined);
	const [boardId, setBoardId] = useState<string | null>(null);
	const activeBoardId = boardId ?? boards?.[0]?.id ?? null;

	const { data: tiles } = useTiles(
		workspaceId ?? undefined,
		activeBoardId ?? undefined,
	);
	const { data: resources } = useResources(workspaceId ?? undefined);
	const { data: connections } = useConnections(workspaceId ?? undefined);

	const createBoardMutation = useCreateBoard(workspaceId ?? "");
	const deleteBoardMutation = useDeleteBoard(workspaceId ?? "");
	const createTileMutation = useCreateTile(
		workspaceId ?? "",
		activeBoardId ?? "",
	);
	const updateTileMutation = useUpdateTile(
		workspaceId ?? "",
		activeBoardId ?? "",
	);
	const deleteTileMutation = useDeleteTile(
		workspaceId ?? "",
		activeBoardId ?? "",
	);
	const executeMutation = useExecuteTile();
	const logFirebaseRunMutation = useLogFirebaseRun();
	const promoteMutation = usePromoteTile(
		workspaceId ?? "",
		activeBoardId ?? "",
	);

	const [results, setResults] = useState<Record<string, unknown>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [executingTileId, setExecutingTileId] = useState<string | null>(null);

	const [boardDialogOpen, setBoardDialogOpen] = useState(false);
	const [addTileOpen, setAddTileOpen] = useState(false);
	const [addTileMode, setAddTileMode] = useState<"resource" | "adhoc">(
		"resource",
	);
	const [selectedResourceId, setSelectedResourceId] = useState("");
	const [promoteTarget, setPromoteTarget] = useState<PlaygroundTile | null>(
		null,
	);
	const [firebaseLogTarget, setFirebaseLogTarget] =
		useState<PlaygroundTile | null>(null);

	const boardForm = useForm<WorkspaceNameFormData>({
		resolver: zodResolver(workspaceNameSchema),
		defaultValues: { name: "" },
	});
	const adhocForm = useForm<AdhocTileFormData>({
		resolver: zodResolver(adhocTileFormSchema),
		defaultValues: DEFAULT_ADHOC_FORM,
	});
	const promoteForm = useForm<PromoteTileFormData>({
		resolver: zodResolver(promoteTileSchema),
		defaultValues: { name: "", direction: "invoke", danger: "safe" },
	});
	const [firebaseRequestJson, setFirebaseRequestJson] = useState("{}");
	const [firebaseResponseJson, setFirebaseResponseJson] = useState("");
	const [firebaseStatus, setFirebaseStatus] = useState<"success" | "error">(
		"success",
	);

	const adhocKind = adhocForm.watch("kind");

	function resourceById(id: string | null) {
		return resources?.find((r) => r.id === id);
	}

	function tileTitle(tile: PlaygroundTile) {
		if (tile.resourceId)
			return resourceById(tile.resourceId)?.name ?? "Saved resource";
		const adhoc = tile.adhocConfig as { address?: string } | null;
		return adhoc?.address ?? "Ad-hoc request";
	}

	function tileKind(tile: PlaygroundTile): string | undefined {
		if (tile.resourceId) return resourceById(tile.resourceId)?.kind;
		return (tile.adhocConfig as { kind?: string } | null)?.kind;
	}

	function onSubmitBoard(data: WorkspaceNameFormData) {
		if (!workspaceId) return;
		createBoardMutation.mutate(
			{ workspaceId, name: data.name },
			{
				onSuccess: (board) => {
					setBoardId(board.id);
					setBoardDialogOpen(false);
					boardForm.reset();
				},
			},
		);
	}

	function openAddTile() {
		setAddTileMode("resource");
		setSelectedResourceId("");
		adhocForm.reset(DEFAULT_ADHOC_FORM);
		setAddTileOpen(true);
	}

	function onAddTile() {
		if (!workspaceId || !activeBoardId || !tiles) return;
		const layout = nextTilePosition(tiles);

		if (addTileMode === "resource") {
			if (!selectedResourceId) {
				toast.error("Pick a resource");
				return;
			}
			createTileMutation.mutate(
				{
					workspaceId,
					boardId: activeBoardId,
					resourceId: selectedResourceId,
					layout,
					renderMode: "json_tree",
				},
				{ onSuccess: () => setAddTileOpen(false) },
			);
			return;
		}

		adhocForm.handleSubmit((data) => {
			let adhocConfig: Record<string, unknown>;
			try {
				adhocConfig = adhocFormToConfig(data);
			} catch {
				toast.error("Invalid JSON in one of the fields");
				return;
			}
			createTileMutation.mutate(
				{
					workspaceId,
					boardId: activeBoardId,
					adhocConfig,
					layout,
					renderMode: data.renderMode,
				},
				{ onSuccess: () => setAddTileOpen(false) },
			);
		})();
	}

	function onExecute(tile: PlaygroundTile) {
		if (!workspaceId) return;
		setExecutingTileId(tile.id);
		setErrors((prev) => ({ ...prev, [tile.id]: "" }));
		executeMutation.mutate(
			{ workspaceId, tileId: tile.id },
			{
				onSuccess: (result) => {
					setResults((prev) => ({ ...prev, [tile.id]: result.body }));
					setExecutingTileId(null);
				},
				onError: (error) => {
					setErrors((prev) => ({
						...prev,
						[tile.id]: error?.message || "Request failed",
					}));
					setExecutingTileId(null);
				},
			},
		);
	}

	function openFirebaseLog(tile: PlaygroundTile) {
		setFirebaseLogTarget(tile);
		setFirebaseRequestJson("{}");
		setFirebaseResponseJson("");
		setFirebaseStatus("success");
	}

	function onSubmitFirebaseLog() {
		if (!workspaceId || !firebaseLogTarget) return;
		let request: unknown;
		let response: unknown;
		try {
			request = JSON.parse(firebaseRequestJson || "{}");
			response = firebaseResponseJson
				? JSON.parse(firebaseResponseJson)
				: undefined;
		} catch {
			toast.error("Invalid JSON");
			return;
		}
		logFirebaseRunMutation.mutate(
			{
				workspaceId,
				tileId: firebaseLogTarget.id,
				request,
				response,
				status: firebaseStatus,
			},
			{
				onSuccess: () => {
					setResults((prev) => ({ ...prev, [firebaseLogTarget.id]: response }));
					setFirebaseLogTarget(null);
				},
			},
		);
	}

	function openPromote(tile: PlaygroundTile) {
		setPromoteTarget(tile);
		promoteForm.reset({ name: "", direction: "invoke", danger: "safe" });
	}

	function onSubmitPromote(data: PromoteTileFormData) {
		if (!workspaceId || !promoteTarget) return;
		promoteMutation.mutate(
			{ workspaceId, tileId: promoteTarget.id, ...data },
			{ onSuccess: () => setPromoteTarget(null) },
		);
	}

	if (!workspaceId) {
		return (
			<p className="p-6 text-sm text-muted-foreground">
				Select a workspace first.
			</p>
		);
	}

	return (
		<div className="p-6">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<h1 className="text-lg font-semibold">Playground</h1>
					<p className="text-sm text-muted-foreground">
						Fire saved Resources or ad-hoc requests, drag/resize freely.
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => setBoardDialogOpen(true)}>
						<Plus size={15} /> New board
					</Button>
					<Button onClick={openAddTile} disabled={!activeBoardId}>
						<Plus size={15} /> Add tile
					</Button>
				</div>
			</div>

			<div className="mb-4 flex flex-wrap items-center gap-2">
				{boards?.map((board) => (
					<div key={board.id} className="flex items-center">
						<Button
							variant={board.id === activeBoardId ? "secondary" : "ghost"}
							size="sm"
							onClick={() => setBoardId(board.id)}
						>
							{board.name}
						</Button>
						{board.id === activeBoardId && boards.length > 1 && (
							<Button
								variant="ghost"
								size="icon-xs"
								onClick={() => {
									deleteBoardMutation.mutate({
										workspaceId,
										boardId: board.id,
									});
									setBoardId(null);
								}}
							>
								<Trash2 size={12} />
							</Button>
						)}
					</div>
				))}
			</div>

			<div className="overflow-auto">
				<PlaygroundBoard
					tiles={tiles ?? []}
					getTitle={tileTitle}
					canExecute={(tile) => tileKind(tile) === "http"}
					executingTileId={executingTileId}
					results={results}
					errors={errors}
					onExecute={onExecute}
					onLogFirebaseRun={openFirebaseLog}
					onPromote={openPromote}
					onDelete={(tile) =>
						deleteTileMutation.mutate({ workspaceId, tileId: tile.id })
					}
					onLayoutChange={(tileId, layout) =>
						updateTileMutation.mutate({ workspaceId, tileId, layout })
					}
				/>
			</div>

			<DialogWrapper
				open={boardDialogOpen}
				onOpenChange={setBoardDialogOpen}
				title="New board"
				action="Create"
				onAction={boardForm.handleSubmit(onSubmitBoard)}
				loading={createBoardMutation.isPending}
			>
				<InputWrapper
					name="name"
					control={boardForm.control}
					label="Name"
					placeholder="My Playground"
					autoFocus
				/>
			</DialogWrapper>

			<DialogWrapper
				open={addTileOpen}
				onOpenChange={setAddTileOpen}
				title="Add tile"
				action="Add"
				onAction={onAddTile}
				loading={createTileMutation.isPending}
				contentCls="max-h-[85vh] overflow-y-auto"
			>
				<div className="flex flex-col gap-4">
					<div className="flex gap-2">
						<Button
							type="button"
							variant={addTileMode === "resource" ? "secondary" : "outline"}
							size="sm"
							onClick={() => setAddTileMode("resource")}
						>
							From resource
						</Button>
						<Button
							type="button"
							variant={addTileMode === "adhoc" ? "secondary" : "outline"}
							size="sm"
							onClick={() => setAddTileMode("adhoc")}
						>
							Ad-hoc
						</Button>
					</div>

					{addTileMode === "resource" ? (
						<SelectFromResources
							resources={resources ?? []}
							value={selectedResourceId}
							onChange={setSelectedResourceId}
						/>
					) : (
						<>
							<ResourceConfigFields
								control={adhocForm.control}
								kind={adhocKind}
								connections={connections ?? []}
								showConnection
							/>
							<SelectWrapper
								name="renderMode"
								control={adhocForm.control}
								label="Render mode"
								items={RENDER_MODE_ITEMS}
							/>
						</>
					)}
				</div>
			</DialogWrapper>

			{promoteTarget && (
				<DialogWrapper
					open={!!promoteTarget}
					onOpenChange={(open) => !open && setPromoteTarget(null)}
					title="Save to registry"
					description="Turns this ad-hoc tile into a saved Resource everyone in the workspace can reuse."
					action="Save"
					onAction={promoteForm.handleSubmit(onSubmitPromote)}
					loading={promoteMutation.isPending}
				>
					<div className="flex flex-col gap-4">
						<InputWrapper
							name="name"
							control={promoteForm.control}
							label="Name"
							autoFocus
						/>
						<SelectWrapper
							name="direction"
							control={promoteForm.control}
							label="Direction"
							items={DIRECTION_ITEMS}
						/>
						<SelectWrapper
							name="danger"
							control={promoteForm.control}
							label="Danger"
							items={DANGER_ITEMS}
						/>
					</div>
				</DialogWrapper>
			)}

			{firebaseLogTarget && (
				<DialogWrapper
					open={!!firebaseLogTarget}
					onOpenChange={(open) => !open && setFirebaseLogTarget(null)}
					title="Log a Firebase run"
					description="Firebase reads/writes happen client-side via the Firebase SDK, which isn't wired up in this UI yet — record the result manually here so it still shows up in this resource's recorded Runs (used by Beautify/Faker)."
					action="Record"
					onAction={onSubmitFirebaseLog}
					loading={logFirebaseRunMutation.isPending}
					contentCls="max-h-[85vh] overflow-y-auto"
				>
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<span className="text-sm font-medium">Request (JSON)</span>
							<textarea
								value={firebaseRequestJson}
								onChange={(e) => setFirebaseRequestJson(e.target.value)}
								rows={3}
								className="rounded-md border bg-transparent p-2 font-mono text-xs"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<span className="text-sm font-medium">
								Response (JSON, optional)
							</span>
							<textarea
								value={firebaseResponseJson}
								onChange={(e) => setFirebaseResponseJson(e.target.value)}
								rows={3}
								className="rounded-md border bg-transparent p-2 font-mono text-xs"
							/>
						</div>
						<div className="flex gap-2">
							<Button
								type="button"
								variant={firebaseStatus === "success" ? "secondary" : "outline"}
								size="sm"
								onClick={() => setFirebaseStatus("success")}
							>
								Success
							</Button>
							<Button
								type="button"
								variant={firebaseStatus === "error" ? "secondary" : "outline"}
								size="sm"
								onClick={() => setFirebaseStatus("error")}
							>
								Error
							</Button>
						</div>
					</div>
				</DialogWrapper>
			)}
		</div>
	);
}

function SelectFromResources({
	resources,
	value,
	onChange,
}: {
	resources: Resource[];
	value: string;
	onChange: (id: string) => void;
}) {
	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-sm font-medium">Resource</span>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
			>
				<option value="">Select a resource…</option>
				{resources.map((resource) => (
					<option key={resource.id} value={resource.id}>
						{resource.name} ({resource.kind})
					</option>
				))}
			</select>
		</div>
	);
}
