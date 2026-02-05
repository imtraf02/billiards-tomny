"use client";

import { GitMerge } from "lucide-react";
import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";

interface BookingTableInfo {
	id: string;
	tableId: string;
	endTime?: Date | null;
	table: {
		id: string;
		name: string;
	};
}

interface MultiTableInfoProps {
	bookingTables: BookingTableInfo[];
	currentTableId: string;
}

export const MultiTableInfo = memo(
	({ bookingTables, currentTableId }: MultiTableInfoProps) => {
		const otherTables = useMemo(
			() => bookingTables.filter((bt) => bt.tableId !== currentTableId),
			[bookingTables, currentTableId],
		);

		if (otherTables.length === 0) return null;

		return (
			<div className="sm:col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
				<p className="text-sm text-blue-800 flex items-center gap-2">
					<GitMerge className="h-4 w-4" />
					Bàn này đang được gộp chung với:
				</p>
				<div className="mt-2 flex flex-wrap gap-2">
					{otherTables.map((bt) => (
						<Badge key={bt.id} variant="secondary" className="bg-white">
							{bt.table.name}
							{!bt.endTime && (
								<span className="ml-1 text-green-600 text-[10px]">•</span>
							)}
						</Badge>
					))}
				</div>
			</div>
		);
	},
);
