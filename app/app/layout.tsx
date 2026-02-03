"use client";

import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { LayoutProvider } from "@/context/layout-provider";
import { SearchProvider } from "@/context/search-provider";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getCookie } from "@/lib/cookies";
import { cn } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
	const defaultOpen = getCookie("sidebar_state") !== "false";
	const { me, isMeLoading } = useAuth();

	if (isMeLoading) {
		return <div>Loading...</div>;
	}

	if (!isMeLoading && !me) {
		return redirect("/login");
	}

	return (
		<LayoutProvider>
			<SearchProvider>
				<SidebarProvider defaultOpen={defaultOpen}>
					<AppSidebar />
					<SidebarInset
						className={cn(
							// Set content container, so we can use container queries
							"@container/content",

							// If layout is fixed, set the height
							// to 100svh to prevent overflow
							"has-data-[layout=fixed]:h-svh",

							// If layout is fixed and sidebar is inset,
							// set the height to 100svh - spacing (total margins) to prevent overflow
							"peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]",
						)}
					>
						{children}
					</SidebarInset>
				</SidebarProvider>
			</SearchProvider>
		</LayoutProvider>
	);
}
