import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createBoard,
	createTile,
	deleteBoard,
	deleteTile,
	executeTile,
	listBoards,
	listTiles,
	logFirebaseRun,
	promoteTile,
	updateTile,
} from "@/actions/playground";
import { useToast } from "@/components/ui/toast";

export const boardsKey = (workspaceId: string) => [
	"playground-boards",
	workspaceId,
];
export const tilesKey = (workspaceId: string, boardId: string) => [
	"playground-tiles",
	workspaceId,
	boardId,
];

export function useBoards(workspaceId: string | undefined) {
	return useQuery({
		queryKey: boardsKey(workspaceId ?? ""),
		queryFn: () => listBoards(workspaceId as string),
		enabled: !!workspaceId,
	});
}

export function useCreateBoard(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: createBoard,
		onSuccess() {
			qc.invalidateQueries({ queryKey: boardsKey(workspaceId) });
			toast.success("Board created");
		},
		onError(error) {
			toast.error(error?.message || "Failed to create board");
		},
	});
}

export function useDeleteBoard(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: deleteBoard,
		onSuccess() {
			qc.invalidateQueries({ queryKey: boardsKey(workspaceId) });
			toast.success("Board deleted");
		},
		onError(error) {
			toast.error(error?.message || "Failed to delete board");
		},
	});
}

export function useTiles(
	workspaceId: string | undefined,
	boardId: string | undefined,
) {
	return useQuery({
		queryKey: tilesKey(workspaceId ?? "", boardId ?? ""),
		queryFn: () =>
			listTiles({
				workspaceId: workspaceId as string,
				boardId: boardId as string,
			}),
		enabled: !!workspaceId && !!boardId,
	});
}

export function useCreateTile(workspaceId: string, boardId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: createTile,
		onSuccess() {
			qc.invalidateQueries({ queryKey: tilesKey(workspaceId, boardId) });
		},
		onError(error) {
			toast.error(error?.message || "Failed to create tile");
		},
	});
}

export function useUpdateTile(workspaceId: string, boardId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: updateTile,
		onSuccess() {
			qc.invalidateQueries({ queryKey: tilesKey(workspaceId, boardId) });
		},
		onError(error) {
			toast.error(error?.message || "Failed to update tile");
		},
	});
}

export function useDeleteTile(workspaceId: string, boardId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: deleteTile,
		onSuccess() {
			qc.invalidateQueries({ queryKey: tilesKey(workspaceId, boardId) });
			toast.success("Tile removed");
		},
		onError(error) {
			toast.error(error?.message || "Failed to remove tile");
		},
	});
}

export function useExecuteTile() {
	const toast = useToast();

	return useMutation({
		mutationFn: executeTile,
		onError(error) {
			toast.error(error?.message || "Request failed");
		},
	});
}

// No success toast: listener fires log a run each event and would spam.
export function useLogFirebaseRun() {
	const toast = useToast();

	return useMutation({
		mutationFn: logFirebaseRun,
		onError(error) {
			toast.error(error?.message || "Failed to record run");
		},
	});
}

export function usePromoteTile(workspaceId: string, boardId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: promoteTile,
		onSuccess() {
			qc.invalidateQueries({ queryKey: tilesKey(workspaceId, boardId) });
			qc.invalidateQueries({ queryKey: ["resources", workspaceId] });
			toast.success("Saved to registry");
		},
		onError(error) {
			toast.error(error?.message || "Failed to save to registry");
		},
	});
}
