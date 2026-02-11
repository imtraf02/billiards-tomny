"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { Tables } from "@/features/tables/components/tables";
import { TablesDialogs } from "@/features/tables/components/tables-dialogs";
import { TablesProvider } from "@/features/tables/components/tables-provider";

export default function TablesPage() {
	return (
		<>
			<Header>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ModeSwitcher />
				</div>
			</Header>
			<Main>
				<TablesProvider>
					<Tables />
					<TablesDialogs />
				</TablesProvider>
			</Main>
		</>
	);
}
