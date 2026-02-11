"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ArrowDownAZ,
	ArrowUpAZ,
	Edit,
	Ellipsis,
	SlidersHorizontal,
	Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TableStatus } from "@/generated/prisma/enums";
import { useDebounce } from "@/hooks/use-debounce";
import { useElapsedTime } from "@/hooks/use-elapsed-time";
import { api } from "@/lib/eden";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TABLE_STATUS, TABLE_TYPES } from "../data";
import type { TableWithSessions } from "../types";
import { TablesPrimaryButtons } from "./tables-primary-buttons";
import { useTables } from "./tables-provider";

const ALL_TYPES = "Tất cả";
const ALL_STATUSES = "Tất cả trạng thái";
const SORT_OPTIONS = ["asc", "desc"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

interface TableCardProps {
	table: TableWithSessions;
}

const Timer = ({ startTime }: { startTime: Date }) => {
	const { formatted } = useElapsedTime(startTime);
	return (
		<div className="flex items-center gap-2">
			<Badge className="rounded-md">{formatted}</Badge>
		</div>
	);
};

const TableCard = ({ table }: TableCardProps) => {
	const { setOpen, setCurrentRow } = useTables();

	const statusColor = {
		[TableStatus.AVAILABLE]: "bg-green-500",
		[TableStatus.OCCUPIED]: "bg-red-500",
		[TableStatus.RESERVED]: "bg-yellow-500",
		[TableStatus.MAINTENANCE]: "bg-gray-500",
	};

	return (
		<li className="rounded-lg border p-4 hover:shadow-md">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div
						className={cn("size-3 rounded-full", statusColor[table.status])}
					/>
					<span className="text-sm text-muted-foreground">
						{TABLE_STATUS[table.status]}
					</span>
				</div>
				{table.sessions.length > 0 ? (
					<Timer startTime={table.sessions[0].startTime} />
				) : (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<Ellipsis />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => {
									setCurrentRow(table);
									setOpen("update");
								}}
							>
								Chỉnh sửa
								<DropdownMenuShortcut>
									<Edit />
								</DropdownMenuShortcut>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="text-destructive!"
								onClick={() => {
									setCurrentRow(table);
									setOpen("delete");
								}}
							>
								Xóa
								<DropdownMenuShortcut>
									<Trash2 className="text-destructive" />
								</DropdownMenuShortcut>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			<div className="mb-4">
				<h2 className="mb-1 font-semibold">{table.name}</h2>
				<div className="space-y-1 text-sm text-muted-foreground mt-1">
					<TableDetail label="Loại bàn">{TABLE_TYPES[table.type]}</TableDetail>
					<TableDetail label="Giá theo giờ" isBold>
						{formatVND(table.hourlyRate)}
					</TableDetail>
				</div>
			</div>

			<Button
				variant={table.status !== TableStatus.AVAILABLE ? "outline" : "default"}
				className="w-full"
				onClick={() => {
					setCurrentRow(table);
					if (table.status === TableStatus.AVAILABLE) {
						setOpen("start-session");
					} else {
						setOpen("session-details");
					}
				}}
			>
				{table.status !== TableStatus.AVAILABLE
					? "Chi tiết phiên chơi"
					: "Bắt đầu phiên chơi"}
			</Button>
		</li>
	);
};

interface TableDetailProps {
	label: string;
	children: React.ReactNode;
	isBold?: boolean;
}

function TableDetail({ label, children, isBold }: TableDetailProps) {
	return (
		<div className="flex justify-between">
			<span>{label}</span>
			<span
				className={cn({
					"font-medium text-foreground": isBold,
				})}
			>
				{children}
			</span>
		</div>
	);
}

export function Tables() {
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState(ALL_TYPES);
	const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
	const [sort, setSort] = useState<SortOption>("asc");

	const debouncedSearch = useDebounce(search, 100);

	const { data: tables, isLoading } = useQuery({
		queryKey: ["tables"],
		queryFn: async () => await api.tables.get(),
	});

	const filteredTables = useMemo(() => {
		if (!tables?.data) return [];

		const lowerSearch = debouncedSearch.toLowerCase();
		const isAllTypes = typeFilter === ALL_TYPES;
		const isAllStatuses = statusFilter === ALL_STATUSES;

		return tables.data
			.filter((table) => {
				const matchesSearch = table.name.toLowerCase().includes(lowerSearch);
				const matchesType = isAllTypes || table.type === typeFilter;
				const matchesStatus = isAllStatuses || table.status === statusFilter;
				return matchesSearch && matchesType && matchesStatus;
			})
			.sort((a, b) =>
				sort === "asc"
					? a.hourlyRate - b.hourlyRate
					: b.hourlyRate - a.hourlyRate,
			);
	}, [tables?.data, debouncedSearch, typeFilter, statusFilter, sort]);

	return (
		<>
			<div className="flex flex-wrap items-end justify-between gap-2">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Danh sách bàn</h1>
					<p className="text-muted-foreground">
						Danh sách bàn bida được hiển thị ở đây!
					</p>
				</div>
				<TablesPrimaryButtons />
			</div>

			<div className="my-4 flex items-end justify-between sm:my-0 sm:items-center">
				<div className="flex flex-col gap-4 sm:my-4 sm:flex-row">
					<Input
						placeholder="Tìm kiếm bàn..."
						className="h-9 w-40 lg:w-64"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-36">
							<SelectValue placeholder="Chọn loại bàn">
								{typeFilter}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={ALL_TYPES}>{ALL_TYPES}</SelectItem>
							{Object.entries(TABLE_TYPES).map(([key, label]) => (
								<SelectItem key={key} value={key}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Chọn trạng thái">
								{statusFilter === ALL_STATUSES
									? ALL_STATUSES
									: TABLE_STATUS[statusFilter as keyof typeof TABLE_STATUS]}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={ALL_STATUSES}>{ALL_STATUSES}</SelectItem>
							{Object.entries(TABLE_STATUS).map(([key, label]) => (
								<SelectItem key={key} value={key}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<Select
					value={sort}
					onValueChange={(value) => {
						setSort(value as SortOption);
					}}
				>
					<SelectTrigger className="w-16">
						<SelectValue>
							<SlidersHorizontal />
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="end" position="popper">
						<SelectItem value="asc">
							<div className="flex items-center gap-4">
								<ArrowUpAZ />
								<span>Giá tăng dần</span>
							</div>
						</SelectItem>
						<SelectItem value="desc">
							<div className="flex items-center gap-4">
								<ArrowDownAZ />
								<span>Giá giảm dần</span>
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Separator className="shadow-sm" />

			<ul className="faded-bottom no-scrollbar grid gap-4 overflow-auto pt-4 pb-16 md:grid-cols-2 lg:grid-cols-3">
				{isLoading ? (
					Array.from({ length: 12 }, (_, i) => (
						<Skeleton key={i} className="h-52" />
					))
				) : filteredTables.length === 0 ? (
					<li className="text-muted-foreground">Không tìm thấy bàn</li>
				) : (
					filteredTables.map((table) => (
						<TableCard key={table.id} table={table} />
					))
				)}
			</ul>
		</>
	);
}
