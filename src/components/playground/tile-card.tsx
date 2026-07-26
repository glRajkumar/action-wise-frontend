import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Play, Save, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	CELL_GAP,
	CELL_SIZE,
	GRID_COLUMNS,
	type PlaygroundTile,
} from "@/types/playground";
import { RenderResult } from "./render-result";

type Props = {
	tile: PlaygroundTile;
	title: string;
	canExecute: boolean;
	executing: boolean;
	result: unknown;
	resultError?: string;
	onExecute: () => void;
	onLogFirebaseRun: () => void;
	onPromote?: () => void;
	onDelete: () => void;
	onResize: (w: number, h: number) => void;
};

const CELL = CELL_SIZE + CELL_GAP;

export function TileCard({
	tile,
	title,
	canExecute,
	executing,
	result,
	resultError,
	onExecute,
	onLogFirebaseRun,
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

	const w = liveSize?.w ?? tile.layout.w;
	const h = liveSize?.h ?? tile.layout.h;

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
				{canExecute ? (
					<Button
						variant="ghost"
						size="icon-xs"
						onClick={onExecute}
						disabled={executing}
						title="Execute"
					>
						<Play size={12} />
					</Button>
				) : (
					<Button
						variant="ghost"
						size="icon-xs"
						onClick={onLogFirebaseRun}
						title="Log a run"
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

			<div className="flex-1 overflow-auto p-2">
				{resultError ? (
					<p className="text-xs text-destructive">{resultError}</p>
				) : (
					<RenderResult mode={tile.renderMode} data={result} />
				)}
			</div>

			<button
				type="button"
				onPointerDown={onResizePointerDown}
				className="absolute right-0 bottom-0 size-3 cursor-nwse-resize touch-none rounded-tl border-t border-l bg-muted"
			/>
		</div>
	);
}
