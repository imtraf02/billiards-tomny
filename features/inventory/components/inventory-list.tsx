// inventory-logs-list.tsx
"use client";

import { History } from "lucide-react";
import { InventoryCard } from "./inventory-card";

interface InventoryLogsListProps {
	logs: any[];
}

export function InventoryList({ logs }: InventoryListProps) {
	if (logs.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-12">
				<div className="relative mb-6">
					<div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 blur-xl" />
					<History className="relative h-16 w-16 text-muted-foreground" />
				</div>
				<h3 className="mb-2 text-lg font-semibold text-card-foreground">
					Không tìm thấy lịch sử kho
				</h3>
				<p className="text-sm text-muted-foreground">
					Chưa có giao dịch nào được ghi nhận
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{logs.map((log) => (
				<InventoryCard key={log.id} log={log} />
			))}
		</div>
	);
}
