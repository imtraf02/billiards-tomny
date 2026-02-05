import type {
	BookingTable,
	Order,
	OrderItem,
	Product,
	Table,
} from "@/generated/prisma/browser";

export type TableWithBookings = Table & {
	bookingTables: (BookingTable & {
		booking: {
			id: string;
			startTime: Date;
		};
	})[];
};

export interface TableSessionDrawerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	table: TableWithBookings | null;
	activeBooking: {
		id: string;
		startTime: Date;
	} | null;
	onOpenOrder: (bookingId: string) => void;
}

export interface BookingDetails {
	id: string;
	startTime: Date;
	endTime?: Date | null;
	status: string;
	totalAmount: number;
	orders?: (Order & {
		orderItems: (OrderItem & { product: Product })[];
	})[];
	bookingTables?: (BookingTable & {
		table: { id: string; name: string };
		startTime: Date;
		endTime?: Date | null;
		priceSnapshot: number;
	})[];
}

export interface DialogStates {
	confirmCheckout: boolean;
	confirmStop: boolean;
	merging: boolean;
	printInvoice: boolean;
}

export interface CostCalculation {
	totalAmount: number;
	totalHourlyCost: number;
	serviceTotal: number;
}
