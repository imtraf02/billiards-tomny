"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTableInput, UpdateTableInput, Table } from "../types";
import { toast } from "sonner";

const API_BASE = "/api";

// Fetch all tables
export function useTables(query?: { search?: string; type?: string; status?: string }) {
  return useQuery({
    queryKey: ["tables", query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query?.search) params.append("search", query.search);
      if (query?.type) params.append("type", query.type);
      if (query?.status) params.append("status", query.status);
      
      const res = await fetch(`${API_BASE}/tables?${params.toString()}`);
      if (!res.ok) throw new Error("Không thể tải danh sách bàn");
      return res.json() as Promise<Table[]>;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

// Create table
export function useCreateTable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTableInput) => {
      const res = await fetch(`${API_BASE}/tables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Không thể tạo bàn");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Tạo bàn thành công");
    },
    onError: (error) => {
      toast.error(error.message || "Có lỗi xảy ra khi tạo bàn");
    },
  });
}

// Update table
export function useUpdateTable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTableInput }) => {
      const res = await fetch(`${API_BASE}/tables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Không thể cập nhật bàn");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Cập nhật bàn thành công");
    },
    onError: (error) => {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật bàn");
    },
  });
}

// Delete table
export function useDeleteTable() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/tables/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Không thể xóa bàn");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("Xóa bàn thành công");
    },
    onError: (error) => {
      toast.error(error.message || "Có lỗi xảy ra khi xóa bàn");
    },
  });
}

// Get single table
export function useTable(id: string) {
  return useQuery({
    queryKey: ["table", id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/tables/${id}`);
      if (!res.ok) throw new Error("Không thể tải thông tin bàn");
      return res.json() as Promise<Table>;
    },
    enabled: !!id,
  });
}
