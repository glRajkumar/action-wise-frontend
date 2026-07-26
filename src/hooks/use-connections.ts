import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createConnection,
	deleteConnection,
	deleteConnectionSecret,
	listConnections,
	setConnectionSecret,
	updateConnection,
} from "@/actions/connections";
import { useToast } from "@/components/ui/toast";

export const connectionsKey = (workspaceId: string) => [
	"connections",
	workspaceId,
];

export function useConnections(workspaceId: string | undefined) {
	return useQuery({
		queryKey: connectionsKey(workspaceId ?? ""),
		queryFn: () => listConnections(workspaceId as string),
		enabled: !!workspaceId,
	});
}

export function useCreateConnection(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: createConnection,
		onSuccess() {
			qc.invalidateQueries({ queryKey: connectionsKey(workspaceId) });
			toast.success("Connection created");
		},
		onError(error) {
			toast.error(error?.message || "Failed to create connection");
		},
	});
}

export function useUpdateConnection(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: updateConnection,
		onSuccess() {
			qc.invalidateQueries({ queryKey: connectionsKey(workspaceId) });
			toast.success("Connection updated");
		},
		onError(error) {
			toast.error(error?.message || "Failed to update connection");
		},
	});
}

export function useDeleteConnection(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: deleteConnection,
		onSuccess() {
			qc.invalidateQueries({ queryKey: connectionsKey(workspaceId) });
			toast.success("Connection deleted");
		},
		onError(error) {
			toast.error(error?.message || "Failed to delete connection");
		},
	});
}

export function useSetConnectionSecret(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: setConnectionSecret,
		onSuccess() {
			qc.invalidateQueries({ queryKey: connectionsKey(workspaceId) });
			toast.success("Secret saved");
		},
		onError(error) {
			toast.error(error?.message || "Failed to save secret");
		},
	});
}

export function useDeleteConnectionSecret(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: deleteConnectionSecret,
		onSuccess() {
			qc.invalidateQueries({ queryKey: connectionsKey(workspaceId) });
			toast.success("Secret removed");
		},
		onError(error) {
			toast.error(error?.message || "Failed to remove secret");
		},
	});
}
