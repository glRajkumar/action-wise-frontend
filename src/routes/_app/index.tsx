import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Database, Key, PlaySquare, Workflow } from "lucide-react";
import { WorkspaceGate } from "@/components/common/workspace-gate";
import { useActions } from "@/hooks/use-actions";
import { useConnections } from "@/hooks/use-connections";
import { useBoards } from "@/hooks/use-playground";
import { useResources } from "@/hooks/use-resources";
import { useRuns } from "@/hooks/use-runs";
import { cn } from "@/lib/utils";
import { useCurrentWorkspaceStore } from "@/store/current-workspace";
import type { RunStatus } from "@/types/action";

export const Route = createFileRoute("/_app/")({ component: Dashboard });

function statusDotClass(status: RunStatus): string {
	if (status === "success") return "bg-green-500";
	if (status === "error") return "bg-red-500";
	return "bg-amber-400";
}

function Dashboard() {
	const workspaceId = useCurrentWorkspaceStore((s) => s.activeWorkspaceId);

	const { data: connections } = useConnections(workspaceId ?? undefined);
	const { data: resources } = useResources(workspaceId ?? undefined);
	const { data: boards } = useBoards(workspaceId ?? undefined);
	const { data: actions } = useActions(workspaceId ?? undefined);
	const { data: runs } = useRuns(workspaceId ?? undefined, { limit: 10 });

	if (!workspaceId) return <WorkspaceGate />;

	const cards: {
		label: string;
		count: number | undefined;
		to: string;
		icon: LucideIcon;
	}[] = [
		{
			label: "Connections",
			count: connections?.length,
			to: "/connections",
			icon: Key,
		},
		{
			label: "Resources",
			count: resources?.length,
			to: "/registry",
			icon: Database,
		},
		{
			label: "Boards",
			count: boards?.length,
			to: "/playground",
			icon: PlaySquare,
		},
		{
			label: "Actions",
			count: actions?.length,
			to: "/actions",
			icon: Workflow,
		},
	];

	return (
		<div className="mx-auto max-w-3xl p-6">
			<div className="mb-6">
				<h1 className="text-lg font-semibold">Dashboard</h1>
				<p className="text-sm text-muted-foreground">
					What this workspace knows about your backend.
				</p>
			</div>

			<div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
				{cards.map(({ label, count, to, icon: Icon }) => (
					<Link
						key={label}
						to={to}
						className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
					>
						<Icon size={16} className="mb-2 text-muted-foreground" />
						<p className="text-2xl font-semibold tabular-nums">
							{count ?? "—"}
						</p>
						<p className="text-xs text-muted-foreground">{label}</p>
					</Link>
				))}
			</div>

			<div>
				<h2 className="mb-2 text-sm font-semibold">Recent runs</h2>
				{!runs || runs.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No runs recorded yet — execute something in the Playground or run an
						Action.
					</p>
				) : (
					<div className="flex flex-col divide-y rounded-lg border">
						{runs.map((run) => (
							<div key={run.id} className="flex items-center gap-2 px-3 py-2">
								<span
									className={cn(
										"size-2 shrink-0 rounded-full",
										statusDotClass(run.status),
									)}
								/>
								<span className="min-w-0 flex-1 truncate text-sm">
									{run.resourceName ?? "Ad-hoc request"}
									{run.actionRunId && (
										<span className="ml-1 text-xs text-muted-foreground">
											(action step)
										</span>
									)}
								</span>
								<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
									{run.durationMs != null ? `${run.durationMs} ms · ` : ""}
									{new Date(run.executedAt).toLocaleString()}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
