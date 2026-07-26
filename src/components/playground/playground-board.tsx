import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";

import {
	CELL_GAP,
	CELL_SIZE,
	GRID_COLUMNS,
	type PlaygroundTile,
	type TileLayout,
} from "@/types/playground";
import { TileCard } from "./tile-card";

const CELL = CELL_SIZE + CELL_GAP;

type Props = {
	tiles: PlaygroundTile[];
	getTitle: (tile: PlaygroundTile) => string;
	canExecute: (tile: PlaygroundTile) => boolean;
	executingTileId: string | null;
	results: Record<string, unknown>;
	errors: Record<string, string>;
	onExecute: (tile: PlaygroundTile) => void;
	onLogFirebaseRun: (tile: PlaygroundTile) => void;
	onPromote: (tile: PlaygroundTile) => void;
	onDelete: (tile: PlaygroundTile) => void;
	onLayoutChange: (tileId: string, layout: TileLayout) => void;
};

// Drag-to-reposition (dnd-kit) with grid snapping, plus custom pointer-based
// resize (dnd-kit has no resize primitive). No collision/auto-rearrange
// between overlapping tiles in this pass — see ../../../DECISIONS.md.
export function PlaygroundBoard({
	tiles,
	getTitle,
	canExecute,
	executingTileId,
	results,
	errors,
	onExecute,
	onLogFirebaseRun,
	onPromote,
	onDelete,
	onLayoutChange,
}: Props) {
	const maxRow = tiles.reduce(
		(max, tile) => Math.max(max, tile.layout.y + tile.layout.h),
		8,
	);

	function onDragEnd(event: DragEndEvent) {
		const tile = tiles.find((t) => t.id === event.active.id);
		if (!tile) return;

		const deltaXCells = Math.round(event.delta.x / CELL);
		const deltaYCells = Math.round(event.delta.y / CELL);
		const x = Math.min(
			GRID_COLUMNS - tile.layout.w,
			Math.max(0, tile.layout.x + deltaXCells),
		);
		const y = Math.max(0, tile.layout.y + deltaYCells);

		if (x !== tile.layout.x || y !== tile.layout.y) {
			onLayoutChange(tile.id, { ...tile.layout, x, y });
		}
	}

	return (
		<DndContext onDragEnd={onDragEnd} modifiers={[restrictToParentElement]}>
			<div
				className="relative rounded-lg border border-dashed bg-muted/20"
				style={{
					width: GRID_COLUMNS * CELL_SIZE + (GRID_COLUMNS - 1) * CELL_GAP,
					height: Math.max(maxRow, 8) * CELL,
					minHeight: 400,
				}}
			>
				{tiles.map((tile) => (
					<TileCard
						key={tile.id}
						tile={tile}
						title={getTitle(tile)}
						canExecute={canExecute(tile)}
						executing={executingTileId === tile.id}
						result={results[tile.id]}
						resultError={errors[tile.id]}
						onExecute={() => onExecute(tile)}
						onLogFirebaseRun={() => onLogFirebaseRun(tile)}
						onPromote={tile.resourceId ? undefined : () => onPromote(tile)}
						onDelete={() => onDelete(tile)}
						onResize={(w, h) =>
							onLayoutChange(tile.id, { ...tile.layout, w, h })
						}
					/>
				))}
			</div>
		</DndContext>
	);
}
