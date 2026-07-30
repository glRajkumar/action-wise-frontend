export type RenderMode = "json_tree" | "table" | "raw" | "big_number";

export type TileLayout = { x: number; y: number; w: number; h: number };

export type PlaygroundBoard = {
	id: string;
	workspaceId: string;
	userId: string;
	name: string;
	createdAt: string;
	updatedAt: string;
};

export type PlaygroundTile = {
	id: string;
	boardId: string;
	resourceId: string | null;
	adhocConfig: Record<string, unknown> | null;
	layout: TileLayout;
	renderMode: RenderMode;
	position: number;
	createdAt: string;
	updatedAt: string;
};

export type HttpExecutionResult = {
	status: number;
	headers: Record<string, string>;
	body: unknown;
	durationMs: number;
};

export const RENDER_MODES: RenderMode[] = [
	"json_tree",
	"table",
	"raw",
	"big_number",
];

// Grid geometry shared by the board canvas and the drag/resize math — 12
// columns per handover D, fixed row height in px, tiles snap to whole cells.
export const GRID_COLUMNS = 12;
export const CELL_SIZE = 90;
export const CELL_GAP = 8;

// Per-tile in-memory ring buffer of the last N updates (handover D). Never
// persisted — refreshing the page clears it, see ../../DECISIONS.md.
export const RING_BUFFER_SIZE = 50;

export type TileUpdate = {
	at: number;
	data: unknown;
	changedKeys: string[];
};

// Top-level keys whose value changed between two consecutive object payloads,
// plus keys added or removed. Non-object payloads diff as "no keys".
export function diffTopLevelKeys(previous: unknown, next: unknown): string[] {
	const isRecord = (value: unknown): value is Record<string, unknown> =>
		typeof value === "object" && value !== null && !Array.isArray(value);
	if (!isRecord(previous) || !isRecord(next)) return [];

	const keys = new Set([...Object.keys(previous), ...Object.keys(next)]);
	return [...keys].filter(
		(key) => JSON.stringify(previous[key]) !== JSON.stringify(next[key]),
	);
}

export function pushTileUpdate(
	updates: TileUpdate[],
	data: unknown,
): TileUpdate[] {
	const changedKeys =
		updates.length > 0 ? diffTopLevelKeys(updates[0].data, data) : [];
	return [{ at: Date.now(), data, changedKeys }, ...updates].slice(
		0,
		RING_BUFFER_SIZE,
	);
}

export function nextTilePosition(tiles: PlaygroundTile[]): TileLayout {
	const maxRow = tiles.reduce(
		(max, tile) => Math.max(max, tile.layout.y + tile.layout.h),
		0,
	);
	return { x: 0, y: maxRow, w: 4, h: 3 };
}
