// features/booking/components/bookings-list.tsx
"use client";

import type { Booking } from "@/generated/prisma/client";
import { BookingCard } from "./booking-card";

interface BookingsCardListProps {
	bookings: Booking[];
	onViewDetail: (id: string) => void;
}

export function BookingsList({
	bookings,
	onViewDetail,
}: BookingsCardListProps) {
	if (bookings.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">Không có booking nào.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{bookings.map((booking) => (
				<BookingCard
					key={booking.id}
					booking={booking}
					onViewDetail={onViewDetail}
				/>
			))}
		</div>
	);
}
