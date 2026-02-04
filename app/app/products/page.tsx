"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { Products } from "@/features/product/components/products";

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
				<div className="mb-6 flex flex-col gap-2">
					<h1 className="text-2xl font-bold tracking-tight">
						Quản lý sản phẩm
					</h1>
					<p className="text-muted-foreground">
						Quản lý danh sách sản phẩm, giá cả và tồn kho.
					</p>
				</div>
				<Products />
			</Main>
		</>
	);
}
