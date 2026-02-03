"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { Bookings } from "@/features/booking/components/bookings";

export default function BookingsPage() {
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
					<h1 className="text-2xl font-bold tracking-tight">
						Lịch sử phiên chơi
					</h1>
					<p className="text-muted-foreground">
						Xem lại các phiên chơi đã hoàn thành, doanh thu và chi tiết đơn
						hàng.
					</p>
				</div>
				<Bookings />
			</Main>
		</>
	);
}
