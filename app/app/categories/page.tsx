"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { Categories } from "@/features/categories/components/categories";
import { CategoriesDialogs } from "@/features/categories/components/categories-dialogs";
import { CategoriesProvider } from "@/features/categories/components/categories-provider";

export default function CategoriesPage() {
	return (
		<>
			<Header>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ModeSwitcher />
				</div>
			</Header>
			<Main fixed>
				<CategoriesProvider>
					<Categories />
					<CategoriesDialogs />
				</CategoriesProvider>
			</Main>
		</>
	);
}
