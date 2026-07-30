import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { WorkspaceGate } from "@/components/common/workspace-gate";
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
import {
	type FirebaseRunRecord,
	firestoreListen,
	firestoreReadOnce,
	firestoreWrite,
	getFirebaseApp,
	rtdbListen,
	rtdbReadOnce,
	rtdbWrite,
} from "@/lib/firebase";
import { useCurrentWorkspaceStore } from "@/store/current-workspace";
import type { FirebaseConnectionConfig } from "@/types/connection";
import {
	nextTilePosition,
	type PlaygroundTile,
	pushTileUpdate,
	RENDER_MODES,
	type TileUpdate,
} from "@/types/playground";
import type {
	FirebaseEventFilter,
	FirebaseMode,
	Resource,
} from "@/types/resource";
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

type TileExecution = {
	kind: string;
	connectionId?: string;
	address: string;
	mode?: FirebaseMode;
	eventFilter?: FirebaseEventFilter;
};

const TEMPLATE_KEY_PATTERN = /\{\{\s*([\w.]+)\s*\}\}/g;

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

	const [updates, setUpdates] = useState<Record<string, TileUpdate[]>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [executingTileId, setExecutingTileId] = useState<string | null>(null);

	// Active listener unsubscribes, keyed by tile id. Ref (not state) so
	// unmount cleanup can reach them without re-renders per attach/detach.
	const unsubscribesRef = useRef(new Map<string, () => void>());
	const [listeningTileIds, setListeningTileIds] = useState<Set<string>>(
		new Set(),
	);

	useEffect(() => {
		const unsubscribes = unsubscribesRef.current;
		return () => {
			for (const unsubscribe of unsubscribes.values()) unsubscribe();
			unsubscribes.clear();
		};
	}, []);

	const [boardDialogOpen, setBoardDialogOpen] = useState(false);
	const [addTileOpen, setAddTileOpen] = useState(false);
	const [addTileMode, setAddTileMode] = useState<"resource" | "adhoc">(
		"resource",
	);
	const [selectedResourceId, setSelectedResourceId] = useState("");
	const [promoteTarget, setPromoteTarget] = useState<PlaygroundTile | null>(
		null,
	);
	const [writeTarget, setWriteTarget] = useState<PlaygroundTile | null>(null);
	const [writeValueJson, setWriteValueJson] = useState("{}");
	const [listenConfirmTarget, setListenConfirmTarget] =
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

	const adhocKind = adhocForm.watch("kind");

	function resourceById(id: string | null) {
		return resources?.find((r) => r.id === id);
	}

	function tileExecution(tile: PlaygroundTile): TileExecution | null {
		if (tile.resourceId) {
			const resource = resourceById(tile.resourceId);
			if (!resource) return null;
			const config = resource.config as {
				mode?: FirebaseMode;
				eventFilter?: FirebaseEventFilter;
			};
			return {
				kind: resource.kind,
				connectionId: resource.connectionId,
				address: resource.address,
				mode: config.mode,
				eventFilter: config.eventFilter,
			};
		}
		const adhoc = tile.adhocConfig as {
			kind?: string;
			connectionId?: string;
			address?: string;
			config?: { mode?: FirebaseMode; eventFilter?: FirebaseEventFilter };
		} | null;
		if (!adhoc?.kind || !adhoc.address) return null;
		return {
			kind: adhoc.kind,
			connectionId: adhoc.connectionId,
			address: adhoc.address,
			mode: adhoc.config?.mode,
			eventFilter: adhoc.config?.eventFilter,
		};
	}

	function tileTitle(tile: PlaygroundTile) {
		if (tile.resourceId)
			return resourceById(tile.resourceId)?.name ?? "Saved resource";
		const adhoc = tile.adhocConfig as { address?: string } | null;
		return adhoc?.address ?? "Ad-hoc request";
	}

	function tileKind(tile: PlaygroundTile): string | undefined {
		return tileExecution(tile)?.kind;
	}

	function tileTemplateKeys(tile: PlaygroundTile): string[] {
		const source = tile.resourceId
			? resourceById(tile.resourceId)
			: tile.adhocConfig;
		if (!source) return [];
		const keys = new Set<string>();
		const text = JSON.stringify(source);
		for (const match of text.matchAll(TEMPLATE_KEY_PATTERN)) {
			if (match[1] && !match[1].startsWith("steps.")) keys.add(match[1]);
		}
		return [...keys];
	}

	function pushUpdate(tileId: string, data: unknown) {
		setUpdates((prev) => ({
			...prev,
			[tileId]: pushTileUpdate(prev[tileId] ?? [], data),
		}));
		setErrors((prev) => ({ ...prev, [tileId]: "" }));
	}

	function firebaseAppForTile(execution: TileExecution) {
		if (!execution.connectionId) {
			throw new Error("Tile has no connection — firebase needs one");
		}
		const connection = connections?.find(
			(c) => c.id === execution.connectionId,
		);
		if (!connection || connection.kind !== "firebase") {
			throw new Error("Firebase connection not found");
		}
		return getFirebaseApp(
			connection.id,
			connection.config as FirebaseConnectionConfig,
		);
	}

	function recordFirebaseRun(tileId: string, record: FirebaseRunRecord) {
		if (!workspaceId) return;
		logFirebaseRunMutation.mutate({
			workspaceId,
			tileId,
			request: record.request,
			response: record.response,
			status: record.status,
			durationMs: record.durationMs,
		});
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

	function onExecute(tile: PlaygroundTile, variables: Record<string, string>) {
		if (!workspaceId) return;
		setExecutingTileId(tile.id);
		setErrors((prev) => ({ ...prev, [tile.id]: "" }));
		executeMutation.mutate(
			{ workspaceId, tileId: tile.id, variables },
			{
				onSuccess: (result) => {
					pushUpdate(tile.id, result.body);
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

	async function runFirebaseOnce(tile: PlaygroundTile, value?: unknown) {
		const execution = tileExecution(tile);
		if (!execution) return;
		setExecutingTileId(tile.id);
		try {
			const app = firebaseAppForTile(execution);
			let record: FirebaseRunRecord;
			if (execution.mode === "write") {
				record =
					execution.kind === "firebase_rtdb"
						? await rtdbWrite(app, execution.address, value)
						: await firestoreWrite(
								app,
								execution.address,
								(value ?? {}) as Record<string, unknown>,
							);
			} else {
				record =
					execution.kind === "firebase_rtdb"
						? await rtdbReadOnce(app, execution.address)
						: await firestoreReadOnce(app, execution.address);
			}
			pushUpdate(tile.id, record.response);
			recordFirebaseRun(tile.id, record);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Firebase call failed";
			setErrors((prev) => ({ ...prev, [tile.id]: message }));
			toast.error(message);
		} finally {
			setExecutingTileId(null);
		}
	}

	function onFirebaseRun(tile: PlaygroundTile) {
		const execution = tileExecution(tile);
		if (!execution) return;
		if (execution.mode === "write") {
			setWriteTarget(tile);
			setWriteValueJson("{}");
			return;
		}
		void runFirebaseOnce(tile);
	}

	function onSubmitWrite() {
		if (!writeTarget) return;
		let value: unknown;
		try {
			value = JSON.parse(writeValueJson || "{}");
		} catch {
			toast.error("Invalid JSON");
			return;
		}
		const target = writeTarget;
		setWriteTarget(null);
		void runFirebaseOnce(target, value);
	}

	function startListening(tile: PlaygroundTile) {
		const execution = tileExecution(tile);
		if (!execution) return;
		try {
			const app = firebaseAppForTile(execution);
			const onEvent = (record: FirebaseRunRecord) => {
				pushUpdate(tile.id, record.response);
				recordFirebaseRun(tile.id, record);
			};
			const onListenError = (error: Error) => {
				setErrors((prev) => ({ ...prev, [tile.id]: error.message }));
				stopListening(tile.id);
			};

			const unsubscribe =
				execution.kind === "firebase_rtdb"
					? rtdbListen(
							app,
							execution.address,
							execution.eventFilter ?? "value",
							onEvent,
							onListenError,
						)
					: firestoreListen(app, execution.address, onEvent, onListenError);

			unsubscribesRef.current.set(tile.id, unsubscribe);
			setListeningTileIds((prev) => new Set(prev).add(tile.id));
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to attach listener",
			);
		}
	}

	function stopListening(tileId: string) {
		unsubscribesRef.current.get(tileId)?.();
		unsubscribesRef.current.delete(tileId);
		setListeningTileIds((prev) => {
			const next = new Set(prev);
			next.delete(tileId);
			return next;
		});
	}

	function onToggleListen(tile: PlaygroundTile) {
		if (listeningTileIds.has(tile.id)) {
			stopListening(tile.id);
			return;
		}
		const execution = tileExecution(tile);
		if (!execution) return;
		// Handover D: warn before a depth-unlimited RTDB `value` listener — it
		// streams the whole subtree on every change (bandwidth/billing footgun).
		if (
			execution.kind === "firebase_rtdb" &&
			(execution.eventFilter ?? "value") === "value"
		) {
			setListenConfirmTarget(tile);
			return;
		}
		startListening(tile);
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

	function onDeleteTile(tile: PlaygroundTile) {
		if (!workspaceId) return;
		stopListening(tile.id);
		deleteTileMutation.mutate({ workspaceId, tileId: tile.id });
	}

	if (!workspaceId) return <WorkspaceGate />;

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
					getKind={tileKind}
					getFirebaseMode={(tile) => tileExecution(tile)?.mode}
					getTemplateKeys={tileTemplateKeys}
					executingTileId={executingTileId}
					listeningTileIds={listeningTileIds}
					updates={updates}
					errors={errors}
					onExecute={onExecute}
					onFirebaseRun={onFirebaseRun}
					onToggleListen={onToggleListen}
					onChangeRenderMode={(tile, renderMode) =>
						updateTileMutation.mutate({
							workspaceId,
							tileId: tile.id,
							renderMode,
						})
					}
					onPromote={openPromote}
					onDelete={onDeleteTile}
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

			{writeTarget && (
				<DialogWrapper
					open={!!writeTarget}
					onOpenChange={(open) => !open && setWriteTarget(null)}
					title="Write value"
					description="JSON value to write at this tile's path."
					action="Write"
					onAction={onSubmitWrite}
				>
					<textarea
						value={writeValueJson}
						onChange={(e) => setWriteValueJson(e.target.value)}
						rows={5}
						className="w-full rounded-md border bg-transparent p-2 font-mono text-xs"
					/>
				</DialogWrapper>
			)}

			{listenConfirmTarget && (
				<DialogWrapper
					open={!!listenConfirmTarget}
					onOpenChange={(open) => !open && setListenConfirmTarget(null)}
					title="Attach depth-unlimited listener?"
					description="A `value` listener streams the entire subtree at this path on every change — on large paths that's a bandwidth and billing footgun. Consider a child_* event filter instead."
					action="Attach anyway"
					onAction={() => {
						const target = listenConfirmTarget;
						setListenConfirmTarget(null);
						if (target) startListening(target);
					}}
				>
					<span />
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
