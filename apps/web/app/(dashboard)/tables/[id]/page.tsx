"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlayCircle, 
  StopCircle, 
  PauseCircle, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  MapPin,
  Coffee,
  Utensils,
  ArrowLeft,
  Timer,
  ShoppingCart,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const mockTable = {
  id: "1",
  name: "Bàn 1",
  type: "pool" as const,
  status: "occupied" as const,
  pricePerHour: 80000,
  seats: 4,
  description: "Bàn Pool tiêu chuẩn, view cửa sổ",
  createdAt: new Date(),
  updatedAt: new Date(),
  startTime: new Date(Date.now() - 1000 * 60 * 85), // 1 hour 25 minutes ago
};

const drinkProducts = [
  { id: "1", name: "Coca Cola", price: 20000, category: "drink", image: "🥤" },
  { id: "2", name: "Nước suối", price: 10000, category: "drink", image: "💧" },
  { id: "3", name: "Cà phê", price: 25000, category: "drink", image: "☕" },
  { id: "4", name: "Trà đào", price: 30000, category: "drink", image: "🍑" },
  { id: "5", name: "Bia Tiger", price: 35000, category: "drink", image: "🍺" },
  { id: "6", name: "Nước cam", price: 28000, category: "drink", image: "🍊" },
];

const foodProducts = [
  { id: "7", name: "Bim bim", price: 15000, category: "snack", image: "🍿" },
  { id: "8", name: "Bánh mì", price: 20000, category: "food", image: "🥪" },
  { id: "9", name: "Mì tôm", price: 30000, category: "food", image: "🍜" },
  { id: "10", name: "Hoa quả", price: 35000, category: "food", image: "🍉" },
  { id: "11", name: "Snack", price: 18000, category: "snack", image: "🥨" },
  { id: "12", name: "Khoai tây chiên", price: 25000, category: "snack", image: "🍟" },
];

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export default function TableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [table, setTable] = useState(mockTable);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [timeElapsed, setTimeElapsed] = useState({ hours: 1, minutes: 25, seconds: 30 });
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [showReservationModal, setShowReservationModal] = useState(false);

  // Calculate elapsed time
  useEffect(() => {
    if (table.status === "occupied") {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - table.startTime.getTime()) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setTimeElapsed({ hours, minutes, seconds });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [table.status, table.startTime]);

  const addToCart = (product: typeof drinkProducts[0] | typeof foodProducts[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const calculateTableCost = () => {
    const hours = timeElapsed.hours;
    const minutes = timeElapsed.minutes;
    const totalMinutes = hours * 60 + minutes;
    const ratePerMinute = table.pricePerHour / 60;
    return Math.floor(totalMinutes * ratePerMinute);
  };

  const calculateTotal = () => {
    const tableCost = calculateTableCost();
    const itemsCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return tableCost + itemsCost;
  };

  const handleStart = () => {
    setTable(prev => ({
      ...prev,
      status: "occupied" as const,
      startTime: new Date()
    }));
    alert(`Bắt đầu sử dụng bàn ${table.name}`);
  };

  const handleReserve = () => {
    if (!customerName || !customerPhone || !reservationTime) {
      alert("Vui lòng nhập đầy đủ thông tin đặt bàn");
      return;
    }
    setTable(prev => ({ ...prev, status: "reserved" as const }));
    setShowReservationModal(false);
    // Reset form fields
    setCustomerName("");
    setCustomerPhone("");
    setReservationTime("");
    alert(`Đã đặt bàn ${table.name} cho ${customerName} vào lúc ${reservationTime}`);
  };

  const handlePause = () => {
    alert(`Tạm dừng bàn ${table.name}`);
    // Logic tạm dừng thời gian
  };

  const handleEnd = () => {
    const total = calculateTotal();
    if (confirm(`Kết thúc sử dụng bàn ${table.name}. Tổng thanh toán: ${total.toLocaleString('vi-VN')}₫`)) {
      setTable(prev => ({ ...prev, status: "available" as const }));
      setCart([]);
      alert("Đã thanh toán thành công!");
    }
  };

  const handleCheckout = () => {
    const total = calculateTotal();
    if (cart.length === 0) {
      alert("Chưa có món nào trong đơn hàng");
      return;
    }
    alert(`Xác nhận đơn hàng: ${cart.length} món - Tổng: ${total.toLocaleString('vi-VN')}₫`);
    setCart([]);
  };

  const tableCost = calculateTableCost();
  const itemsCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalCost = tableCost + itemsCost;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-header text-white p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
            onClick={() => router.push("/tables")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách bàn
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{table.name}</h1>
              <p className="text-white/80">
                {table.type === "pool" ? "🎱 Bàn Pool" : table.type === "carom" ? "🎯 Bàn Carom" : "🎮 Bàn Snooker"} • {table.seats} ghế
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold">{table.pricePerHour.toLocaleString('vi-VN')}₫/giờ</div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                table.status === "available" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                  : table.status === "occupied" 
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
                  : table.status === "reserved" 
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" 
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              }`}>
                {table.status === "available" ? "🟢 Trống" : 
                 table.status === "occupied" ? "🔴 Đang sử dụng" : 
                 table.status === "reserved" ? "🟡 Đã đặt" : "⚫ Bảo trì"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Table Info and Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Table Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái bàn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Thời gian sử dụng</span>
                    </div>
                    {table.status === "occupied" ? (
                      <div className="text-3xl font-bold text-foreground">
                        {timeElapsed.hours.toString().padStart(2, '0')}:
                        {timeElapsed.minutes.toString().padStart(2, '0')}:
                        {timeElapsed.seconds.toString().padStart(2, '0')}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-muted-foreground">--:--:--</div>
                    )}
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Tiền bàn</span>
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {tableCost.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                </div>
                
                {table.description && (
                  <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Mô tả</span>
                    </div>
                    <p className="text-foreground/80">{table.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác bàn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* Start Button */}
                <Button
                  onClick={handleStart}
                  className={`h-16 ${table.status === "available" 
                    ? "bg-gradient-accent hover:opacity-90" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"}`}
                  disabled={table.status !== "available"}
                >
                  <div className="flex flex-col items-center">
                    <PlayCircle className="h-6 w-6 mb-1" />
                    <span className="text-sm">Bắt đầu</span>
                  </div>
                </Button>

                {/* Reserve Button */}
                <Button
                  onClick={() => setShowReservationModal(true)}
                  className={`h-16 ${table.status === "available" 
                    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"}`}
                  disabled={table.status !== "available"}
                >
                  <div className="flex flex-col items-center">
                    <Calendar className="h-6 w-6 mb-1" />
                    <span className="text-sm">Đặt bàn</span>
                  </div>
                </Button>

                {/* Pause Button */}
                <Button
                  onClick={handlePause}
                  className={`h-16 ${table.status === "occupied" 
                    ? "bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"}`}
                  disabled={table.status !== "occupied"}
                >
                  <div className="flex flex-col items-center">
                    <PauseCircle className="h-6 w-6 mb-1" />
                    <span className="text-sm">Tạm dừng</span>
                  </div>
                </Button>

                {/* End Button */}
                <Button
                  onClick={handleEnd}
                  className={`h-16 ${table.status === "occupied" 
                    ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"}`}
                  disabled={table.status !== "occupied"}
                >
                  <div className="flex flex-col items-center">
                    <StopCircle className="h-6 w-6 mb-1" />
                    <span className="text-sm">Kết thúc</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Orders */}
          {table.status === "occupied" && cart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Đơn hàng hiện tại
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.image}</span>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">{item.price.toLocaleString('vi-VN')}₫</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <div className="w-24 text-right font-bold">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Tổng đơn hàng</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {itemsCost.toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                      <Button
                        className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                        onClick={handleCheckout}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Xác nhận đơn
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Food & Drink Menu */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Thực đơn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="drinks" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="drinks" className="flex items-center gap-2">
                    <Coffee className="h-4 w-4" />
                    Thức uống
                  </TabsTrigger>
                  <TabsTrigger value="food" className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    Đồ ăn
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="drinks" className="space-y-3">
                  {drinkProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/50 cursor-pointer transition-all"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{product.image}</span>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.price.toLocaleString('vi-VN')}₫</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        +
                      </Button>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="food" className="space-y-3">
                  {foodProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/50 cursor-pointer transition-all"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{product.image}</span>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.price.toLocaleString('vi-VN')}₫</div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        +
                      </Button>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>

              {/* Cart Summary */}
              {cart.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Giỏ hàng</div>
                      <div className="text-lg font-bold">{cart.length} món</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Tổng tiền</div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {itemsCost.toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Nhấn vào món để thêm vào giỏ, nhấn vào giỏ hàng để xem chi tiết
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Bill Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tổng thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiền bàn:</span>
                  <span className="font-medium">{tableCost.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đồ ăn/uống:</span>
                  <span className="font-medium">{itemsCost.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600 dark:text-green-400">{totalCost.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-md mx-4 border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Đặt bàn trước</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowReservationModal(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label htmlFor="customer-name">Tên khách hàng *</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nhập tên khách hàng"
                />
              </div>
              <div>
                <Label htmlFor="customer-phone">Số điện thoại *</Label>
                <Input
                  id="customer-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <Label htmlFor="reservation-time">Thời gian đặt *</Label>
                <Input
                  id="reservation-time"
                  type="datetime-local"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="notes">Ghi chú (tuỳ chọn)</Label>
                <Input
                  id="notes"
                  placeholder="Ghi chú đặc biệt..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-border">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowReservationModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-gradient-accent"
                  onClick={handleReserve}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Xác nhận đặt bàn
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
