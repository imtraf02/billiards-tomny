"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Gọi API để tạo bàn
    console.log("Form data:", formData);
    
    // Giả lập API call
    setTimeout(() => {
      setLoading(false);
      onClose();
      router.refresh();
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold">Thêm bàn mới</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Tên bàn *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Bàn 1, Bàn VIP 2"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Loại bàn *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại bàn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pool">Pool</SelectItem>
                <SelectItem value="carom">Carom</SelectItem>
                <SelectItem value="snooker">Snooker</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="pricePerHour">Giá mỗi giờ (VNĐ) *</Label>
            <Input
              id="pricePerHour"
              name="pricePerHour"
              type="number"
              value={formData.pricePerHour}
              onChange={handleChange}
              placeholder="80000"
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Trạng thái</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Trống</SelectItem>
                <SelectItem value="maintenance">Bảo trì</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo bàn"}
          </Button>
        </div>
      </form>
    </div>
  );
}
