import type { Table, CreateTableDto, UpdateTableDto } from '../types';

class TableService {
  private apiUrl = '/api/tables';

  async getTables(): Promise<Table[]> {
    // TODO: API call
    return Promise.resolve([
      { id: "1", name: "Bàn 1", type: "pool", status: "occupied", pricePerHour: 80000, seats: 4, createdAt: new Date(), updatedAt: new Date() },
      { id: "2", name: "Bàn 2", type: "pool", status: "available", pricePerHour: 80000, seats: 4, createdAt: new Date(), updatedAt: new Date() },
      { id: "3", name: "Bàn VIP 1", type: "snooker", status: "reserved", pricePerHour: 150000, seats: 6, createdAt: new Date(), updatedAt: new Date() },
    ]);
  }

  async createTable(data: CreateTableDto): Promise<Table> {
    // TODO: API call
    return Promise.resolve({
      id: Date.now().toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  async updateTable(id: string, data: UpdateTableDto): Promise<Table> {
    // TODO: API call
    return Promise.resolve({
      id,
      name: data.name || "Updated Table",
      type: data.type || "pool",
      status: data.status || "available",
      pricePerHour: data.pricePerHour || 0,
      seats: data.seats || 4,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}

export const tableService = new TableService();
