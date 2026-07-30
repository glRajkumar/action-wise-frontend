import type { ResourceKind } from "@/types/resource";

export type ActionSummary = {
	id: string;
	name: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	stepCount: number;
	lastRunStatus: RunStatus | null;
	lastRunAt: string | null;
};

export type ActionStep = {
	id: string;
	actionId: string;
	resourceId: string;
	order: number;
	name: string;
	inputMapping: Record<string, string> | null;
	createdAt: string;
	updatedAt: string;
	resource: { id: string; name: string; kind: ResourceKind };
};

export type ActionWithSteps = {
	id: string;
	workspaceId: string;
	name: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	steps: ActionStep[];
};

export type RunStatus = "pending" | "success" | "error";

export type ActionRun = {
	id: string;
	actionId: string;
	workspaceId: string;
	status: RunStatus;
	triggeredBy: string;
	startedAt: string;
	finishedAt: string | null;
	createdAt: string;
};

export type StepRun = {
	id: string;
	resourceId: string | null;
	stepId: string | null;
	status: RunStatus;
	request: unknown;
	response: unknown;
	durationMs: number | null;
	executedAt: string;
	stepName: string;
	stepOrder: number;
};

export type ActionRunDetail = {
	actionRun: ActionRun;
	stepRuns: StepRun[];
};
