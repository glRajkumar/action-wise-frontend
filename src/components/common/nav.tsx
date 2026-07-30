import { Link, useMatchRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
	Building2,
	Database,
	Key,
	LayoutDashboard,
	LogOut,
	PlaySquare,
	Settings,
	Workflow,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/common/workspace-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSignOut } from "@/hooks/use-auth";
import { web } from "@/utils/constants";

const links: {
	to: string;
	label: string;
	icon: LucideIcon;
	exact?: boolean;
}[] = [
	{ to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
	{ to: "/connections", label: "Connections", icon: Key },
	{ to: "/registry", label: "Registry", icon: Database },
	{ to: "/playground", label: "Playground", icon: PlaySquare },
	{ to: "/actions", label: "Actions", icon: Workflow },
	{ to: "/workspaces", label: "Workspaces", icon: Building2 },
	{ to: "/settings", label: "Settings", icon: Settings },
];

export function AppNav() {
	const signOutMutation = useSignOut();
	const matchRoute = useMatchRoute();

	return (
		<Sidebar collapsible="offcanvas">
			<SidebarHeader>
				<p className="px-2 py-2 text-sm font-semibold tracking-tight">
					{web.name}
				</p>
				<WorkspaceSwitcher />
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{links.map(({ to, label, icon: Icon, exact }) => (
							<SidebarMenuItem key={to}>
								<SidebarMenuButton
									render={<Link to={to} />}
									isActive={!!matchRoute({ to, fuzzy: !exact })}
									tooltip={label}
								>
									<Icon />
									<span>{label}</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={() => signOutMutation.mutate()}
							disabled={signOutMutation.isPending}
						>
							<LogOut />
							<span>
								{signOutMutation.isPending ? "Signing out…" : "Sign out"}
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
