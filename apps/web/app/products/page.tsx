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
import CreateProductForm from "@/features/product/components/create-product-form";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export default function ProductsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [search, setSearch] = useState("");

  const products: Product[] = [
    { id: "1", name: "Coca Cola", category: "Nước uống", price: 20000, stock: 50 },
    { id: "2", name: "Bim bim", category: "Đồ ăn vặt", price: 15000, stock: 30 },
    { id: "3", name: "Cà phê", category: "Nước uống", price: 25000, stock: 20 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
          <p className="text-gray-600">Quản lý đồ ăn, thức uống trong quán</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm sản phẩm
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
                  placeholder="Tìm kiếm sản phẩm..."
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

      {/* Products Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Tên sản phẩm</th>
                  <th className="text-left py-3 px-4">Danh mục</th>
                  <th className="text-left py-3 px-4">Giá</th>
                  <th className="text-left py-3 px-4">Tồn kho</th>
                  <th className="text-left py-3 px-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">{product.price.toLocaleString()} VNĐ</td>
                    <td className="py-3 px-4">
                      <span className={product.stock < 10 ? "text-red-600 font-medium" : ""}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Product Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-2xl w-full mx-4">
            <CreateProductForm onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
