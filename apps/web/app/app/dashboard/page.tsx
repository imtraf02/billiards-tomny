"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { TopNav } from "@/components/layout/top-nav";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";

export default function DashboardPage() {
	return (
		<>
			<Header>
				<TopNav links={topNav} />
				<div className="ms-auto flex items-center space-x-4">
					<Search />
					<ModeSwitcher />
				</div>
			</Header>
			<Main>
				<div></div>
			</Main>
		</>
	);
}

const topNav = [
	{
		title: "Overview",
		href: "/app/dashboard/overview",
		isActive: true,
		disabled: false,
	},
	{
		title: "Customers",
		href: "/app/dashboard/customers",
		isActive: false,
	},
	{
		title: "Products",
		href: "/app/dashboard/products",
		isActive: false,
	},
	{
		title: "Settings",
		href: "/app/dashboard/settings",
		isActive: false,
	},
];
