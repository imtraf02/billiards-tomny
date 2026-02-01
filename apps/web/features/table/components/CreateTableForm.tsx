"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, DollarSign, Users, Hash, MessageSquare } from "lucide-react";

interface CreateTableFormProps {
  onClose: () => void;
}

export default function CreateTableForm({ onClose }: CreateTableFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "pool",
    status: "available",
    pricePerHour: "",
    seats: "4",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Gọi API để tạo bàn
    const tableData = {
      ...formData,
      pricePerHour: parseInt(formData.pricePerHour),
      seats: parseInt(formData.seats),
    };
    
    console.log("Form data:", tableData);
    
    // Giả lập API call
    setTimeout(() => {
      setLoading(false);
      onClose();
      router.refresh();
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getTableTypeInfo = (type: string) => {
    switch (type) {
      case "pool":
        return { color: "bg-blue-100 text-blue-800", icon: "🎱", desc: "Bàn Pool tiêu chuẩn" };
      case "carom":
        return { color: "bg-purple-100 text-purple-800", icon: "🎯", desc: "Bàn Carom chuyên nghiệp" };
      case "snooker":
        return { color: "bg-amber-100 text-amber-800", icon: "🎮", desc: "Bàn Snooker VIP" };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: "🎱", desc: "" };
    }
  };

  const typeInfo = getTableTypeInfo(formData.type);

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md">
      {/* Header với gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <div className="text-2xl">{typeInfo.icon}</div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Thêm bàn mới</h2>
              <p className="text-blue-100 text-sm">{typeInfo.desc}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-5">
          {/* Tên bàn */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium text-gray-700 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Tên bàn *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Bàn 1, Bàn VIP A1"
              className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500">Tên duy nhất để dễ nhận biết bàn</p>
          </div>

          {/* Loại bàn */}
          <div className="space-y-2">
            <Label htmlFor="type" className="font-medium text-gray-700">Loại bàn *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Chọn loại bàn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pool" className="flex items-center gap-2">
                  <span>🎱</span>
                  <div>
                    <div className="font-medium">Pool</div>
                    <div className="text-xs text-gray-500">Bàn tiêu chuẩn</div>
                  </div>
                </SelectItem>
                <SelectItem value="carom" className="flex items-center gap-2">
                  <span>🎯</span>
                  <div>
                    <div className="font-medium">Carom</div>
                    <div className="text-xs text-gray-500">Bàn chuyên nghiệp</div>
                  </div>
                </SelectItem>
                <SelectItem value="snooker" className="flex items-center gap-2">
                  <span>🎮</span>
                  <div>
                    <div className="font-medium">Snooker</div>
                    <div className="text-xs text-gray-500">Bàn VIP</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${typeInfo.color}`}>
              <span>{typeInfo.icon}</span>
              <span>{typeInfo.desc}</span>
            </div>
          </div>

          {/* Giá và số ghế - Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerHour" className="font-medium text-gray-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Giá/giờ (VNĐ) *
              </Label>
              <Input
                id="pricePerHour"
                name="pricePerHour"
                type="number"
                value={formData.pricePerHour}
                onChange={handleChange}
                placeholder="80000"
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seats" className="font-medium text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Số ghế
              </Label>
              <Input
                id="seats"
                name="seats"
                type="number"
                value={formData.seats}
                onChange={handleChange}
                placeholder="4"
                min="2"
                max="10"
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Trạng thái */}
          <div className="space-y-2">
            <Label htmlFor="status" className="font-medium text-gray-700">Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Trống</span>
                  </div>
                </SelectItem>
                <SelectItem value="maintenance">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    <span>Bảo trì</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium text-gray-700 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Mô tả (tuỳ chọn)
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả về bàn (vị trí, đặc điểm, ghi chú)..."
              rows={3}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">Thêm thông tin chi tiết về bàn để dễ quản lý</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            disabled={loading}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Đang tạo...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>🎱</span>
                <span>Tạo bàn mới</span>
              </div>
            )}
          </Button>
        </div>
      </form>

      {/* Preview Section */}
      <div className="bg-gray-50 border-t p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Xem trước thông tin bàn:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Tên bàn:</span>
            <span className="font-medium">{formData.name || "(Chưa có tên)"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Loại:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
              {formData.type === "pool" ? "Pool" : formData.type === "carom" ? "Carom" : "Snooker"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Giá/giờ:</span>
            <span className="font-medium">
              {formData.pricePerHour ? `${parseInt(formData.pricePerHour).toLocaleString('vi-VN')}₫` : "(Chưa nhập)"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Trạng thái:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              formData.status === "available" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}>
              {formData.status === "available" ? "Trống" : "Bảo trì"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
