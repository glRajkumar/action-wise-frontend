import { zodResolver } from "@hookform/resolvers/zod";
import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import { Plus, Trash2, UserMinus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, buttonVariants } from "@/components/ui/button";
import { DialogWrapper } from "@/components/ui/dialog";
import { SelectWrapper as SelectField } from "@/components/ui/field-wrapper";
import { InputWrapper, SelectWrapper } from "@/components/ui/field-wrapper-rhf";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import {
	useChangeMemberRole,
	useCreateInvite,
	useDeleteWorkspace,
	useInvites,
	useRemoveMember,
	useRenameWorkspace,
	useRevokeInvite,
	useWorkspace,
	useWorkspaceMembers,
} from "@/hooks/use-workspaces";
import { useCurrentWorkspaceStore } from "@/store/current-workspace";
import {
	canManageWorkspace,
	WORKSPACE_ROLES,
	type WorkspaceInvite,
	type WorkspaceRole,
} from "@/types/workspace";
import {
	type InviteMemberFormData,
	inviteMemberSchema,
	type WorkspaceNameFormData,
	workspaceNameSchema,
} from "@/utils/schemas";

export const Route = createFileRoute("/_app/workspaces/$workspaceId")({
	component: WorkspaceDetailPage,
});

const ROLE_ITEMS: itemT[] = WORKSPACE_ROLES.map((role) => ({
	label: role,
	value: role,
}));
const INVITE_ROLE_ITEMS = ROLE_ITEMS.filter((item) => item.value !== "owner");

