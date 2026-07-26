import { useNavigate } from "@tanstack/react-router";
import { ChevronsUpDown, Settings2 } from "lucide-react";
import { useEffect } from "react";
import { MenuWrapper } from "@/components/ui/menu-wrapper";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useCurrentWorkspaceStore } from "@/store/current-workspace";

const MANAGE_VALUE = "__manage__";

export function WorkspaceSwitcher() {
	const navigate = useNavigate();
	const { data: workspaces, isLoading } = useWorkspaces();
	const activeWorkspaceId = useCurrentWorkspaceStore(
		(s) => s.activeWorkspaceId,
	);
	const setActiveWorkspaceId = useCurrentWorkspaceStore(
		(s) => s.setActiveWorkspaceId,
	);

	const active =
		workspaces?.find((w) => w.id === activeWorkspaceId) ?? workspaces?.[0];

	// Auto-pick a workspace once the list loads if nothing (or a since-deleted
	// workspace) is active — solo users should never see an empty switcher.
	useEffect(() => {
		const first = workspaces?.[0];
		if (!first) return;
		if (workspaces.some((w) => w.id === activeWorkspaceId)) return;
		setActiveWorkspaceId(first.id);
	}, [workspaces, activeWorkspaceId, setActiveWorkspaceId]);

	const items: menuItemsT = [
		...(workspaces ?? []).map((w) => ({ label: w.name, value: w.id })),
		{ label: "Manage workspaces", value: MANAGE_VALUE },
	];

	function handleSelect(value: allowedPrimitiveT) {
		if (value === MANAGE_VALUE) {
			navigate({ to: "/workspaces" });
			return;
		}
		setActiveWorkspaceId(String(value));
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<MenuWrapper
					trigger={
						<>
							<span className="truncate">
								{isLoading ? "Loading…" : (active?.name ?? "No workspace")}
							</span>
							<ChevronsUpDown className="ml-auto" size={14} />
						</>
					}
					triggerProps={{ render: <SidebarMenuButton /> }}
					items={items}
					onSelect={handleSelect}
					contentProps={{ className: "w-56" }}
				/>
			</SidebarMenuItem>
			<SidebarMenuItem>
				<SidebarMenuButton
					onClick={() =>
						active &&
						navigate({
							to: "/workspaces/$workspaceId",
							params: { workspaceId: active.id },
						})
					}
					disabled={!active}
				>
					<Settings2 />
					<span>Workspace settings</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
