import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, MailCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAcceptInvite } from "@/hooks/use-workspaces";
import { useCurrentWorkspaceStore } from "@/store/current-workspace";

export const Route = createFileRoute("/_app/accept-invite")({
	validateSearch: (search: Record<string, unknown>) => ({
		token: typeof search.token === "string" ? search.token : "",
	}),
	component: AcceptInvitePage,
});

function AcceptInvitePage() {
	const navigate = useNavigate();
	const { token: tokenFromUrl } = Route.useSearch();
	const setActiveWorkspaceId = useCurrentWorkspaceStore(
		(s) => s.setActiveWorkspaceId,
	);
	const acceptMutation = useAcceptInvite();

	const [token, setToken] = useState(tokenFromUrl);

	function onSubmit() {
		acceptMutation.mutate(token, {
			onSuccess: ({ workspaceId }) => {
				setActiveWorkspaceId(workspaceId);
				navigate({ to: "/workspaces/$workspaceId", params: { workspaceId } });
			},
		});
	}

	return (
		<div className="mx-auto max-w-sm p-6">
			<div className="flex flex-col items-center gap-4 text-center">
				<MailCheck size={32} className="text-muted-foreground" />
				<div>
					<h1 className="mb-1 text-lg font-semibold">Join a workspace</h1>
					<p className="text-sm text-muted-foreground">
						Paste the invite token you were sent (currently the workspace's
						console/API response, not a real email).
					</p>
				</div>

				<Input
					value={token}
					onChange={(e) => setToken(e.target.value)}
					placeholder="Invite token"
					className="font-mono"
				/>

				{acceptMutation.error && (
					<p className="text-sm text-destructive">
						{acceptMutation.error.message}
					</p>
				)}

				<Button
					onClick={onSubmit}
					disabled={!token || acceptMutation.isPending}
					className="w-full"
				>
					{acceptMutation.isPending ? (
						<>
							<Loader2 size={15} className="animate-spin" /> Joining…
						</>
					) : (
						"Accept invite"
					)}
				</Button>
			</div>
		</div>
	);
}
