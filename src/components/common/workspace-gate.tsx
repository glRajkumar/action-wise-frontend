import { Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useWorkspaces } from "@/hooks/use-workspaces";

// Rendered by workspace-scoped pages when no workspace is active yet.
// Distinguishes "still loading" (the switcher auto-picks once the list
// arrives) from "genuinely has zero workspaces" (CTA instead of the old
// dead-end "Select a workspace first." message).
export function WorkspaceGate() {
	const { data: workspaces, isLoading } = useWorkspaces();

	if (!isLoading && workspaces && workspaces.length === 0) {
		return (
			<Empty className="mt-16">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Building2 />
					</EmptyMedia>
					<EmptyTitle>No workspace yet</EmptyTitle>
					<EmptyDescription>
						Everything in Action Wise lives inside a workspace — create one to
						get started.
					</EmptyDescription>
				</EmptyHeader>
				<Button render={<Link to="/workspaces" />}>Create a workspace</Button>
			</Empty>
		);
	}

	return (
		<div className="flex justify-center p-10">
			<Spinner />
		</div>
	);
}
