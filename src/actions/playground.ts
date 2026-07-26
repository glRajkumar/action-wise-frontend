import { sendApiReq } from "@/services/api";
import type {
	HttpExecutionResult,
	PlaygroundBoard,
	PlaygroundTile,
	RenderMode,
	TileLayout,
} from "@/types/playground";
import type { Resource } from "@/types/resource";

export function listBoards(workspaceId: string) {
	return sendApiReq<PlaygroundBoard[]>({
		method: "GET",
		url: `/workspaces/${workspaceId}/playground/boards`,
	});
}

export function createBoard(payload: { workspaceId: string; name?: string }) {
	return sendApiReq<PlaygroundBoard>({
		method: "POST",
		url: `/workspaces/${payload.workspaceId}/playground/boards`,
		data: payload.name ? { name: payload.name } : {},
	});
}

export function deleteBoard(payload: { workspaceId: string; boardId: string }) {
	return sendApiReq<{ message: string }>({
		method: "DELETE",
		url: `/workspaces/${payload.workspaceId}/playground/boards/${payload.boardId}`,
	});
}

export function listTiles(payload: { workspaceId: string; boardId: string }) {
	return sendApiReq<PlaygroundTile[]>({
		method: "GET",
		url: `/workspaces/${payload.workspaceId}/playground/boards/${payload.boardId}/tiles`,
	});
}

export type CreateTileInput = {
	workspaceId: string;
	boardId: string;
	resourceId?: string;
	adhocConfig?: Record<string, unknown>;
	layout: TileLayout;
	renderMode: RenderMode;
};

export function createTile(payload: CreateTileInput) {
	const { workspaceId, boardId, ...data } = payload;
	return sendApiReq<PlaygroundTile>({
		method: "POST",
		url: `/workspaces/${workspaceId}/playground/boards/${boardId}/tiles`,
		data,
	});
}

export function updateTile(payload: {
	workspaceId: string;
	tileId: string;
	layout?: TileLayout;
	renderMode?: RenderMode;
	adhocConfig?: Record<string, unknown>;
}) {
	const { workspaceId, tileId, ...data } = payload;
	return sendApiReq<PlaygroundTile>({
		method: "PATCH",
		url: `/workspaces/${workspaceId}/playground/tiles/${tileId}`,
		data,
	});
}

export function deleteTile(payload: { workspaceId: string; tileId: string }) {
	return sendApiReq<{ message: string }>({
		method: "DELETE",
		url: `/workspaces/${payload.workspaceId}/playground/tiles/${payload.tileId}`,
	});
}

export function executeTile(payload: {
	workspaceId: string;
	tileId: string;
	variables?: Record<string, string>;
}) {
	return sendApiReq<HttpExecutionResult>({
		method: "POST",
		url: `/workspaces/${payload.workspaceId}/playground/tiles/${payload.tileId}/execute`,
		data: { variables: payload.variables ?? {} },
	});
}

export function logFirebaseRun(payload: {
	workspaceId: string;
	tileId: string;
	request: unknown;
	response?: unknown;
	status: "success" | "error";
	durationMs?: number;
}) {
	const { workspaceId, tileId, ...data } = payload;
	return sendApiReq({
		method: "POST",
		url: `/workspaces/${workspaceId}/playground/tiles/${tileId}/runs`,
		data,
	});
}

export function promoteTile(payload: {
	workspaceId: string;
	tileId: string;
	name: string;
	folderId?: string | null;
	direction: string;
	danger: string;
}) {
	const { workspaceId, tileId, ...data } = payload;
	return sendApiReq<{ resource: Resource; tile: PlaygroundTile }>({
		method: "POST",
		url: `/workspaces/${workspaceId}/playground/tiles/${tileId}/promote`,
		data,
	});
}
