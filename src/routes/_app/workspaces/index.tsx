import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DialogWrapper } from "@/components/ui/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { InputWrapper } from "@/components/ui/field-wrapper-rhf";
import { useCreateWorkspace, useWorkspaces } from "@/hooks/use-workspaces";
import { useCurrentWorkspaceStore } from "@/store/current-workspace";
import {
	type WorkspaceNameFormData,
	workspaceNameSchema,
} from "@/utils/schemas";

export const Route = createFileRoute("/_app/workspaces/")({
	component: WorkspacesPage,
});

function WorkspacesPage() {
	const { data: workspaces, isLoading } = useWorkspaces();
	const setActiveWorkspaceId = useCurrentWorkspaceStore(
		(s) => s.setActiveWorkspaceId,
	);
	const createMutation = useCreateWorkspace();
	const [open, setOpen] = useState(false);

	const form = useForm<WorkspaceNameFormData>({
		resolver: zodResolver(workspaceNameSchema),
		defaultValues: { name: "" },
	});

	function onSubmit(data: WorkspaceNameFormData) {
		createMutation.mutate(data, {
			onSuccess: (workspace) => {
				setActiveWorkspaceId(workspace.id);
				setOpen(false);
				form.reset();
			},
		});
	}

	return (
		<div className="mx-auto max-w-3xl p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-lg font-semibold">Workspaces</h1>
					<p className="text-sm text-muted-foreground">
						Everything you build in Action Wise lives inside a workspace.
					</p>
				</div>

				<DialogWrapper
					open={open}
					onOpenChange={setOpen}
					trigger={
						<Button>
							<Plus size={15} /> New workspace
						</Button>
					}
					title="Create workspace"
					description="You can rename it later."
					action="Create"
					onAction={form.handleSubmit(onSubmit)}
					loading={createMutation.isPending}
				>
					<InputWrapper
						name="name"
						control={form.control}
						label="Name"
						placeholder="Acme Inc"
						autoFocus
					/>
				</DialogWrapper>
			</div>

			{isLoading ? (
				<p className="text-sm text-muted-foreground">Loading…</p>
			) : workspaces && workspaces.length > 0 ? (
				<div className="grid gap-3 sm:grid-cols-2">
					{workspaces.map((workspace) => (
						<Link
							key={workspace.id}
							to="/workspaces/$workspaceId"
							params={{ workspaceId: workspace.id }}
							onClick={() => setActiveWorkspaceId(workspace.id)}
						>
							<Card className="cursor-pointer transition-colors hover:ring-foreground/20">
								<CardHeader>
									<CardTitle>{workspace.name}</CardTitle>
									<CardDescription className="capitalize">
										{workspace.role}
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>
					))}
				</div>
			) : (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Users />
						</EmptyMedia>
						<EmptyTitle>No workspaces yet</EmptyTitle>
						<EmptyDescription>
							Create your first workspace to get started.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</div>
	);
}
