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
