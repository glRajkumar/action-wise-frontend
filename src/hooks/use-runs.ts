import { useQuery } from "@tanstack/react-query";

import { listRuns } from "@/actions/runs";

export const runsKey = (workspaceId: string, resourceId?: string) => [
	"runs",
	workspaceId,
	resourceId ?? "all",
];

export function useRuns(
	workspaceId: string | undefined,
	options: { limit?: number; resourceId?: string } = {},
) {
	return useQuery({
		queryKey: [
			...runsKey(workspaceId ?? "", options.resourceId),
			options.limit,
		],
		queryFn: () =>
			listRuns({
				workspaceId: workspaceId as string,
				limit: options.limit,
				resourceId: options.resourceId,
			}),
		enabled: !!workspaceId,
	});
}
