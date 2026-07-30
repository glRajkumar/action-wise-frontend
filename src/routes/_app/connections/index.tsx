import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { Key, KeyRound, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { WorkspaceGate } from "@/components/common/workspace-gate";
import { Button } from "@/components/ui/button";
import { DialogWrapper } from "@/components/ui/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { InputWrapper, SelectWrapper } from "@/components/ui/field-wrapper-rhf";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import {
	useConnections,
	useCreateConnection,
	useDeleteConnection,
	useDeleteConnectionSecret,
	useSetConnectionSecret,
	useUpdateConnection,
} from "@/hooks/use-connections";
import { useCurrentWorkspaceStore } from "@/store/current-workspace";
import type {
	Connection,
	ConnectionConfig,
	FirebaseConnectionConfig,
	HttpConnectionConfig,
} from "@/types/connection";
import { HTTP_AUTH_TYPES } from "@/types/connection";
import {
	type ConnectionFormData,
	type ConnectionSecretFormData,
	connectionFormSchema,
	connectionSecretSchema,
} from "@/utils/schemas";

export const Route = createFileRoute("/_app/connections/")({
	component: ConnectionsPage,
});

const KIND_ITEMS: itemT[] = [
	{ label: "HTTP", value: "http" },
	{ label: "Firebase", value: "firebase" },
];
const AUTH_ITEMS: itemT[] = HTTP_AUTH_TYPES.map((type) => ({
	label: type,
	value: type,
}));

const DEFAULT_FORM: ConnectionFormData = {
	kind: "http",
	name: "",
	baseUrl: "",
	defaultHeadersJson: "",
	authType: "none",
	authHeaderName: "",
	projectId: "",
	apiKey: "",
	databaseURL: "",
};

function connectionToFormData(connection: Connection): ConnectionFormData {
	if (connection.kind === "http") {
		const config = connection.config as HttpConnectionConfig;
		return {
			...DEFAULT_FORM,
			kind: "http",
			name: connection.name,
			baseUrl: config.baseUrl,
			defaultHeadersJson: config.defaultHeaders
				? JSON.stringify(config.defaultHeaders, null, 2)
				: "",
			authType: config.auth.type,
			authHeaderName:
				config.auth.type === "apiKey" ? config.auth.headerName : "",
		};
	}
	const config = connection.config as FirebaseConnectionConfig;
	return {
		...DEFAULT_FORM,
		kind: "firebase",
		name: connection.name,
		projectId: config.projectId,
		apiKey: config.apiKey,
		databaseURL: config.databaseURL ?? "",
	};
}

function formDataToConfig(data: ConnectionFormData): ConnectionConfig {
	if (data.kind === "http") {
		return {
			baseUrl: data.baseUrl ?? "",
			defaultHeaders: data.defaultHeadersJson
				? JSON.parse(data.defaultHeadersJson)
				: undefined,
			auth:
				data.authType === "apiKey"
					? { type: "apiKey", headerName: data.authHeaderName ?? "" }
					: { type: data.authType },
		};
	}
	return {
		projectId: data.projectId ?? "",
		apiKey: data.apiKey ?? "",
		databaseURL: data.databaseURL || undefined,
	};
}

