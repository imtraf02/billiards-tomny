"use client";

import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export function useProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // TODO: Thay thế bằng API call thực tế
        const mockProducts: Product[] = [
          { id: "1", name: "Coca Cola", price: 20000, stock: 50, category: "Nước uống" },
          { id: "2", name: "Bim bim", price: 15000, stock: 30, category: "Đồ ăn vặt" },
          { id: "3", name: "Cà phê", price: 25000, stock: 20, category: "Nước uống" },
        ];
        setData(mockProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { data, isLoading, error };
}
