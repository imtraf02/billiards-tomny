"use client";

import { useEffect, useState } from "react";

interface Booking {
	id: string;
	customerName: string;
	tables: string[];
	startTime: string;
	endTime: string;
	status: string;
}

export function useBookings() {
	const [data, setData] = useState<Booking[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchBookings = async () => {
			try {
				// TODO: Thay thế bằng API call thực tế
				const mockBookings: Booking[] = [
					{
						id: "1",
						customerName: "Nguyễn Văn A",
						tables: ["Bàn 1"],
						startTime: "14:00",
						endTime: "16:00",
						status: "active",
					},
					{
						id: "2",
						customerName: "Trần Thị B",
						tables: ["Bàn 3", "Bàn 4"],
						startTime: "15:00",
						endTime: "17:00",
						status: "pending",
					},
				];
				setData(mockBookings);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Lỗi không xác định");
			} finally {
				setIsLoading(false);
			}
		};

		fetchBookings();
	}, []);

	return { data, isLoading, error };
}
