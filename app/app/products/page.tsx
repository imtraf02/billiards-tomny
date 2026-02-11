"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { Products } from "@/features/products/components/products";
import { ProductsDialogs } from "@/features/products/components/products-dialogs";
import { ProductsProvider } from "@/features/products/components/products-provider";

export default function ProductsPage() {
	return (
		<>
			<Header>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ModeSwitcher />
				</div>
			</Header>
			<Main fixed>
				<ProductsProvider>
					<Products />
					<ProductsDialogs />
				</ProductsProvider>
			</Main>
		</>
	);
}
