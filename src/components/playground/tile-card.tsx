import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
	ChevronLeft,
	ChevronRight,
	GripVertical,
	Play,
	Save,
	SlidersHorizontal,
	Square,
	X,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	CELL_GAP,
	CELL_SIZE,
	GRID_COLUMNS,
	type PlaygroundTile,
	RENDER_MODES,
	type RenderMode,
	type TileUpdate,
} from "@/types/playground";
import type { FirebaseMode } from "@/types/resource";
import { RenderResult } from "./render-result";

type Props = {
	tile: PlaygroundTile;
	title: string;
	kind?: string;
	firebaseMode?: FirebaseMode;
	executing: boolean;
	listening: boolean;
	updates: TileUpdate[];
	resultError?: string;
	templateKeys: string[];
	onExecute: (variables: Record<string, string>) => void;
	onFirebaseRun: () => void;
	onToggleListen: () => void;
	onChangeRenderMode: (mode: RenderMode) => void;
	onPromote?: () => void;
	onDelete: () => void;
	onResize: (w: number, h: number) => void;
};

const CELL = CELL_SIZE + CELL_GAP;

type VariableRow = { key: string; value: string };

export function TileCard({
	tile,
	title,
	kind,
	firebaseMode,
	executing,
	listening,
	updates,
	resultError,
	templateKeys,
	onExecute,
	onFirebaseRun,
	onToggleListen,
	onChangeRenderMode,
	onPromote,
	onDelete,
	onResize,
}: Props) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({ id: tile.id });

	const resizingRef = useRef<{
		startX: number;
		startY: number;
		startW: number;
		startH: number;
	} | null>(null);
	const [liveSize, setLiveSize] = useState<{ w: number; h: number } | null>(
		null,
	);

	// Ring-buffer scrubber: index 0 is the latest update; viewing an older one
	// keeps its position as new updates arrive (indices shift by design).
	const [scrubIndex, setScrubIndex] = useState(0);
	const [variablesOpen, setVariablesOpen] = useState(false);
	const [variableRows, setVariableRows] = useState<VariableRow[]>([]);

	function onResizePointerMove(event: PointerEvent) {
		const state = resizingRef.current;
		if (!state) return;
		const deltaW = Math.round((event.clientX - state.startX) / CELL);
		const deltaH = Math.round((event.clientY - state.startY) / CELL);
		setLiveSize({
			w: Math.min(
				GRID_COLUMNS - tile.layout.x,
				Math.max(1, state.startW + deltaW),
			),
			h: Math.max(1, state.startH + deltaH),
		});
	}

	function onResizePointerUp() {
		window.removeEventListener("pointermove", onResizePointerMove);
		window.removeEventListener("pointerup", onResizePointerUp);
		resizingRef.current = null;
		setLiveSize((current) => {
			if (
				current &&
				(current.w !== tile.layout.w || current.h !== tile.layout.h)
			)
				onResize(current.w, current.h);
			return null;
		});
	}

	function onResizePointerDown(event: React.PointerEvent) {
		event.stopPropagation();
		event.preventDefault();
		resizingRef.current = {
			startX: event.clientX,
			startY: event.clientY,
			startW: tile.layout.w,
			startH: tile.layout.h,
		};
		window.addEventListener("pointermove", onResizePointerMove);
		window.addEventListener("pointerup", onResizePointerUp);
	}

	function toggleVariables() {
		setVariablesOpen((open) => {
			if (!open && variableRows.length === 0 && templateKeys.length > 0) {
				setVariableRows(templateKeys.map((key) => ({ key, value: "" })));
			}
			return !open;
		});
	}

	function collectVariables(): Record<string, string> {
		return Object.fromEntries(
			variableRows
				.filter((row) => row.key.trim() !== "")
				.map((row) => [row.key.trim(), row.value]),
		);
	}

	function setRow(index: number, patch: Partial<VariableRow>) {
		setVariableRows((rows) =>
			rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
		);
	}

	const w = liveSize?.w ?? tile.layout.w;
	const h = liveSize?.h ?? tile.layout.h;

	const clampedIndex = Math.min(scrubIndex, Math.max(0, updates.length - 1));
	const currentUpdate: TileUpdate | undefined = updates[clampedIndex];

	const isHttp = kind === "http";
	const isListenTile = !isHttp && firebaseMode === "listen";

	return (
		<div
			ref={setNodeRef}
			className="absolute flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm"
			style={{
				left: tile.layout.x * CELL,
				top: tile.layout.y * CELL,
				width: w * CELL_SIZE + (w - 1) * CELL_GAP,
				height: h * CELL_SIZE + (h - 1) * CELL_GAP,
				transform: transform ? CSS.Translate.toString(transform) : undefined,
				zIndex: isDragging ? 20 : 1,
			}}
		>
			<div className="flex items-center gap-1 border-b bg-muted/50 px-2 py-1">
				<button
					type="button"
					{...listeners}
					{...attributes}
					className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
				>
					<GripVertical size={14} />
				</button>
				<span className="flex-1 truncate text-xs font-medium">{title}</span>
				<select
					value={tile.renderMode}
					onChange={(e) => onChangeRenderMode(e.target.value as RenderMode)}
					className="h-5 rounded border bg-transparent px-0.5 text-[10px] text-muted-foreground"
					title="Render mode"
				>
					{RENDER_MODES.map((mode) => (
						<option key={mode} value={mode}>
							{mode}
						</option>
					))}
				</select>
				{isHttp && (
					<Button
						variant={variablesOpen ? "secondary" : "ghost"}
						size="icon-xs"
						onClick={toggleVariables}
						title="Variables"
					>
						<SlidersHorizontal size={12} />
					</Button>
				)}
				{isHttp ? (
					<Button
						variant="ghost"
						size="icon-xs"
						onClick={() => onExecute(collectVariables())}
						disabled={executing}
						title="Execute"
					>
						<Play size={12} />
					</Button>
				) : isListenTile ? (
					<Button
						variant={listening ? "secondary" : "ghost"}
						size="icon-xs"
						onClick={onToggleListen}
						title={listening ? "Stop listening" : "Start listening"}
					>
						{listening ? (
							<Square size={12} className="text-red-500" />
						) : (
							<Play size={12} />
						)}
					</Button>
				) : (
					<Button
						variant="ghost"
						size="icon-xs"
						onClick={onFirebaseRun}
						disabled={executing}
						title={firebaseMode === "write" ? "Write" : "Read once"}
					>
						<Play size={12} />
					</Button>
				)}
				{onPromote && (
					<Button
						variant="ghost"
						size="icon-xs"
						onClick={onPromote}
						title="Save to registry"
					>
						<Save size={12} />
					</Button>
				)}
				<Button
					variant="ghost"
					size="icon-xs"
					onClick={onDelete}
					title="Remove tile"
				>
					<X size={12} />
				</Button>
			</div>

			{variablesOpen && (
				<div className="flex flex-col gap-1 border-b bg-muted/30 p-2">
					{variableRows.map((row, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: rows are positional editor state
						<div key={index} className="flex items-center gap-1">
							<Input
								value={row.key}
								onChange={(e) => setRow(index, { key: e.target.value })}
								placeholder="variable"
								className="h-6 max-w-28 text-xs"
							/>
							<Input
								value={row.value}
								onChange={(e) => setRow(index, { value: e.target.value })}
								placeholder="value"
								className="h-6 text-xs"
							/>
							<Button
								variant="ghost"
								size="icon-xs"
								onClick={() =>
									setVariableRows((rows) => rows.filter((_, i) => i !== index))
								}
							>
								<X size={10} />
							</Button>
						</div>
					))}
					<Button
						variant="ghost"
						size="sm"
						className="h-6 self-start text-xs"
						onClick={() =>
							setVariableRows((rows) => [...rows, { key: "", value: "" }])
						}
					>
						+ variable
					</Button>
				</div>
			)}

			<div className="flex-1 overflow-auto p-2">
				{resultError ? (
					<p className="text-xs text-destructive">{resultError}</p>
				) : (
					<RenderResult
						mode={tile.renderMode}
						data={currentUpdate?.data}
						highlightKeys={currentUpdate?.changedKeys}
					/>
				)}
			</div>

			{updates.length > 1 && (
				<div className="flex items-center justify-between border-t px-2 py-0.5 text-[10px] text-muted-foreground">
					<button
						type="button"
						onClick={() =>
							setScrubIndex((i) => Math.min(updates.length - 1, i + 1))
						}
						disabled={clampedIndex >= updates.length - 1}
						className="disabled:opacity-30"
						aria-label="Older update"
					>
						<ChevronLeft size={12} />
					</button>
					<span className="tabular-nums">
						{updates.length - clampedIndex}/{updates.length}
						{currentUpdate &&
							` · ${new Date(currentUpdate.at).toLocaleTimeString()}`}
					</span>
					<button
						type="button"
						onClick={() => setScrubIndex((i) => Math.max(0, i - 1))}
						disabled={clampedIndex === 0}
						className="disabled:opacity-30"
						aria-label="Newer update"
					>
						<ChevronRight size={12} />
					</button>
				</div>
			)}

			<button
				type="button"
				onPointerDown={onResizePointerDown}
				className="absolute right-0 bottom-0 size-3 cursor-nwse-resize touch-none rounded-tl border-t border-l bg-muted"
			/>
		</div>
	);
}
