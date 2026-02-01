import type { Product, CreateProductDto, UpdateProductDto, ProductFilters } from '../types';

class ProductService {
  private apiUrl = '/api/products';

  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    // TODO: Thay thế bằng API call thực tế
    const mockProducts: Product[] = [
      { id: "1", name: "Coca Cola", price: 20000, stock: 50, category: "Nước uống", createdAt: new Date(), updatedAt: new Date() },
      { id: "2", name: "Bim bim", price: 15000, stock: 30, category: "Đồ ăn vặt", createdAt: new Date(), updatedAt: new Date() },
      { id: "3", name: "Cà phê", price: 25000, stock: 20, category: "Nước uống", createdAt: new Date(), updatedAt: new Date() },
      { id: "4", name: "Nước suối", price: 10000, stock: 5, category: "Nước uống", createdAt: new Date(), updatedAt: new Date() },
      { id: "5", name: "Bánh mì", price: 20000, stock: 15, category: "Đồ ăn", createdAt: new Date(), updatedAt: new Date() },
    ];

    let filtered = mockProducts;

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.category.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters?.lowStock) {
      filtered = filtered.filter(p => p.stock < 10);
    }

    return new Promise(resolve => setTimeout(() => resolve(filtered), 300));
  }

  async getProduct(id: string): Promise<Product | null> {
    // TODO: API call
    return new Promise(resolve => setTimeout(() => resolve({
      id,
      name: "Coca Cola",
      price: 20000,
      stock: 50,
      category: "Nước uống",
      createdAt: new Date(),
      updatedAt: new Date()
    }), 300));
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    // TODO: API call
    return new Promise(resolve => setTimeout(() => resolve({
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }), 500));
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    // TODO: API call
    return new Promise(resolve => setTimeout(() => resolve({
      id,
      name: data.name || "Updated Product",
      price: data.price || 0,
      stock: data.stock || 0,
      category: data.category || "Unknown",
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }), 500));
  }

  async deleteProduct(id: string): Promise<void> {
    // TODO: API call
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  async getCategories(): Promise<string[]> {
    return Promise.resolve(["Nước uống", "Đồ ăn vặt", "Đồ ăn", "Khác"]);
  }
}

export const productService = new ProductService();
