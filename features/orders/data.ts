import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";
import { OrderStatus } from "@/generated/prisma/enums";

export const ORDER_STATUS_MAP = {
	[OrderStatus.PENDING]: {
		label: "Đang chờ",
		variant: "secondary",
	},
	[OrderStatus.PREPARING]: {
		label: "Đang chuẩn bị",
		variant: "default",
	},
	[OrderStatus.SERVED]: {
		label: "Đã phục vụ",
		variant: "success",
	},
	[OrderStatus.CANCELLED]: {
		label: "Đã hủy",
		variant: "destructive",
	},
} satisfies Record<
	OrderStatus,
	{ label: string } & VariantProps<typeof badgeVariants>
>;
