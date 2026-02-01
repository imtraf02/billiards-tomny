"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useTables } from "../hooks";

interface TableListProps {
  search?: string;
}

export default function TableList({ search = "" }: TableListProps) {
  const { data: tables, isLoading, error } = useTables();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "occupied": return "bg-red-100 text-red-800";
      case "reserved": return "bg-yellow-100 text-yellow-800";
      case "maintenance": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available": return "Trống";
      case "occupied": return "Đang sử dụng";
      case "reserved": return "Đã đặt";
      case "maintenance": return "Bảo trì";
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Đang tải bàn...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredTables = tables?.filter(table =>
    table.name.toLowerCase().includes(search.toLowerCase()) ||
    table.type.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTables.map((table) => (
            <div key={table.id} className="rounded-lg border p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{table.name}</h3>
                  <p className="text-sm text-gray-500">
                    {table.type === "pool" && "Pool"}
                    {table.type === "carom" && "Carom"}
                    {table.type === "snooker" && "Snooker"}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                  {getStatusText(table.status)}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Giá/giờ</p>
                  <p className="font-medium">{table.pricePerHour.toLocaleString('vi-VN')}₫</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số ghế</p>
                  <p className="font-medium">{table.seats || 4}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="mr-2 h-4 w-4" />
                  Sửa
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTables.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy bàn nào
          </div>
        )}
      </CardContent>
    </Card>
  );
}
