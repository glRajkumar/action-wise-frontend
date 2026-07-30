import type { RunStatus } from "@/types/action";

export type RunHistoryEntry = {
	id: string;
	resourceId: string | null;
	resourceName: string | null;
	stepId: string | null;
	actionRunId: string | null;
	status: RunStatus;
	durationMs: number | null;
	executedAt: string;
	request: unknown;
	response: unknown;
};
