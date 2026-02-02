"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { 
  Search, 
  Filter, 
  Eye,
  CheckCircle,
  XCircle
} from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface Order {
  id: string;
  table: string;
  customer: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");

  const orders: Order[] = [
    { id: "ORD-001", table: "Bàn 2", customer: "Nguyễn Văn A", total: 250000, status: "completed", createdAt: "10:30" },
    { id: "ORD-002", table: "Bàn 5", customer: "Trần Thị B", total: 180000, status: "pending", createdAt: "11:45" },
    { id: "ORD-003", table: "Bàn 1", customer: "Lê Văn C", total: 320000, status: "confirmed", createdAt: "13:20" },
  ];

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "Chờ xác nhận";
      case "confirmed": return "Đã xác nhận";
      case "completed": return "Hoàn thành";
      case "cancelled": return "Đã hủy";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
          <p className="text-gray-600">Theo dõi đơn hàng đồ ăn/uống</p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm đơn hàng..."
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

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold">{order.id}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Bàn: {order.table} • Khách: {order.customer}</p>
                  <p className="text-sm text-gray-600">Thời gian: {order.createdAt}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold">{order.total.toLocaleString()} VNĐ</div>
                    <p className="text-sm text-gray-500">Tổng tiền</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {order.status === "pending" && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
