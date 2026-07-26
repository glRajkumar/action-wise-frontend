import { sendApiReq } from "@/services/api";
import type {
	Connection,
	ConnectionConfig,
	ConnectionKind,
} from "@/types/connection";

export function listConnections(workspaceId: string) {
	return sendApiReq<Connection[]>({
		method: "GET",
		url: `/workspaces/${workspaceId}/connections`,
	});
}

export function createConnection(payload: {
	workspaceId: string;
	kind: ConnectionKind;
	name: string;
	config: ConnectionConfig;
}) {
	return sendApiReq<Connection>({
		method: "POST",
		url: `/workspaces/${payload.workspaceId}/connections`,
		data: { kind: payload.kind, name: payload.name, config: payload.config },
	});
}

export function updateConnection(payload: {
	workspaceId: string;
	connectionId: string;
	kind: ConnectionKind;
	name: string;
	config: ConnectionConfig;
}) {
	return sendApiReq<Connection>({
		method: "PATCH",
		url: `/workspaces/${payload.workspaceId}/connections/${payload.connectionId}`,
		data: { kind: payload.kind, name: payload.name, config: payload.config },
	});
}

export function deleteConnection(payload: {
	workspaceId: string;
	connectionId: string;
}) {
	return sendApiReq<{ message: string }>({
		method: "DELETE",
		url: `/workspaces/${payload.workspaceId}/connections/${payload.connectionId}`,
	});
}

export function setConnectionSecret(payload: {
	workspaceId: string;
	connectionId: string;
	value: string;
}) {
	return sendApiReq<{ message: string }>({
		method: "PUT",
		url: `/workspaces/${payload.workspaceId}/connections/${payload.connectionId}/secret`,
		data: { value: payload.value },
	});
}

export function deleteConnectionSecret(payload: {
	workspaceId: string;
	connectionId: string;
}) {
	return sendApiReq<{ message: string }>({
		method: "DELETE",
		url: `/workspaces/${payload.workspaceId}/connections/${payload.connectionId}/secret`,
	});
}
