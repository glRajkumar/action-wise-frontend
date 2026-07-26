import { sendApiReq } from "@/services/api";
import type {
	Resource,
	ResourceDanger,
	ResourceDirection,
	ResourceFolder,
	ResourceKind,
} from "@/types/resource";

export function listFolders(workspaceId: string) {
	return sendApiReq<ResourceFolder[]>({
		method: "GET",
		url: `/workspaces/${workspaceId}/resource-folders`,
	});
}

export function createFolder(payload: {
	workspaceId: string;
	name: string;
	parentFolderId?: string | null;
}) {
	return sendApiReq<ResourceFolder>({
		method: "POST",
		url: `/workspaces/${payload.workspaceId}/resource-folders`,
		data: { name: payload.name, parentFolderId: payload.parentFolderId },
	});
}

export function updateFolder(payload: {
	workspaceId: string;
	folderId: string;
	name: string;
	parentFolderId?: string | null;
}) {
	return sendApiReq<ResourceFolder>({
		method: "PATCH",
		url: `/workspaces/${payload.workspaceId}/resource-folders/${payload.folderId}`,
		data: { name: payload.name, parentFolderId: payload.parentFolderId },
	});
}

export function deleteFolder(payload: {
	workspaceId: string;
	folderId: string;
}) {
	return sendApiReq<{ message: string }>({
		method: "DELETE",
		url: `/workspaces/${payload.workspaceId}/resource-folders/${payload.folderId}`,
	});
}

export type ResourceInput = {
	kind: ResourceKind;
	name: string;
	folderId?: string | null;
	connectionId: string;
	direction: ResourceDirection;
	danger: ResourceDanger;
	address: string;
	payloadTemplate?: unknown;
	config: unknown;
};

export function listResources(payload: {
	workspaceId: string;
	folderId?: string;
}) {
	return sendApiReq<Resource[]>({
		method: "GET",
		url: `/workspaces/${payload.workspaceId}/resources`,
		params: payload.folderId ? { folderId: payload.folderId } : undefined,
	});
}

export function createResource(
	payload: { workspaceId: string } & ResourceInput,
) {
	const { workspaceId, ...data } = payload;
	return sendApiReq<Resource>({
		method: "POST",
		url: `/workspaces/${workspaceId}/resources`,
		data,
	});
}

export function updateResource(
	payload: { workspaceId: string; resourceId: string } & ResourceInput,
) {
	const { workspaceId, resourceId, ...data } = payload;
	return sendApiReq<Resource>({
		method: "PATCH",
		url: `/workspaces/${workspaceId}/resources/${resourceId}`,
		data,
	});
}

export function deleteResource(payload: {
	workspaceId: string;
	resourceId: string;
}) {
	return sendApiReq<{ message: string }>({
		method: "DELETE",
		url: `/workspaces/${payload.workspaceId}/resources/${payload.resourceId}`,
	});
}

export function exportResourceType(payload: {
	workspaceId: string;
	resourceId: string;
}) {
	return sendApiReq<{ typeName: string; source: string; sampleCount: number }>({
		method: "GET",
		url: `/workspaces/${payload.workspaceId}/resources/${payload.resourceId}/export-type`,
	});
}

export function generateFakeData(payload: {
	workspaceId: string;
	resourceId: string;
	count: number;
}) {
	return sendApiReq<unknown[]>({
		method: "POST",
		url: `/workspaces/${payload.workspaceId}/resources/${payload.resourceId}/fake-data`,
		data: { count: payload.count },
	});
}
