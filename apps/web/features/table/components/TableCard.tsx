"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Users, 
  Clock, 
  DollarSign, 
  MapPin,
  PlayCircle,
  StopCircle,
  PlusCircle,
  Coffee,
  Utensils,
  Eye
} from "lucide-react";
import type { Table } from "../types";

interface TableCardProps {
  table: Table;
  onEdit?: (table: Table) => void;
  onDelete?: (table: Table) => void;
  onStart?: (table: Table) => void;
  onEnd?: (table: Table) => void;
  onAddOrder?: (table: Table) => void;
}

export default function TableCard({ 
  table, 
  onEdit, 
  onDelete,
  onStart,
  onEnd,
  onAddOrder
}: TableCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusConfig = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return {
          color: "bg-green-500",
          icon: "🟢",
          text: "Trống",
          badgeClass: "bg-green-50 text-green-700 border-green-200"
        };
      case "occupied":
        return {
          color: "bg-red-500",
          icon: "🔴",
          text: "Đang sử dụng",
          badgeClass: "bg-red-50 text-red-700 border-red-200"
        };
      case "reserved":
        return {
          color: "bg-yellow-500",
          icon: "🟡",
          text: "Đã đặt",
          badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-200"
        };
      case "maintenance":
        return {
          color: "bg-gray-500",
          icon: "⚫",
          text: "Bảo trì",
          badgeClass: "bg-gray-50 text-gray-700 border-gray-200"
        };
    }
  };

  const getTableTypeConfig = (type: Table["type"]) => {
    switch (type) {
      case "pool":
        return {
          color: "from-blue-500 to-blue-600",
          gradient: "bg-gradient-to-r from-blue-500 to-blue-600",
          text: "Pool",
          icon: "🎱",
          description: "Bàn Pool tiêu chuẩn"
        };
      case "carom":
        return {
          color: "from-purple-500 to-purple-600",
          gradient: "bg-gradient-to-r from-purple-500 to-purple-600",
          text: "Carom",
          icon: "🎯",
          description: "Bàn Carom chuyên nghiệp"
        };
      case "snooker":
        return {
          color: "from-amber-600 to-amber-700",
          gradient: "bg-gradient-to-r from-amber-600 to-amber-700",
          text: "Snooker",
          icon: "🎮",
          description: "Bàn Snooker VIP"
        };
    }
  };

  const statusConfig = getStatusConfig(table.status);
  const typeConfig = getTableTypeConfig(table.type);

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStart?.(table);
  };

  const handleEnd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnd?.(table);
  };

  const handleAddOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddOrder?.(table);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(table);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(table);
  };

  return (
    <Link href={`/tables/${table.id}`}>
      <Card 
        className="overflow-hidden hover:shadow-xl transition-all duration-300 border hover:border-blue-300 group h-full flex flex-col cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header với gradient theo loại bàn */}
        <div className={`h-2 ${typeConfig.gradient} relative`}>
          {/* View detail badge */}
          <div className="absolute -top-2 left-4 bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Xem chi tiết
          </div>
          
          {/* Timer badge nếu bàn đang sử dụng */}
          {table.status === "occupied" && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              ⏱ 1:25:30
            </div>
          )}
        </div>
        
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{typeConfig.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 truncate">{table.name}</h3>
              </div>
              <p className="text-sm text-gray-500 truncate">{typeConfig.description}</p>
            </div>
            
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.badgeClass} flex-shrink-0 ml-2`}>
              <span className={`w-2 h-2 rounded-full ${statusConfig.color}`}></span>
              {statusConfig.text}
            </span>
          </div>

          {/* Thông tin bàn */}
          <div className="space-y-4 mb-5 flex-1">
            {/* Row 1: Price và Seats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600">Giá/giờ</span>
                </div>
                <p className="font-bold text-lg text-gray-900">
                  {table.pricePerHour.toLocaleString('vi-VN')}₫
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-600">Số ghế</span>
                </div>
                <p className="font-bold text-lg text-gray-900">{table.seats || 4}</p>
              </div>
            </div>

            {/* Description */}
            <div className={`bg-gray-50 rounded-lg p-3 min-h-[60px] flex items-center ${!table.description ? 'border border-dashed border-gray-200' : ''}`}>
              {table.description ? (
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 line-clamp-2">{table.description}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic text-center w-full">Chưa có mô tả</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 border-t pt-4 mt-auto" onClick={(e) => e.preventDefault()}>
            <div className="flex-1">
              {table.status === "available" ? (
                <Button 
                  onClick={handleStart}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Bắt đầu
                </Button>
              ) : table.status === "occupied" ? (
                <div className="space-y-2">
                  <Button 
                    onClick={handleAddOrder}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Thêm đơn
                  </Button>
                  <Button 
                    onClick={handleEnd}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    <StopCircle className="mr-2 h-4 w-4" />
                    Kết thúc
                  </Button>
                </div>
              ) : table.status === "reserved" ? (
                <Button 
                  variant="outline"
                  className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 hover:border-yellow-300"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Đã đặt trước
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 cursor-not-allowed"
                  disabled
                >
                  ⚠️ Đang bảo trì
                </Button>
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEdit}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDelete}
                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none transition-opacity duration-300" />
        )}
      </Card>
    </Link>
  );
}
