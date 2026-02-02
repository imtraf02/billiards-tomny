"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  DollarSign, 
  Users, 
  Hash, 
  MessageSquare,
  Info,
  Calendar,
  Clock,
  Package
} from "lucide-react";
import Link from "next/link";

export default function CreateTablePage() {
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
      router.push("/tables");
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getTableTypeInfo = (type: string) => {
    switch (type) {
      case "pool":
        return { 
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", 
          icon: "🎱", 
          label: "Pool",
          desc: "Bàn Pool tiêu chuẩn" 
        };
      case "carom":
        return { 
          color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", 
          icon: "🎯", 
          label: "Carom",
          desc: "Bàn Carom chuyên nghiệp" 
        };
      case "snooker":
        return { 
          color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200", 
          icon: "🎮", 
          label: "Snooker",
          desc: "Bàn Snooker VIP" 
        };
      default:
        return { 
          color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", 
          icon: "🎱", 
          label: "Pool",
          desc: "" 
        };
    }
  };

  const typeInfo = getTableTypeInfo(formData.type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thêm bàn mới</h1>
          <p className="text-muted-foreground">Tạo bàn billiard mới cho quán của bạn</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/tables">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin bàn</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                {/* Tên bàn */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-medium flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Tên bàn *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="VD: Bàn 1, Bàn VIP A1"
                    className="h-11"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Tên duy nhất để dễ nhận biết bàn</p>
                </div>

                {/* Loại bàn và Trạng thái Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Loại bàn */}
                  <div className="space-y-2">
                    <Label htmlFor="type" className="font-medium">Loại bàn *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Chọn loại bàn" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pool">
                          <div className="flex items-center gap-2">
                            <span>🎱</span>
                            <div>
                              <div className="font-medium">Pool</div>
                              <div className="text-xs text-muted-foreground">Bàn tiêu chuẩn</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="carom">
                          <div className="flex items-center gap-2">
                            <span>🎯</span>
                            <div>
                              <div className="font-medium">Carom</div>
                              <div className="text-xs text-muted-foreground">Bàn chuyên nghiệp</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="snooker">
                          <div className="flex items-center gap-2">
                            <span>🎮</span>
                            <div>
                              <div className="font-medium">Snooker</div>
                              <div className="text-xs text-muted-foreground">Bàn VIP</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Trạng thái */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="font-medium">Trạng thái</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="h-11">
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
                </div>

                {/* Giá và số ghế - Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pricePerHour" className="font-medium flex items-center gap-2">
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
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seats" className="font-medium flex items-center gap-2">
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
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Mô tả */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="font-medium flex items-center gap-2">
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
                  />
                  <p className="text-xs text-muted-foreground">Thêm thông tin chi tiết về bàn để dễ quản lý</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push("/tables")}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-gradient-accent"
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
          </CardContent>
        </Card>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Xem trước thông tin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Tên bàn</div>
                  <div className="font-medium text-lg">{formData.name || "(Chưa có tên)"}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Loại bàn</div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${typeInfo.color}`}>
                    <span>{typeInfo.icon}</span>
                    <span>{typeInfo.label}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Giá/giờ</div>
                  <div className="font-medium text-lg">
                    {formData.pricePerHour ? `${parseInt(formData.pricePerHour).toLocaleString('vi-VN')}₫` : "(Chưa nhập)"}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Số ghế</div>
                  <div className="font-medium text-lg">{formData.seats} ghế</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Trạng thái</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                    formData.status === "available" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                  }`}>
                    {formData.status === "available" ? "🟢 Trống" : "⚫ Bảo trì"}
                  </div>
                </div>

                {formData.description && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Mô tả</div>
                    <div className="text-sm bg-secondary/30 p-3 rounded-lg">{formData.description}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
