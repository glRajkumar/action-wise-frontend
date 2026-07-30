import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createAction,
	createStep,
	deleteAction,
	deleteStep,
	executeAction,
	getAction,
	getActionRun,
	listActionRuns,
	listActions,
	reorderSteps,
	updateAction,
	updateStep,
} from "@/actions/action-domain";
import { useToast } from "@/components/ui/toast";

export const actionsKey = (workspaceId: string) => ["actions", workspaceId];
export const actionKey = (workspaceId: string, actionId: string) => [
	"action",
	workspaceId,
	actionId,
];
export const actionRunsKey = (workspaceId: string, actionId: string) => [
	"action-runs",
	workspaceId,
	actionId,
];
export const actionRunKey = (
	workspaceId: string,
	actionId: string,
	actionRunId: string,
) => ["action-run", workspaceId, actionId, actionRunId];

export function useActions(workspaceId: string | undefined) {
	return useQuery({
		queryKey: actionsKey(workspaceId ?? ""),
		queryFn: () => listActions(workspaceId as string),
		enabled: !!workspaceId,
	});
}

export function useAction(
	workspaceId: string | undefined,
	actionId: string | undefined,
) {
	return useQuery({
		queryKey: actionKey(workspaceId ?? "", actionId ?? ""),
		queryFn: () =>
			getAction({
				workspaceId: workspaceId as string,
				actionId: actionId as string,
			}),
		enabled: !!workspaceId && !!actionId,
	});
}

export function useCreateAction(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: createAction,
		onSuccess() {
			qc.invalidateQueries({ queryKey: actionsKey(workspaceId) });
			toast.success("Action created");
		},
		onError(error) {
			toast.error(error?.message || "Failed to create action");
		},
	});
}

export function useUpdateAction(workspaceId: string, actionId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: updateAction,
		onSuccess() {
			qc.invalidateQueries({ queryKey: actionsKey(workspaceId) });
			qc.invalidateQueries({ queryKey: actionKey(workspaceId, actionId) });
			toast.success("Action updated");
		},
		onError(error) {
			toast.error(error?.message || "Failed to update action");
		},
	});
}

export function useDeleteAction(workspaceId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: deleteAction,
		onSuccess() {
			qc.invalidateQueries({ queryKey: actionsKey(workspaceId) });
			toast.success("Action deleted");
		},
		onError(error) {
			toast.error(error?.message || "Failed to delete action");
		},
	});
}

function useStepMutation<TInput>(
	workspaceId: string,
	actionId: string,
	mutationFn: (input: TInput) => Promise<unknown>,
	errorMessage: string,
) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn,
		onSuccess() {
			qc.invalidateQueries({ queryKey: actionKey(workspaceId, actionId) });
			qc.invalidateQueries({ queryKey: actionsKey(workspaceId) });
		},
		onError(error: Error) {
			toast.error(error?.message || errorMessage);
		},
	});
}

export function useCreateStep(workspaceId: string, actionId: string) {
	return useStepMutation(
		workspaceId,
		actionId,
		createStep,
		"Failed to add step",
	);
}

export function useUpdateStep(workspaceId: string, actionId: string) {
	return useStepMutation(
		workspaceId,
		actionId,
		updateStep,
		"Failed to update step",
	);
}

export function useDeleteStep(workspaceId: string, actionId: string) {
	return useStepMutation(
		workspaceId,
		actionId,
		deleteStep,
		"Failed to delete step",
	);
}

export function useReorderSteps(workspaceId: string, actionId: string) {
	return useStepMutation(
		workspaceId,
		actionId,
		reorderSteps,
		"Failed to reorder steps",
	);
}

export function useExecuteAction(workspaceId: string, actionId: string) {
	const toast = useToast();
	const qc = useQueryClient();

	return useMutation({
		mutationFn: executeAction,
		onSuccess(detail) {
			qc.invalidateQueries({ queryKey: actionRunsKey(workspaceId, actionId) });
			qc.invalidateQueries({ queryKey: actionsKey(workspaceId) });
			qc.setQueryData(
				actionRunKey(workspaceId, actionId, detail.actionRun.id),
				detail,
			);
			if (detail.actionRun.status === "success") {
				toast.success("Action run succeeded");
			} else {
				toast.error("Action run failed — see timeline");
			}
		},
		onError(error) {
			toast.error(error?.message || "Failed to execute action");
		},
	});
}

export function useActionRuns(
	workspaceId: string | undefined,
	actionId: string | undefined,
) {
	return useQuery({
		queryKey: actionRunsKey(workspaceId ?? "", actionId ?? ""),
		queryFn: () =>
			listActionRuns({
				workspaceId: workspaceId as string,
				actionId: actionId as string,
			}),
		enabled: !!workspaceId && !!actionId,
	});
}

export function useActionRun(
	workspaceId: string | undefined,
	actionId: string | undefined,
	actionRunId: string | undefined,
) {
	return useQuery({
		queryKey: actionRunKey(
			workspaceId ?? "",
			actionId ?? "",
			actionRunId ?? "",
		),
		queryFn: () =>
			getActionRun({
				workspaceId: workspaceId as string,
				actionId: actionId as string,
				actionRunId: actionRunId as string,
			}),
		enabled: !!workspaceId && !!actionId && !!actionRunId,
	});
}
