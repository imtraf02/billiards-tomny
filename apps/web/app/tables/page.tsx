"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import CreateTableForm from "@/features/table/components/create-table-form";

type TableStatus = "available" | "occupied" | "reserved" | "maintenance";

interface Table {
  id: string;
  name: string;
  type: "pool" | "carom" | "snooker";
  status: TableStatus;
  pricePerHour: number;
}

export default function TablesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState("");

  const tables: Table[] = [
    { id: "1", name: "Bàn 1", type: "pool", status: "available", pricePerHour: 80000 },
    { id: "2", name: "Bàn 2", type: "pool", status: "occupied", pricePerHour: 80000 },
    { id: "3", name: "Bàn VIP 1", type: "snooker", status: "reserved", pricePerHour: 150000 },
  ];

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "occupied": return "bg-red-100 text-red-800";
      case "reserved": return "bg-yellow-100 text-yellow-800";
      case "maintenance": return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý bàn</h1>
          <p className="text-gray-600">Quản lý thông tin các bàn billiards</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm bàn mới
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm bàn..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => (
          <Card key={table.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{table.name}</CardTitle>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                  {table.status === "available" && "Trống"}
                  {table.status === "occupied" && "Đang sử dụng"}
                  {table.status === "reserved" && "Đã đặt"}
                  {table.status === "maintenance" && "Bảo trì"}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại bàn:</span>
                  <span className="font-medium">
                    {table.type === "pool" && "Pool"}
                    {table.type === "carom" && "Carom"}
                    {table.type === "snooker" && "Snooker"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá/giờ:</span>
                  <span className="font-medium">{table.pricePerHour.toLocaleString()} VNĐ</span>
                </div>
                <div className="flex gap-2 pt-4">
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Table Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-2xl w-full mx-4">
            <CreateTableForm onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