function WorkspaceDetailPage() {
	const { workspaceId } = useParams({ from: "/_app/workspaces/$workspaceId" });
	const navigate = useNavigate();
	const setActiveWorkspaceId = useCurrentWorkspaceStore(
		(s) => s.setActiveWorkspaceId,
	);

	const { data: workspace, isLoading } = useWorkspace(workspaceId);
	const { data: members } = useWorkspaceMembers(workspaceId);
	const { data: invites } = useInvites(workspaceId);

	const renameMutation = useRenameWorkspace();
	const deleteMutation = useDeleteWorkspace();
	const changeRoleMutation = useChangeMemberRole(workspaceId);
	const removeMemberMutation = useRemoveMember(workspaceId);
	const createInviteMutation = useCreateInvite(workspaceId);
	const revokeInviteMutation = useRevokeInvite(workspaceId);

	const [renameOpen, setRenameOpen] = useState(false);
	const [inviteOpen, setInviteOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [createdInvite, setCreatedInvite] = useState<WorkspaceInvite | null>(
		null,
	);

	const renameForm = useForm<WorkspaceNameFormData>({
		resolver: zodResolver(workspaceNameSchema),
		values: { name: workspace?.name ?? "" },
	});

	const inviteForm = useForm<InviteMemberFormData>({
		resolver: zodResolver(inviteMemberSchema),
		defaultValues: { email: "", role: "editor" },
	});

	if (isLoading)
		return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
	if (!workspace)
		return (
			<p className="p-6 text-sm text-muted-foreground">Workspace not found.</p>
		);

	const canManage = canManageWorkspace(workspace.role);
	const isOwner = workspace.role === "owner";

	function onRename(data: WorkspaceNameFormData) {
		renameMutation.mutate(
			{ workspaceId, name: data.name },
			{ onSuccess: () => setRenameOpen(false) },
		);
	}

	function onInvite(data: InviteMemberFormData) {
		createInviteMutation.mutate(
			{ workspaceId, email: data.email, role: data.role as WorkspaceRole },
			{
				onSuccess: (invite) => {
					setCreatedInvite(invite);
					setInviteOpen(false);
					inviteForm.reset();
				},
			},
		);
	}

	function onDelete() {
		deleteMutation.mutate(workspaceId, {
			onSuccess: () => {
				setActiveWorkspaceId(null);
				navigate({ to: "/workspaces" });
			},
		});
	}

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-8 p-6">
			<div className="flex items-start justify-between">
				<div>
					<h1 className="text-lg font-semibold">{workspace.name}</h1>
					<p className="text-sm text-muted-foreground capitalize">
						Your role: {workspace.role}
					</p>
				</div>

				{canManage && (
					<div className="flex gap-2">
						<DialogWrapper
							open={renameOpen}
							onOpenChange={setRenameOpen}
							trigger={<Button variant="outline">Rename</Button>}
							title="Rename workspace"
							action="Save"
							onAction={renameForm.handleSubmit(onRename)}
							loading={renameMutation.isPending}
						>
							<InputWrapper
								name="name"
								control={renameForm.control}
								label="Name"
							/>
						</DialogWrapper>

						{isOwner && (
							<DialogWrapper
								open={deleteOpen}
								onOpenChange={setDeleteOpen}
								trigger={
									<Button variant="destructive">
										<Trash2 size={15} /> Delete
									</Button>
								}
								title="Delete workspace"
								description="This permanently deletes the workspace and everything in it. This can't be undone."
								action="Delete"
								actionCls={buttonVariants({ variant: "destructive" })}
								loading={deleteMutation.isPending}
								onAction={onDelete}
							/>
						)}
					</div>
				)}
			</div>

			<section className="flex flex-col gap-3">
				<h2 className="text-sm font-medium">Members</h2>
				<ItemGroup>
					{members?.map((member) => (
						<Item key={member.userId} variant="outline">
							<ItemContent>
								<ItemTitle>{member.name}</ItemTitle>
								<ItemDescription>
									{member.email} · member since{" "}
									{new Date(member.createdAt).toLocaleDateString()}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								{canManage ? (
									<>
										<SelectField
											name={`role-${member.userId}`}
											items={ROLE_ITEMS}
											value={member.role}
											onValueChange={(value) =>
												changeRoleMutation.mutate({
													workspaceId,
													userId: member.userId,
													role: value as WorkspaceRole,
												})
											}
										/>
										<Button
											variant="ghost"
											size="icon"
											onClick={() =>
												removeMemberMutation.mutate({
													workspaceId,
													userId: member.userId,
												})
											}
										>
											<UserMinus size={15} />
										</Button>
									</>
								) : (
									<span className="text-sm text-muted-foreground capitalize">
										{member.role}
									</span>
								)}
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
			</section>

			{canManage && (
				<section className="flex flex-col gap-3">
					<div className="flex items-center justify-between">
						<h2 className="text-sm font-medium">Invites</h2>
						<DialogWrapper
							open={inviteOpen}
							onOpenChange={setInviteOpen}
							trigger={
								<Button variant="outline">
									<Plus size={15} /> Invite
								</Button>
							}
							title="Invite a teammate"
							action="Send invite"
							onAction={inviteForm.handleSubmit(onInvite)}
							loading={createInviteMutation.isPending}
						>
							<div className="flex flex-col gap-4">
								<InputWrapper
									name="email"
									control={inviteForm.control}
									label="Email"
									type="email"
								/>
								<SelectWrapper
									name="role"
									control={inviteForm.control}
									label="Role"
									items={INVITE_ROLE_ITEMS}
								/>
							</div>
						</DialogWrapper>
					</div>

					{createdInvite && (
						<div className="flex items-center justify-between gap-2 rounded-md bg-muted p-3 text-sm">
							<span className="break-all">
								Invited <strong>{createdInvite.email}</strong> — email sending
								isn't wired up yet, share this accept token:{" "}
								<span className="font-mono">{createdInvite.token}</span>
							</span>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setCreatedInvite(null)}
							>
								<X size={14} />
							</Button>
						</div>
					)}

					<ItemGroup>
						{invites?.map((invite) => (
							<Item key={invite.id} variant="outline">
								<ItemContent>
									<ItemTitle>{invite.email}</ItemTitle>
									<ItemDescription className="capitalize">
										{invite.role} · {invite.status}
									</ItemDescription>
								</ItemContent>
								<ItemActions>
									{invite.status === "pending" && (
										<Button
											variant="ghost"
											size="icon"
											onClick={() =>
												revokeInviteMutation.mutate({
													workspaceId,
													inviteId: invite.id,
												})
											}
										>
											<X size={15} />
										</Button>
									)}
								</ItemActions>
							</Item>
						))}
						{invites?.length === 0 && (
							<p className="text-sm text-muted-foreground">
								No pending invites.
							</p>
						)}
					</ItemGroup>
				</section>
			)}
		</div>
	);
}
