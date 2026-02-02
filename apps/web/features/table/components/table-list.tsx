"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTables } from "../hooks";
import TableCard from "./table-card";
import type { Table } from "../types";

interface TableListProps {
  search?: string;
}

export default function TableList({ search = "" }: TableListProps) {
  const { data: tables, isLoading, error } = useTables();

  const handleEdit = (table: Table) => {
    console.log("Edit table:", table);
    // TODO: Open edit modal
  };

  const handleDelete = (table: Table) => {
    if (confirm(`Bạn có chắc muốn xóa bàn "${table.name}"?`)) {
      console.log("Delete table:", table);
      // TODO: Delete table
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-blue-100">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Đang tải danh sách bàn</h3>
            <p className="text-gray-500">Vui lòng đợi trong giây lát...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-red-100 text-red-600">
              ⚠️
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Đã xảy ra lỗi</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Thử lại
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredTables = tables?.filter(table =>
    table.name.toLowerCase().includes(search.toLowerCase()) ||
    table.type.toLowerCase().includes(search.toLowerCase()) ||
    table.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Thống kê trạng thái bàn
  const stats = {
    total: filteredTables.length,
    available: filteredTables.filter(t => t.status === "available").length,
    occupied: filteredTables.filter(t => t.status === "occupied").length,
    reserved: filteredTables.filter(t => t.status === "reserved").length,
    maintenance: filteredTables.filter(t => t.status === "maintenance").length,
  };

  return (
    <>
      {/* Stats Summary */}
      {filteredTables.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Tổng số: {stats.total} bàn</h3>
                <p className="text-sm text-gray-500">Đang hiển thị {filteredTables.length} bàn</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">{stats.available} trống</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">{stats.occupied} đang sử dụng</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-600">{stats.reserved} đã đặt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-sm text-gray-600">{stats.maintenance} bảo trì</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTables.map((table) => (
          <div key={table.id} className="relative">
            <TableCard 
              table={table}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
      
      {/* Empty state */}
      {filteredTables.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-100">
                <div className="text-2xl">🎱</div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy bàn nào</h3>
              <p className="text-gray-500 mb-4">
                {search 
                  ? `Không có bàn nào phù hợp với "${search}"`
                  : "Chưa có bàn nào trong hệ thống. Hãy thêm bàn mới!"
                }
              </p>
              <p className="text-sm text-gray-400">
                Thử thay đổi từ khóa tìm kiếm hoặc tạo bàn mới
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Types Legend */}
      {filteredTables.length > 0 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Chú thích loại bàn:</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Pool - Bàn tiêu chuẩn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-600">Carom - Bàn chuyên nghiệp</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-600"></div>
                <span className="text-sm text-gray-600">Snooker - Bàn VIP</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
