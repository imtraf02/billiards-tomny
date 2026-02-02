"use client";

import { useState, useEffect } from "react";
import type { Table } from "../types";

export function useTables() {
  const [data, setData] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        // TODO: Thay thế bằng API call thực tế
        const mockTables: Table[] = [
          { 
            id: "1", 
            name: "Bàn 1", 
            type: "pool", 
            status: "occupied", 
            pricePerHour: 80000, 
            seats: 4,
            description: "Bàn Pool tiêu chuẩn, view cửa sổ",
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
          { 
            id: "2", 
            name: "Bàn 2", 
            type: "pool", 
            status: "available", 
            pricePerHour: 80000, 
            seats: 4,
            description: "Bàn mới, đèn LED",
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
          { 
            id: "3", 
            name: "Bàn VIP 1", 
            type: "snooker", 
            status: "reserved", 
            pricePerHour: 150000, 
            seats: 6,
            description: "Bàn Snooker cao cấp, không gian riêng tư",
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
          { 
            id: "4", 
            name: "Bàn 3", 
            type: "pool", 
            status: "available", 
            pricePerHour: 80000, 
            seats: 4,
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
          { 
            id: "5", 
            name: "Bàn 4", 
            type: "carom", 
            status: "maintenance", 
            pricePerHour: 120000, 
            seats: 4,
            description: "Bàn Carom chuyên nghiệp, đang bảo dưỡng",
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
          { 
            id: "6", 
            name: "Bàn 5", 
            type: "pool", 
            status: "available", 
            pricePerHour: 80000, 
            seats: 4,
            createdAt: new Date(), 
            updatedAt: new Date() 
          },
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
