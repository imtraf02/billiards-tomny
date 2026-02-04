"use client";

import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Search } from "@/components/search";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { StatsCards } from "@/features/dashboard/components/stats-cards";
import {
	useDashboardMetrics,
	useRecentActivity,
} from "@/features/dashboard/hooks/use-dashboard";

export default function DashboardPage() {
	const { data: metrics, isLoading: isMetricsLoading } = useDashboardMetrics();
	const { data: recent, isLoading: isRecentLoading } = useRecentActivity();

	return (
		<>
			<Header>
				{/* Placeholder for top nav or title if needed */}
				<div className="flex items-center gap-4">
					<h1 className="text-xl font-bold">Tổng Quan</h1>
				</div>
				<div className="ms-auto flex items-center space-x-4">
					<Search />
					<ModeSwitcher />
				</div>
			</Header>
			<Main>
				<div className="space-y-4">
					{metrics ? (
						<StatsCards data={metrics} />
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{[...Array(4)].map((_, i) => (
								<div
									key={`stat-skeleton-${i}`}
									className="h-32 rounded-xl bg-muted animate-pulse"
								/>
							))}
						</div>
					)}

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
						<div className="col-span-4">
							{metrics?.revenueByDay ? (
								<RevenueChart data={metrics.revenueByDay} />
							) : (
								<div className="h-76 rounded-xl bg-muted animate-pulse" />
							)}
						</div>
						<div className="col-span-3">
							{recent ? (
								<RecentActivity
									bookings={recent.recentBookings}
									orders={recent.recentOrders}
								/>
							) : (
								<div className="h-76 rounded-xl bg-muted animate-pulse" />
							)}
						</div>
					</div>
				</div>
			</Main>
		</>
	);
}
