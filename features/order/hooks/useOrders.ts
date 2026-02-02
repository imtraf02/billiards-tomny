"use client";

import { useState, useEffect } from "react";

interface Order {
  id: string;
  tableId: string;
  total: number;
  status: string;
  createdAt: string;
}

export function useOrders() {
  const [data, setData] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // TODO: Thay thế bằng API call thực tế
        const mockOrders: Order[] = [
          { id: "ORD-001", tableId: "Bàn 2", total: 250000, status: "completed", createdAt: "10:30" },
          { id: "ORD-002", tableId: "Bàn 5", total: 180000, status: "pending", createdAt: "11:45" },
          { id: "ORD-003", tableId: "Bàn 1", total: 320000, status: "confirmed", createdAt: "13:20" },
        ];
        setData(mockOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { data, isLoading, error };
}