function ConnectionsPage() {
	const workspaceId = useCurrentWorkspaceStore((s) => s.activeWorkspaceId);
	const { data: connections, isLoading } = useConnections(
		workspaceId ?? undefined,
	);

	const createMutation = useCreateConnection(workspaceId ?? "");
	const updateMutation = useUpdateConnection(workspaceId ?? "");
	const deleteMutation = useDeleteConnection(workspaceId ?? "");
	const setSecretMutation = useSetConnectionSecret(workspaceId ?? "");
	const deleteSecretMutation = useDeleteConnectionSecret(workspaceId ?? "");

	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<Connection | null>(null);
	const [secretTarget, setSecretTarget] = useState<Connection | null>(null);

	const form = useForm<ConnectionFormData>({
		resolver: zodResolver(connectionFormSchema),
		defaultValues: DEFAULT_FORM,
	});

	const secretForm = useForm<ConnectionSecretFormData>({
		resolver: zodResolver(connectionSecretSchema),
		defaultValues: { value: "" },
	});

	const kind = form.watch("kind");
	const authType = form.watch("authType");

	function openCreate() {
		setEditing(null);
		form.reset(DEFAULT_FORM);
		setFormOpen(true);
	}

	function openEdit(connection: Connection) {
		setEditing(connection);
		form.reset(connectionToFormData(connection));
		setFormOpen(true);
	}

	function onSubmit(data: ConnectionFormData) {
		if (!workspaceId) return;
		const config = formDataToConfig(data);
		if (editing) {
			updateMutation.mutate(
				{
					workspaceId,
					connectionId: editing.id,
					kind: data.kind,
					name: data.name,
					config,
				},
				{ onSuccess: () => setFormOpen(false) },
			);
		} else {
			createMutation.mutate(
				{ workspaceId, kind: data.kind, name: data.name, config },
				{ onSuccess: () => setFormOpen(false) },
			);
		}
	}

	function onSetSecret(data: ConnectionSecretFormData) {
		if (!secretTarget || !workspaceId) return;
		setSecretMutation.mutate(
			{ workspaceId, connectionId: secretTarget.id, value: data.value },
			{
				onSuccess: () => {
					setSecretTarget(null);
					secretForm.reset();
				},
			},
		);
	}

	if (!workspaceId) return <WorkspaceGate />;

	const secretAuthType =
		secretTarget?.kind === "http"
			? (secretTarget.config as HttpConnectionConfig).auth.type
			: undefined;

	return (
		<div className="mx-auto max-w-3xl p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-lg font-semibold">Connections</h1>
					<p className="text-sm text-muted-foreground">
						Reusable credentials + base config for HTTP and Firebase.
					</p>
				</div>
				<Button onClick={openCreate}>
					<Plus size={15} /> New connection
				</Button>
			</div>

			<DialogWrapper
				open={formOpen}
				onOpenChange={setFormOpen}
				title={editing ? "Edit connection" : "Create connection"}
				action={editing ? "Save" : "Create"}
				onAction={form.handleSubmit(onSubmit)}
				loading={createMutation.isPending || updateMutation.isPending}
			>
				<div className="flex flex-col gap-4">
					<SelectWrapper
						name="kind"
						control={form.control}
						label="Kind"
						items={KIND_ITEMS}
						disabled={!!editing}
					/>
					<InputWrapper
						name="name"
						control={form.control}
						label="Name"
						placeholder="Staging API"
					/>

					{kind === "http" ? (
						<>
							<InputWrapper
								name="baseUrl"
								control={form.control}
								label="Base URL"
								placeholder="https://api.example.com"
							/>
							<SelectWrapper
								name="authType"
								control={form.control}
								label="Auth type"
								items={AUTH_ITEMS}
							/>
							{authType === "apiKey" && (
								<InputWrapper
									name="authHeaderName"
									control={form.control}
									label="Header name"
									placeholder="X-API-Key"
								/>
							)}
							<InputWrapper
								name="defaultHeadersJson"
								control={form.control}
								label="Default headers (JSON, optional)"
								placeholder='{"X-Client": "action-wise"}'
							/>
						</>
					) : (
						<>
							<InputWrapper
								name="projectId"
								control={form.control}
								label="Project ID"
							/>
							<InputWrapper
								name="apiKey"
								control={form.control}
								label="API key"
							/>
							<InputWrapper
								name="databaseURL"
								control={form.control}
								label="Database URL (optional)"
								placeholder="https://my-project.firebaseio.com"
							/>
						</>
					)}
				</div>
			</DialogWrapper>

			{secretTarget && (
				<DialogWrapper
					open={!!secretTarget}
					onOpenChange={(open) => !open && setSecretTarget(null)}
					title={`Set your secret for "${secretTarget.name}"`}
					description={
						secretAuthType === "basic"
							? 'Basic auth — paste JSON: {"username": "...", "password": "..."}'
							: "Encrypted at rest, used only on your behalf, never returned over the API."
					}
					action="Save"
					onAction={secretForm.handleSubmit(onSetSecret)}
					loading={setSecretMutation.isPending}
				>
					<InputWrapper
						name="value"
						control={secretForm.control}
						label="Secret value"
						type="password"
					/>
				</DialogWrapper>
			)}

			{isLoading ? (
				<p className="text-sm text-muted-foreground">Loading…</p>
			) : connections && connections.length > 0 ? (
				<ItemGroup>
					{connections.map((connection) => (
						<Item key={connection.id} variant="outline">
							<ItemContent>
								<ItemTitle>{connection.name}</ItemTitle>
								<ItemDescription className="capitalize">
									{connection.kind} ·{" "}
									{connection.hasSecret ? "secret set" : "no secret"}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								{connection.kind === "http" && (
									<>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setSecretTarget(connection)}
										>
											<KeyRound size={15} />
										</Button>
										{connection.hasSecret && (
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													deleteSecretMutation.mutate({
														workspaceId,
														connectionId: connection.id,
													})
												}
											>
												<X size={15} />
											</Button>
										)}
									</>
								)}
								<Button
									variant="ghost"
									size="icon"
									onClick={() => openEdit(connection)}
								>
									<Pencil size={15} />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() =>
										deleteMutation.mutate({
											workspaceId,
											connectionId: connection.id,
										})
									}
								>
									<Trash2 size={15} />
								</Button>
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
			) : (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Key />
						</EmptyMedia>
						<EmptyTitle>No connections yet</EmptyTitle>
						<EmptyDescription>
							Create one to start building resources against it.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}
		</div>
	);
}
