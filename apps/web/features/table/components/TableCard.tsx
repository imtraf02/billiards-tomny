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
          badgeClass: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
        };
      case "occupied":
        return {
          color: "bg-red-500",
          icon: "🔴",
          text: "Đang sử dụng",
          badgeClass: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
        };
      case "reserved":
        return {
          color: "bg-yellow-500",
          icon: "🟡",
          text: "Đã đặt",
          badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
        };
      case "maintenance":
        return {
          color: "bg-gray-500",
          icon: "⚫",
          text: "Bảo trì",
          badgeClass: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
        };
    }
  };

  const getTableTypeConfig = (type: Table["type"]) => {
    switch (type) {
      case "pool":
        return {
          gradient: "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700",
          text: "Pool",
          icon: "🎱",
          description: "Bàn Pool tiêu chuẩn"
        };
      case "carom":
        return {
          gradient: "bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700",
          text: "Carom",
          icon: "🎯",
          description: "Bàn Carom chuyên nghiệp"
        };
      case "snooker":
        return {
          gradient: "bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-800",
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
        className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 group h-full flex flex-col cursor-pointer transition-theme"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header với gradient theo loại bàn */}
        <div className={`h-2 ${typeConfig.gradient} relative transition-theme`}>
          {/* View detail badge */}
          <div className="absolute -top-2 left-4 bg-card text-primary text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 border border-border transition-theme">
            <Eye className="h-3 w-3" />
            Xem chi tiết
          </div>
          
          {/* Timer badge nếu bàn đang sử dụng */}
          {table.status === "occupied" && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-destructive/90 to-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg transition-theme">
              ⏱ 1:25:30
            </div>
          )}
        </div>
        
        <div className="p-5 flex-1 flex flex-col transition-theme">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{typeConfig.icon}</span>
                <h3 className="text-lg font-bold text-card-foreground truncate transition-theme">
                  {table.name}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground truncate transition-theme">
                {typeConfig.description}
              </p>
            </div>
            
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.badgeClass} flex-shrink-0 ml-2 transition-theme`}>
              <span className={`w-2 h-2 rounded-full ${statusConfig.color}`}></span>
              {statusConfig.text}
            </span>
          </div>

          {/* Thông tin bàn */}
          <div className="space-y-4 mb-5 flex-1">
            {/* Row 1: Price và Seats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 hover:shadow-md transition-shadow transition-theme">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-primary transition-theme" />
                  <span className="text-xs font-medium text-primary transition-theme">
                    Giá/giờ
                  </span>
                </div>
                <p className="font-bold text-lg text-card-foreground transition-theme">
                  {table.pricePerHour.toLocaleString('vi-VN')}₫
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-3 hover:shadow-md transition-shadow transition-theme">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400 transition-theme" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 transition-theme">
                    Số ghế
                  </span>
                </div>
                <p className="font-bold text-lg text-card-foreground transition-theme">
                  {table.seats || 4}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className={`bg-muted rounded-lg p-3 min-h-[60px] flex items-center transition-theme ${
              !table.description ? 'border border-dashed border-border' : ''
            }`}>
              {table.description ? (
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 transition-theme" />
                  <p className="text-sm text-card-foreground/80 line-clamp-2 transition-theme">
                    {table.description}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center w-full transition-theme">
                  Chưa có mô tả
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 border-t border-border pt-4 mt-auto transition-theme" onClick={(e) => e.preventDefault()}>
            <div className="flex-1">
              {table.status === "available" ? (
                <Button 
                  onClick={handleStart}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transition-theme"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Bắt đầu
                </Button>
              ) : table.status === "occupied" ? (
                <div className="space-y-2">
                  <Button 
                    onClick={handleAddOrder}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-theme"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Thêm đơn
                  </Button>
                  <Button 
                    onClick={handleEnd}
                    className="w-full bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive text-destructive-foreground transition-theme"
                  >
                    <StopCircle className="mr-2 h-4 w-4" />
                    Kết thúc
                  </Button>
                </div>
              ) : table.status === "reserved" ? (
                <Button 
                  variant="outline"
                  className="w-full border-border bg-yellow-50 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-800 hover:border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30 dark:hover:border-yellow-700 transition-theme"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Đã đặt trước
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  className="w-full border-border bg-muted text-muted-foreground hover:bg-muted/80 hover:text-muted-foreground hover:border-border cursor-not-allowed transition-theme"
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
                className="border-border bg-background text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-theme"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDelete}
                className="border-border bg-background text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-theme"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Hover effect overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent dark:from-black/10 pointer-events-none transition-opacity duration-300 transition-theme" />
        )}
      </Card>
    </Link>
  );
}
