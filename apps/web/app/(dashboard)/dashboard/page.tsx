"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { 
  DollarSign, 
  Users, 
  Clock, 
  Package,
  TrendingUp,
  Calendar,
  ShoppingBag,
  BarChart3
} from "lucide-react";
import { useProducts } from "@/features/product/hooks";
import { useTables } from "@/features/table/hooks";
import { useBookings } from "@/features/booking/hooks";
import { useOrders } from "@/features/order/hooks";

export default function DashboardPage() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: tables, isLoading: tablesLoading } = useTables();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  const stats = {
    todayRevenue: 12500000,
    activeCustomers: 24,
    availableTables: 12,
    newOrders: 8,
    todayBookings: 15,
    occupiedTables: 8,
    lowStockProducts: 3,
    monthlyRevenue: 185000000,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Tổng quan hệ thống quản lý bida</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Hôm nay
          </Button>
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            Báo cáo chi tiết
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu hôm nay</CardTitle>
            <div className="rounded-full bg-green-100 p-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.todayRevenue.toLocaleString('vi-VN')}₫
            </div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="mr-1 h-4 w-4" />
              <span>+15% so với hôm qua</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách đang chơi</CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-sm text-gray-500">
              {stats.occupiedTables} bàn đang sử dụng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bàn trống</CardTitle>
            <div className="rounded-full bg-yellow-100 p-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableTables}</div>
            <p className="text-sm text-gray-500">
              Còn {Math.round((stats.availableTables / (stats.availableTables + stats.occupiedTables)) * 100)}% bàn trống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng mới</CardTitle>
            <div className="rounded-full bg-purple-100 p-2">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newOrders}</div>
            <p className="text-sm text-gray-500">Chờ xác nhận</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Đặt bàn gần đây</CardTitle>
              <Button variant="ghost" size="sm">
                Xem tất cả
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border">
                <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-gray-600 border-b">
                  <div className="col-span-3">Khách hàng</div>
                  <div className="col-span-2">Bàn</div>
                  <div className="col-span-3">Thời gian</div>
                  <div className="col-span-2">Số người</div>
                  <div className="col-span-2">Trạng thái</div>
                </div>
                
                <div className="divide-y">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50">
                      <div className="col-span-3">
                        <div className="font-medium">Nguyễn Văn {String.fromCharCode(64 + item)}</div>
                        <div className="text-sm text-gray-500">098765432{item}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="font-medium">Bàn {item}, {item + 2}</div>
                      </div>
                      <div className="col-span-3">
                        <div className="font-medium">14:00 - 16:00</div>
                        <div className="text-sm text-gray-500">Hôm nay</div>
                      </div>
                      <div className="col-span-2">
                        <div className="font-medium">{item + 3} người</div>
                      </div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Đang chơi
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <ShoppingBag className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Doanh thu tháng</div>
                    <div className="text-sm text-gray-500">{stats.monthlyRevenue.toLocaleString('vi-VN')}₫</div>
                  </div>
                </div>
                <div className="text-green-600 font-medium">+12%</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="rounded-full bg-yellow-100 p-2 mr-3">
                    <Package className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium">Sản phẩm tồn kho thấp</div>
                    <div className="text-sm text-gray-500">{stats.lowStockProducts} sản phẩm</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Xem
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-100 p-2 mr-3">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Đặt bàn hôm nay</div>
                    <div className="text-sm text-gray-500">{stats.todayBookings} lượt</div>
                  </div>
                </div>
                <div className="text-blue-600 font-medium">Đầy 70%</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="rounded-full bg-purple-100 p-2 mr-3">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">Khách hàng thân thiết</div>
                    <div className="text-sm text-gray-500">24 khách</div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Chi tiết
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Đơn hàng gần đây</CardTitle>
              <Button variant="ghost" size="sm">
                Xem tất cả
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">ORD-00{item}</div>
                      <div className="text-sm text-gray-500">Bàn {item + 1}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{(item * 180000).toLocaleString('vi-VN')}₫</div>
                      <div className="text-sm text-gray-500">11:{item * 15} AM</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item === 1 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : item === 2 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item === 1 ? 'Chờ xác nhận' : item === 2 ? 'Đang chuẩn bị' : 'Hoàn thành'}
                    </span>
                    <Button variant="ghost" size="sm">
                      Chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái hệ thống</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-green-500"></div>
                  <span>API Server</span>
                </div>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Database</span>
                </div>
                <span className="text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Payment Gateway</span>
                </div>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Print Service</span>
                </div>
                <span className="text-green-600 font-medium">Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Products */}
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Coca Cola', sales: 45, revenue: 900000 },
                { name: 'Bim bim', sales: 32, revenue: 480000 },
                { name: 'Cà phê', sales: 28, revenue: 700000 },
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.sales} đơn</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{product.revenue.toLocaleString('vi-VN')}₫</div>
                    <div className="text-sm text-green-600">+{Math.round((index + 1) * 8)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Đặt bàn mới
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Tạo đơn hàng
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Thêm khách hàng
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Nhập kho
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
