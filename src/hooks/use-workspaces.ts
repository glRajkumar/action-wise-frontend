import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	acceptInvite,
	changeMemberRole,
	createInvite,
	createWorkspace,
	deleteWorkspace,
	getWorkspace,
	listInvites,
	listWorkspaceMembers,
	listWorkspaces,
	removeMember,
	renameWorkspace,
	revokeInvite,
} from "@/actions/workspaces";
import { useToast } from "@/components/ui/toast";

export const WORKSPACES_KEY = ["workspaces"];
export const workspaceKey = (workspaceId: string) => [
	"workspaces",
	workspaceId,
];
export const workspaceMembersKey = (workspaceId: string) => [
	"workspaces",
	workspaceId,
	"members",
];
export const workspaceInvitesKey = (workspaceId: string) => [
	"workspaces",
	workspaceId,
	"invites",
];

export function useWorkspaces() {
	return useQuery({
		queryKey: WORKSPACES_KEY,
		queryFn: listWorkspaces,
	});
}

export function useWorkspace(workspaceId: string | undefined) {
	return useQuery({
		queryKey: workspaceKey(workspaceId ?? ""),
		queryFn: () => getWorkspace(workspaceId as string),
		enabled: !!workspaceId,
	});
}

export function useCreateWorkspace() {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: createWorkspace,
		onSuccess() {
			qc.invalidateQueries({ queryKey: WORKSPACES_KEY });
			toast.success("Workspace created");
		},
		onError(error) {
			toast.error(error?.message || "Failed to create workspace");
		},
	});
}

export function useRenameWorkspace() {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: renameWorkspace,
		onSuccess(workspace) {
			qc.invalidateQueries({ queryKey: WORKSPACES_KEY });
			qc.invalidateQueries({ queryKey: workspaceKey(workspace.id) });
			toast.success("Workspace renamed");
		},
		onError(error) {
			toast.error(error?.message || "Failed to rename workspace");
		},
	});
}

export function useDeleteWorkspace() {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: deleteWorkspace,
		onSuccess() {
			qc.invalidateQueries({ queryKey: WORKSPACES_KEY });
			toast.success("Workspace deleted");
		},
		onError(error) {
			toast.error(error?.message || "Failed to delete workspace");
		},
	});
}

export function useWorkspaceMembers(workspaceId: string) {
	return useQuery({
		queryKey: workspaceMembersKey(workspaceId),
		queryFn: () => listWorkspaceMembers(workspaceId),
	});
}

export function useChangeMemberRole(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: changeMemberRole,
		onSuccess() {
			qc.invalidateQueries({ queryKey: workspaceMembersKey(workspaceId) });
			toast.success("Member role updated");
		},
		onError(error) {
			toast.error(error?.message || "Failed to change member role");
		},
	});
}

export function useRemoveMember(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: removeMember,
		onSuccess() {
			qc.invalidateQueries({ queryKey: workspaceMembersKey(workspaceId) });
			toast.success("Member removed");
		},
		onError(error) {
			toast.error(error?.message || "Failed to remove member");
		},
	});
}

export function useInvites(workspaceId: string) {
	return useQuery({
		queryKey: workspaceInvitesKey(workspaceId),
		queryFn: () => listInvites(workspaceId),
	});
}

export function useCreateInvite(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: createInvite,
		onSuccess() {
			qc.invalidateQueries({ queryKey: workspaceInvitesKey(workspaceId) });
			toast.success("Invite sent");
		},
		onError(error) {
			toast.error(error?.message || "Failed to send invite");
		},
	});
}

export function useRevokeInvite(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: revokeInvite,
		onSuccess() {
			qc.invalidateQueries({ queryKey: workspaceInvitesKey(workspaceId) });
			toast.success("Invite revoked");
		},
		onError(error) {
			toast.error(error?.message || "Failed to revoke invite");
		},
	});
}

export function useAcceptInvite() {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: acceptInvite,
		onSuccess() {
			qc.invalidateQueries({ queryKey: WORKSPACES_KEY });
			toast.success("Invite accepted");
		},
		onError(error) {
			toast.error(error?.message || "Failed to accept invite");
		},
	});
}
