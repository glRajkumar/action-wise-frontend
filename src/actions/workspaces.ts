import { sendApiReq } from "@/services/api";
import type {
	Workspace,
	WorkspaceInvite,
	WorkspaceMember,
	WorkspaceRole,
	WorkspaceWithRole,
} from "@/types/workspace";

export function listWorkspaces() {
	return sendApiReq<WorkspaceWithRole[]>({ method: "GET", url: "/workspaces" });
}

export function createWorkspace(payload: { name: string }) {
	return sendApiReq<Workspace>({
		method: "POST",
		url: "/workspaces",
		data: payload,
	});
}

export function getWorkspace(workspaceId: string) {
	return sendApiReq<Workspace & { role: WorkspaceRole }>({
		method: "GET",
		url: `/workspaces/${workspaceId}`,
	});
}

export function renameWorkspace(payload: {
	workspaceId: string;
	name: string;
}) {
	return sendApiReq<Workspace>({
		method: "PATCH",
		url: `/workspaces/${payload.workspaceId}`,
		data: { name: payload.name },
	});
}

export function deleteWorkspace(workspaceId: string) {
	return sendApiReq<void>({
		method: "DELETE",
		url: `/workspaces/${workspaceId}`,
	});
}

export function listWorkspaceMembers(workspaceId: string) {
	return sendApiReq<WorkspaceMember[]>({
		method: "GET",
		url: `/workspaces/${workspaceId}/members`,
	});
}

export function changeMemberRole(payload: {
	workspaceId: string;
	userId: string;
	role: WorkspaceRole;
}) {
	return sendApiReq<WorkspaceMember>({
		method: "PATCH",
		url: `/workspaces/${payload.workspaceId}/members/${payload.userId}`,
		data: { role: payload.role },
	});
}

export function removeMember(payload: { workspaceId: string; userId: string }) {
	return sendApiReq<void>({
		method: "DELETE",
		url: `/workspaces/${payload.workspaceId}/members/${payload.userId}`,
	});
}

export function listInvites(workspaceId: string) {
	return sendApiReq<WorkspaceInvite[]>({
		method: "GET",
		url: `/workspaces/${workspaceId}/invites`,
	});
}

export function createInvite(payload: {
	workspaceId: string;
	email: string;
	role: WorkspaceRole;
}) {
	return sendApiReq<WorkspaceInvite>({
		method: "POST",
		url: `/workspaces/${payload.workspaceId}/invites`,
		data: { email: payload.email, role: payload.role },
	});
}

export function revokeInvite(payload: {
	workspaceId: string;
	inviteId: string;
}) {
	return sendApiReq<void>({
		method: "DELETE",
		url: `/workspaces/${payload.workspaceId}/invites/${payload.inviteId}`,
	});
}

export function acceptInvite(token: string) {
	return sendApiReq<{ workspaceId: string }>({
		method: "POST",
		url: `/workspaces/invites/${token}/accept`,
	});
}
