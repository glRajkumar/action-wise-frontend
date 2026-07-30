import { sendApiReq } from "@/services/api";
import type { RunHistoryEntry } from "@/types/run";

export function listRuns(payload: {
	workspaceId: string;
	limit?: number;
	resourceId?: string;
}) {
	return sendApiReq<RunHistoryEntry[]>({
		method: "GET",
		url: `/workspaces/${payload.workspaceId}/runs`,
		params: {
			...(payload.limit ? { limit: payload.limit } : {}),
			...(payload.resourceId ? { resourceId: payload.resourceId } : {}),
		},
	});
}
