import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createFolder,
	createResource,
	deleteFolder,
	deleteResource,
	exportResourceType,
	generateFakeData,
	listFolders,
	listResources,
	updateFolder,
	updateResource,
} from "@/actions/resources";
import { useToast } from "@/components/ui/toast";

export const foldersKey = (workspaceId: string) => [
	"resource-folders",
	workspaceId,
];
export const resourcesKey = (workspaceId: string, folderId?: string) => [
	"resources",
	workspaceId,
	folderId ?? null,
];

export function useFolders(workspaceId: string | undefined) {
	return useQuery({
		queryKey: foldersKey(workspaceId ?? ""),
		queryFn: () => listFolders(workspaceId as string),
		enabled: !!workspaceId,
	});
}

export function useCreateFolder(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: createFolder,
		onSuccess() {
			qc.invalidateQueries({ queryKey: foldersKey(workspaceId) });
			toast.success("Folder created");
		},
		onError(error) {
			toast.error(error?.message || "Failed to create folder");
		},
	});
}

export function useUpdateFolder(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: updateFolder,
		onSuccess() {
			qc.invalidateQueries({ queryKey: foldersKey(workspaceId) });
			toast.success("Folder updated");
		},
		onError(error) {
			toast.error(error?.message || "Failed to update folder");
		},
	});
}

export function useDeleteFolder(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: deleteFolder,
		onSuccess() {
			qc.invalidateQueries({ queryKey: foldersKey(workspaceId) });
			qc.invalidateQueries({ queryKey: ["resources", workspaceId] });
			toast.success("Folder deleted");
		},
		onError(error) {
			toast.error(error?.message || "Failed to delete folder");
		},
	});
}

export function useResources(
	workspaceId: string | undefined,
	folderId?: string,
) {
	return useQuery({
		queryKey: resourcesKey(workspaceId ?? "", folderId),
		queryFn: () =>
			listResources({ workspaceId: workspaceId as string, folderId }),
		enabled: !!workspaceId,
	});
}

export function useCreateResource(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: createResource,
		onSuccess() {
			qc.invalidateQueries({ queryKey: ["resources", workspaceId] });
			toast.success("Resource created");
		},
		onError(error) {
			toast.error(error?.message || "Failed to create resource");
		},
	});
}

export function useUpdateResource(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: updateResource,
		onSuccess() {
			qc.invalidateQueries({ queryKey: ["resources", workspaceId] });
			toast.success("Resource updated");
		},
		onError(error) {
			toast.error(error?.message || "Failed to update resource");
		},
	});
}

export function useDeleteResource(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: deleteResource,
		onSuccess() {
			qc.invalidateQueries({ queryKey: ["resources", workspaceId] });
			toast.success("Resource deleted");
		},
		onError(error) {
			toast.error(error?.message || "Failed to delete resource");
		},
	});
}

export function useExportResourceType() {
	const toast = useToast();

	return useMutation({
		mutationFn: exportResourceType,
		onError(error) {
			toast.error(error?.message || "Failed to export type");
		},
	});
}

export function useGenerateFakeData() {
	const toast = useToast();

	return useMutation({
		mutationFn: generateFakeData,
		onError(error) {
			toast.error(error?.message || "Failed to generate fake data");
		},
	});
}
