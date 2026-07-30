export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export type Workspace = {
	id: string;
	name: string;
	visibility: "private" | "link";
	createdAt: string;
	updatedAt: string;
	createdBy: string;
};

export type WorkspaceWithRole = Workspace & { role: WorkspaceRole };

export type WorkspaceMember = {
	userId: string;
	name: string;
	email: string;
	role: WorkspaceRole;
	createdAt: string;
};

export type WorkspaceInviteStatus = "pending" | "accepted" | "revoked";

export type WorkspaceInvite = {
	id: string;
	workspaceId: string;
	email: string;
	role: WorkspaceRole;
	status: WorkspaceInviteStatus;
	invitedBy: string;
	expiresAt: string;
	createdAt: string;
	updatedAt: string;
	// Only present in the create-invite response — the backend's invite email
	// is a console-logging stub (no real email provider yet), so this is
	// currently the only way to get the token to hand to the invitee.
	token?: string;
};

export const WORKSPACE_ROLES: WorkspaceRole[] = [
	"owner",
	"admin",
	"editor",
	"viewer",
];

export function canManageWorkspace(role: WorkspaceRole): boolean {
	return role === "owner" || role === "admin";
}
