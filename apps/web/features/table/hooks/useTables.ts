"use client";

import { useState, useEffect } from "react";

interface Table {
  id: string;
  name: string;
  type: string;
  status: string;
  pricePerHour: number;
  seats?: number;
}

export function useTables() {
  const [data, setData] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        // TODO: Thay thế bằng API call thực tế
        const mockTables: Table[] = [
          { id: "1", name: "Bàn 1", type: "pool", status: "occupied", pricePerHour: 80000, seats: 4 },
          { id: "2", name: "Bàn 2", type: "pool", status: "available", pricePerHour: 80000, seats: 4 },
          { id: "3", name: "Bàn VIP 1", type: "snooker", status: "reserved", pricePerHour: 150000, seats: 6 },
          { id: "4", name: "Bàn 3", type: "pool", status: "available", pricePerHour: 80000, seats: 4 },
          { id: "5", name: "Bàn 4", type: "carom", status: "maintenance", pricePerHour: 120000, seats: 4 },
          { id: "6", name: "Bàn 5", type: "pool", status: "available", pricePerHour: 80000, seats: 4 },
        ];
        setData(mockTables);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, []);

  return { data, isLoading, error };
}
