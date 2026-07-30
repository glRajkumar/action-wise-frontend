import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
	CELL_GAP,
	CELL_SIZE,
	GRID_COLUMNS,
	type PlaygroundTile,
	type RenderMode,
	type TileLayout,
	type TileUpdate,
} from "@/types/playground";
import type { FirebaseMode } from "@/types/resource";
import { TileCard } from "./tile-card";

const CELL = CELL_SIZE + CELL_GAP;

type Props = {
	tiles: PlaygroundTile[];
	getTitle: (tile: PlaygroundTile) => string;
	getKind: (tile: PlaygroundTile) => string | undefined;
	getFirebaseMode: (tile: PlaygroundTile) => FirebaseMode | undefined;
	getTemplateKeys: (tile: PlaygroundTile) => string[];
	executingTileId: string | null;
	listeningTileIds: Set<string>;
	updates: Record<string, TileUpdate[]>;
	errors: Record<string, string>;
	onExecute: (tile: PlaygroundTile, variables: Record<string, string>) => void;
	onFirebaseRun: (tile: PlaygroundTile) => void;
	onToggleListen: (tile: PlaygroundTile) => void;
	onChangeRenderMode: (tile: PlaygroundTile, mode: RenderMode) => void;
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
	getKind,
	getFirebaseMode,
	getTemplateKeys,
	executingTileId,
	listeningTileIds,
	updates,
	errors,
	onExecute,
	onFirebaseRun,
	onToggleListen,
	onChangeRenderMode,
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
						kind={getKind(tile)}
						firebaseMode={getFirebaseMode(tile)}
						executing={executingTileId === tile.id}
						listening={listeningTileIds.has(tile.id)}
						updates={updates[tile.id] ?? []}
						resultError={errors[tile.id]}
						templateKeys={getTemplateKeys(tile)}
						onExecute={(variables) => onExecute(tile, variables)}
						onFirebaseRun={() => onFirebaseRun(tile)}
						onToggleListen={() => onToggleListen(tile)}
						onChangeRenderMode={(mode) => onChangeRenderMode(tile, mode)}
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
