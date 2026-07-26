import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import {
	Braces,
	ChevronRight,
	Copy,
	Database,
	Folder,
	FolderPlus,
	Pencil,
	Plus,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ResourceConfigFields } from "@/components/resources/resource-config-fields";
import { Button } from "@/components/ui/button";
import { DialogWrapper } from "@/components/ui/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import {
	InputWrapper,
	NumberWrapper,
	SelectWrapper,
} from "@/components/ui/field-wrapper-rhf";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import { useToast } from "@/components/ui/toast";
import { useConnections } from "@/hooks/use-connections";
import {
	useCreateFolder,
	useCreateResource,
	useDeleteFolder,
	useDeleteResource,
	useExportResourceType,
	useFolders,
	useGenerateFakeData,
	useResources,
	useUpdateResource,
} from "@/hooks/use-resources";
import { useCurrentWorkspaceStore } from "@/store/current-workspace";
import type {
	FirebaseRtdbResourceConfig,
	HttpResourceConfig,
	Resource,
	ResourceFolder,
} from "@/types/resource";
import {
	type FakeDataCountFormData,
	type FolderFormData,
	fakeDataCountSchema,
	folderFormSchema,
	type ResourceFormData,
	resourceFormSchema,
} from "@/utils/schemas";

export const Route = createFileRoute("/_app/registry/")({
	component: RegistryPage,
});

const DIRECTION_ITEMS: itemT[] = ["invoke", "subscribe", "receive"].map(
	(v) => ({ label: v, value: v }),
);
const DANGER_ITEMS: itemT[] = ["safe", "mutating", "destructive"].map((v) => ({
	label: v,
	value: v,
}));

const DEFAULT_RESOURCE_FORM: ResourceFormData = {
	kind: "http",
	name: "",
	folderId: undefined,
	connectionId: "",
	direction: "invoke",
	danger: "safe",
	address: "",
	payloadTemplateJson: "",
	method: "GET",
	headersJson: "",
	queryParamsJson: "",
	bodyType: "none",
	mode: undefined,
	eventFilter: undefined,
};

function resourceToFormData(resource: Resource): ResourceFormData {
	const base: ResourceFormData = {
		...DEFAULT_RESOURCE_FORM,
		kind: resource.kind,
		name: resource.name,
		folderId: resource.folderId ?? undefined,
		connectionId: resource.connectionId,
		direction: resource.direction,
		danger: resource.danger,
		address: resource.address,
		payloadTemplateJson: resource.payloadTemplate
			? JSON.stringify(resource.payloadTemplate, null, 2)
			: "",
	};

	if (resource.kind === "http") {
		const config = resource.config as HttpResourceConfig;
		return {
			...base,
			method: config.method,
			bodyType: config.bodyType,
			headersJson: config.headers
				? JSON.stringify(config.headers, null, 2)
				: "",
			queryParamsJson: config.queryParams
				? JSON.stringify(config.queryParams, null, 2)
				: "",
		};
	}

	const config = resource.config as FirebaseRtdbResourceConfig;
	return { ...base, mode: config.mode, eventFilter: config.eventFilter };
}

function formDataToConfig(data: ResourceFormData): unknown {
	if (data.kind === "http") {
		return {
			method: data.method,
			bodyType: data.bodyType,
			headers: data.headersJson ? JSON.parse(data.headersJson) : undefined,
			queryParams: data.queryParamsJson
				? JSON.parse(data.queryParamsJson)
				: undefined,
		};
	}
	if (data.kind === "firebase_rtdb")
		return { mode: data.mode, eventFilter: data.eventFilter };
	return { mode: data.mode };
}

function buildFolderTree(folders: ResourceFolder[]) {
	const byParent = new Map<string | null, ResourceFolder[]>();
	for (const folder of folders) {
		const key = folder.parentFolderId;
		const bucket = byParent.get(key) ?? [];
		bucket.push(folder);
		byParent.set(key, bucket);
	}
	return byParent;
}

