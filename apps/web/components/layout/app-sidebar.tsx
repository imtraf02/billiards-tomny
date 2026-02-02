"use client";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@workspace/ui/components/sidebar";
import { useLayout } from "@/context/layout-provider";
import { sidebarData } from "./data/sidebar-data";
import { NavGroup } from "./nav-group";
// import { AppTitle } from './app-title'
// import { sidebarData } from './data/sidebar-data'
// import { NavGroup } from './nav-group'
// import { NavUser } from './nav-user'
// import { TeamSwitcher } from './team-switcher'

export function AppSidebar() {
	const { collapsible, variant } = useLayout();
	return (
		<Sidebar collapsible={collapsible} variant={variant}>
			<SidebarHeader>
			</SidebarHeader>
			<SidebarContent>
				{sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
			</SidebarContent>
			<SidebarFooter>{/*<NavUser user={sidebarData.user} />*/}</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
