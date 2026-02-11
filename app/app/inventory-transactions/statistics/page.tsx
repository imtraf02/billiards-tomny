"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { InventoryStatistics } from "@/features/inventory-transactions/components/inventory-statistics";

export default function ProductsPage() {
	return (
		<>
			<Header>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ModeSwitcher />
				</div>
			</Header>
			<Main>
				<InventoryStatistics />
			</Main>
		</>
	);
}
