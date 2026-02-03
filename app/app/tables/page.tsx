"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { Tables } from "@/features/table/components/tables";

export default function TablesPage() {
	return (
		<>
			<Header>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ModeSwitcher />
				</div>
			</Header>
			<Main fixed>
				<div className="mb-6 flex flex-col gap-2">
					<h1 className="text-2xl font-bold tracking-tight">Quản lý bàn</h1>
					<p className="text-muted-foreground">
						Xem trạng thái bàn, bắt đầu chơi và quản lý danh sách bàn billiards.
					</p>
				</div>
				<Tables />
			</Main>
		</>
	);
}
