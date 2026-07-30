// "action-domain" not "actions": this src/actions/ folder is the API-call
// layer for every domain, so a file literally named actions.ts would read as
// the layer itself rather than the Actions domain (handover section G).
import { sendApiReq } from "@/services/api";
import type {
	ActionRun,
	ActionRunDetail,
	ActionStep,
	ActionSummary,
	ActionWithSteps,
} from "@/types/action";

export function listActions(workspaceId: string) {
	return sendApiReq<ActionSummary[]>({
		method: "GET",
		url: `/workspaces/${workspaceId}/actions`,
	});
}

export function createAction(payload: {
	workspaceId: string;
	name: string;
	description?: string;
}) {
	const { workspaceId, ...data } = payload;
	return sendApiReq<ActionWithSteps>({
		method: "POST",
		url: `/workspaces/${workspaceId}/actions`,
		data,
	});
}

export function getAction(payload: { workspaceId: string; actionId: string }) {
	return sendApiReq<ActionWithSteps>({
		method: "GET",
		url: `/workspaces/${payload.workspaceId}/actions/${payload.actionId}`,
	});
}

export function updateAction(payload: {
	workspaceId: string;
	actionId: string;
	name?: string;
	description?: string | null;
}) {
	const { workspaceId, actionId, ...data } = payload;
	return sendApiReq<ActionWithSteps>({
		method: "PATCH",
		url: `/workspaces/${workspaceId}/actions/${actionId}`,
		data,
	});
}

export function deleteAction(payload: {
	workspaceId: string;
	actionId: string;
}) {
	return sendApiReq<{ message: string }>({
		method: "DELETE",
		url: `/workspaces/${payload.workspaceId}/actions/${payload.actionId}`,
	});
}

export function createStep(payload: {
	workspaceId: string;
	actionId: string;
	resourceId: string;
	name: string;
	inputMapping?: Record<string, string>;
}) {
	const { workspaceId, actionId, ...data } = payload;
	return sendApiReq<ActionStep>({
		method: "POST",
		url: `/workspaces/${workspaceId}/actions/${actionId}/steps`,
		data,
	});
}

export function updateStep(payload: {
	workspaceId: string;
	actionId: string;
	stepId: string;
	resourceId?: string;
	name?: string;
	inputMapping?: Record<string, string> | null;
}) {
	const { workspaceId, actionId, stepId, ...data } = payload;
	return sendApiReq<ActionStep>({
		method: "PATCH",
		url: `/workspaces/${workspaceId}/actions/${actionId}/steps/${stepId}`,
		data,
	});
}

export function deleteStep(payload: {
	workspaceId: string;
	actionId: string;
	stepId: string;
}) {
	return sendApiReq<{ message: string }>({
		method: "DELETE",
		url: `/workspaces/${payload.workspaceId}/actions/${payload.actionId}/steps/${payload.stepId}`,
	});
}

export function reorderSteps(payload: {
	workspaceId: string;
	actionId: string;
	stepIds: string[];
}) {
	const { workspaceId, actionId, stepIds } = payload;
	return sendApiReq<ActionStep[]>({
		method: "PUT",
		url: `/workspaces/${workspaceId}/actions/${actionId}/steps/reorder`,
		data: { stepIds },
	});
}

export function executeAction(payload: {
	workspaceId: string;
	actionId: string;
	variables?: Record<string, string>;
}) {
	const { workspaceId, actionId, variables } = payload;
	return sendApiReq<ActionRunDetail>({
		method: "POST",
		url: `/workspaces/${workspaceId}/actions/${actionId}/execute`,
		data: { variables: variables ?? {} },
	});
}

export function listActionRuns(payload: {
	workspaceId: string;
	actionId: string;
	limit?: number;
}) {
	return sendApiReq<ActionRun[]>({
		method: "GET",
		url: `/workspaces/${payload.workspaceId}/actions/${payload.actionId}/runs`,
		params: payload.limit ? { limit: payload.limit } : undefined,
	});
}

export function getActionRun(payload: {
	workspaceId: string;
	actionId: string;
	actionRunId: string;
}) {
	return sendApiReq<ActionRunDetail>({
		method: "GET",
		url: `/workspaces/${payload.workspaceId}/actions/${payload.actionId}/runs/${payload.actionRunId}`,
	});
}
