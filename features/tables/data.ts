import { TableStatus, TableType } from "@/generated/prisma/enums";

export const TABLE_STATUS = {
	[TableStatus.AVAILABLE]: "Sẵn sàng",
	[TableStatus.OCCUPIED]: "Đang sử dụng",
	[TableStatus.RESERVED]: "Đã đặt",
	[TableStatus.MAINTENANCE]: "Đang bảo trì",
} satisfies Record<TableStatus, string>;

export const TABLE_TYPES = {
	[TableType.POOL]: "Bida lỗ",
	[TableType.CAROM]: "Bida phăng",
	[TableType.SNOOKER]: "Bida Snooker",
} satisfies Record<TableType, string>;