function FolderTreeItem({
	folder,
	depth,
	byParent,
	selectedFolderId,
	onSelect,
}: {
	folder: ResourceFolder;
	depth: number;
	byParent: Map<string | null, ResourceFolder[]>;
	selectedFolderId: string | null;
	onSelect: (id: string) => void;
}) {
	const children = byParent.get(folder.id) ?? [];
	return (
		<>
			<button
				type="button"
				onClick={() => onSelect(folder.id)}
				className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${
					selectedFolderId === folder.id ? "bg-muted font-medium" : ""
				}`}
				style={{ paddingLeft: 8 + depth * 16 }}
			>
				<Folder size={14} className="shrink-0 text-muted-foreground" />
				<span className="truncate">{folder.name}</span>
			</button>
			{children.map((child) => (
				<FolderTreeItem
					key={child.id}
					folder={child}
					depth={depth + 1}
					byParent={byParent}
					selectedFolderId={selectedFolderId}
					onSelect={onSelect}
				/>
			))}
		</>
	);
}

function RegistryPage() {
	const workspaceId = useCurrentWorkspaceStore((s) => s.activeWorkspaceId);
	const toast = useToast();

	const { data: folders } = useFolders(workspaceId ?? undefined);
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
	const { data: resources, isLoading: resourcesLoading } = useResources(
		workspaceId ?? undefined,
		selectedFolderId ?? undefined,
	);
	const { data: connections } = useConnections(workspaceId ?? undefined);

	const createFolderMutation = useCreateFolder(workspaceId ?? "");
	const deleteFolderMutation = useDeleteFolder(workspaceId ?? "");
	const createResourceMutation = useCreateResource(workspaceId ?? "");
	const updateResourceMutation = useUpdateResource(workspaceId ?? "");
	const deleteResourceMutation = useDeleteResource(workspaceId ?? "");
	const exportTypeMutation = useExportResourceType();
	const fakeDataMutation = useGenerateFakeData();

	const [folderDialogOpen, setFolderDialogOpen] = useState(false);
	const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
	const [editingResource, setEditingResource] = useState<Resource | null>(null);
	const [beautifyTarget, setBeautifyTarget] = useState<Resource | null>(null);
	const [exportResult, setExportResult] = useState<{
		typeName: string;
		source: string;
		sampleCount: number;
	} | null>(null);
	const [fakeResult, setFakeResult] = useState<unknown[] | null>(null);

	const folderForm = useForm<FolderFormData>({
		resolver: zodResolver(folderFormSchema),
		defaultValues: { name: "" },
	});
	const resourceForm = useForm<ResourceFormData>({
		resolver: zodResolver(resourceFormSchema),
		defaultValues: DEFAULT_RESOURCE_FORM,
	});
	const fakeCountForm = useForm<FakeDataCountFormData>({
		resolver: zodResolver(fakeDataCountSchema),
		defaultValues: { count: 5 },
	});

	const kind = resourceForm.watch("kind");
	const byParent = useMemo(() => buildFolderTree(folders ?? []), [folders]);
	const rootFolders = byParent.get(null) ?? [];

	function openCreateResource() {
		setEditingResource(null);
		resourceForm.reset({
			...DEFAULT_RESOURCE_FORM,
			folderId: selectedFolderId ?? undefined,
		});
		setResourceDialogOpen(true);
	}

	function openEditResource(resource: Resource) {
		setEditingResource(resource);
		resourceForm.reset(resourceToFormData(resource));
		setResourceDialogOpen(true);
	}

	function onSubmitResource(data: ResourceFormData) {
		if (!workspaceId) return;

		let config: unknown;
		let payloadTemplate: unknown;
		try {
			config = formDataToConfig(data);
			payloadTemplate = data.payloadTemplateJson
				? JSON.parse(data.payloadTemplateJson)
				: undefined;
		} catch {
			toast.error("Invalid JSON in one of the fields");
			return;
		}

		const input = {
			kind: data.kind,
			name: data.name,
			folderId: data.folderId || null,
			connectionId: data.connectionId,
			direction: data.direction,
			danger: data.danger,
			address: data.address,
			payloadTemplate,
			config,
		};

		if (editingResource) {
			updateResourceMutation.mutate(
				{ workspaceId, resourceId: editingResource.id, ...input },
				{ onSuccess: () => setResourceDialogOpen(false) },
			);
		} else {
			createResourceMutation.mutate(
				{ workspaceId, ...input },
				{ onSuccess: () => setResourceDialogOpen(false) },
			);
		}
	}

	function onSubmitFolder(data: FolderFormData) {
		if (!workspaceId) return;
		createFolderMutation.mutate(
			{ workspaceId, name: data.name, parentFolderId: selectedFolderId },
			{
				onSuccess: () => {
					setFolderDialogOpen(false);
					folderForm.reset();
				},
			},
		);
	}

	function openBeautify(resource: Resource) {
		setBeautifyTarget(resource);
		setExportResult(null);
		setFakeResult(null);
		fakeCountForm.reset({ count: 5 });
	}

	function onExportType() {
		if (!workspaceId || !beautifyTarget) return;
		exportTypeMutation.mutate(
			{ workspaceId, resourceId: beautifyTarget.id },
			{ onSuccess: setExportResult },
		);
	}

	function onGenerateFake(data: FakeDataCountFormData) {
		if (!workspaceId || !beautifyTarget) return;
		fakeDataMutation.mutate(
			{ workspaceId, resourceId: beautifyTarget.id, count: data.count },
			{ onSuccess: setFakeResult },
		);
	}

	if (!workspaceId) {
		return (
			<p className="p-6 text-sm text-muted-foreground">
				Select a workspace first.
			</p>
		);
	}

	return (
		<div className="flex h-full">
			<aside className="w-56 shrink-0 overflow-y-auto border-r p-3">
				<div className="mb-2 flex items-center justify-between">
					<h2 className="text-sm font-medium">Folders</h2>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => setFolderDialogOpen(true)}
					>
						<FolderPlus size={14} />
					</Button>
				</div>
				<button
					type="button"
					onClick={() => setSelectedFolderId(null)}
					className={`mb-1 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${
						selectedFolderId === null ? "bg-muted font-medium" : ""
					}`}
				>
					<ChevronRight size={14} className="text-muted-foreground" />
					All resources
				</button>
				{rootFolders.map((folder) => (
					<FolderTreeItem
						key={folder.id}
						folder={folder}
						depth={0}
						byParent={byParent}
						selectedFolderId={selectedFolderId}
						onSelect={setSelectedFolderId}
					/>
				))}
				{selectedFolderId && (
					<Button
						variant="ghost"
						size="sm"
						className="mt-2 w-full text-destructive"
						onClick={() => {
							deleteFolderMutation.mutate({
								workspaceId,
								folderId: selectedFolderId,
							});
							setSelectedFolderId(null);
						}}
					>
						<Trash2 size={13} /> Delete this folder
					</Button>
				)}
			</aside>

			<div className="flex-1 overflow-auto p-6">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-lg font-semibold">Registry</h1>
						<p className="text-sm text-muted-foreground">
							Shared, saved Resources — HTTP endpoints and Firebase paths.
						</p>
					</div>
					<Button onClick={openCreateResource}>
						<Plus size={15} /> New resource
					</Button>
				</div>

				{resourcesLoading ? (
					<p className="text-sm text-muted-foreground">Loading…</p>
				) : resources && resources.length > 0 ? (
					<ItemGroup>
						{resources.map((resource) => (
							<Item key={resource.id} variant="outline">
								<ItemContent>
									<ItemTitle>{resource.name}</ItemTitle>
									<ItemDescription className="capitalize">
										{resource.kind} · {resource.direction} · {resource.danger} ·{" "}
										{resource.address}
									</ItemDescription>
								</ItemContent>
								<ItemActions>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => openBeautify(resource)}
									>
										<Sparkles size={15} />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => openEditResource(resource)}
									>
										<Pencil size={15} />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() =>
											deleteResourceMutation.mutate({
												workspaceId,
												resourceId: resource.id,
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
								<Database />
							</EmptyMedia>
							<EmptyTitle>No resources yet</EmptyTitle>
							<EmptyDescription>
								Create one directly, or save one from the Playground.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				)}
			</div>

			<DialogWrapper
				open={folderDialogOpen}
				onOpenChange={setFolderDialogOpen}
				title="New folder"
				description={
					selectedFolderId
						? "Created inside the currently selected folder."
						: "Created at the root."
				}
				action="Create"
				onAction={folderForm.handleSubmit(onSubmitFolder)}
				loading={createFolderMutation.isPending}
			>
				<InputWrapper
					name="name"
					control={folderForm.control}
					label="Name"
					autoFocus
				/>
			</DialogWrapper>

			<DialogWrapper
				open={resourceDialogOpen}
				onOpenChange={setResourceDialogOpen}
				title={editingResource ? "Edit resource" : "New resource"}
				action={editingResource ? "Save" : "Create"}
				onAction={resourceForm.handleSubmit(onSubmitResource)}
				loading={
					createResourceMutation.isPending || updateResourceMutation.isPending
				}
				contentCls="max-h-[85vh] overflow-y-auto"
			>
				<div className="flex flex-col gap-4">
					<InputWrapper
						name="name"
						control={resourceForm.control}
						label="Name"
					/>
					<SelectWrapper
						name="direction"
						control={resourceForm.control}
						label="Direction"
						items={DIRECTION_ITEMS}
					/>
					<SelectWrapper
						name="danger"
						control={resourceForm.control}
						label="Danger"
						items={DANGER_ITEMS}
					/>
					<ResourceConfigFields
						control={resourceForm.control}
						kind={kind}
						connections={connections ?? []}
					/>
				</div>
			</DialogWrapper>

			{beautifyTarget && (
				<DialogWrapper
					open={!!beautifyTarget}
					onOpenChange={(open) => !open && setBeautifyTarget(null)}
					title={`Beautify — ${beautifyTarget.name}`}
					description="Infers a TypeScript type (and semantic fake data) from this resource's recorded runs."
					cancel="Close"
					contentCls="max-h-[85vh] overflow-y-auto"
				>
					<div className="flex flex-col gap-6">
						<section className="flex flex-col gap-2">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium">Export TypeScript type</h3>
								<Button
									size="sm"
									variant="outline"
									onClick={onExportType}
									disabled={exportTypeMutation.isPending}
								>
									<Braces size={14} />{" "}
									{exportTypeMutation.isPending ? "Inferring…" : "Infer type"}
								</Button>
							</div>
							{exportResult && (
								<div className="relative">
									<pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
										{exportResult.source}
									</pre>
									<Button
										variant="ghost"
										size="icon-sm"
										className="absolute top-1 right-1"
										onClick={() =>
											navigator.clipboard.writeText(exportResult.source)
										}
									>
										<Copy size={13} />
									</Button>
									<p className="mt-1 text-xs text-muted-foreground">
										From {exportResult.sampleCount} recorded run(s).
									</p>
								</div>
							)}
						</section>

						<section className="flex flex-col gap-2">
							<h3 className="text-sm font-medium">Generate fake data</h3>
							<div className="flex items-end gap-2">
								<NumberWrapper
									name="count"
									control={fakeCountForm.control}
									label="Count"
									className="w-24"
								/>
								<Button
									size="sm"
									variant="outline"
									onClick={fakeCountForm.handleSubmit(onGenerateFake)}
									disabled={fakeDataMutation.isPending}
								>
									{fakeDataMutation.isPending ? "Generating…" : "Generate"}
								</Button>
							</div>
							{fakeResult && (
								<div className="relative">
									<pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
										{JSON.stringify(fakeResult, null, 2)}
									</pre>
									<Button
										variant="ghost"
										size="icon-sm"
										className="absolute top-1 right-1"
										onClick={() =>
											navigator.clipboard.writeText(
												JSON.stringify(fakeResult, null, 2),
											)
										}
									>
										<Copy size={13} />
									</Button>
								</div>
							)}
						</section>
					</div>
				</DialogWrapper>
			)}
		</div>
	);
}
