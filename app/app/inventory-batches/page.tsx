"use client";

import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { InventoryBatches } from "@/features/inventory-batches/components/inventory-batches";

export default function ProductsPage() {
	const searchParams = useSearchParams();
	const productId = searchParams.get("product_id");

	return (
		<>
			<Header>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ModeSwitcher />
				</div>
			</Header>
			<Main fixed>
				<InventoryBatches productId={productId} />
			</Main>
		</>
	);
}
