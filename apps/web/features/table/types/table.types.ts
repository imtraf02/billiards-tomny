export type TableType = "pool" | "carom" | "snooker";
export type TableStatus = "available" | "occupied" | "reserved" | "maintenance";

export interface Table {
  id: string;
  name: string;
  type: TableType;
  status: TableStatus;
  pricePerHour: number;
  seats?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableInput {
  name: string;
  type: TableType;
  status: TableStatus;
  pricePerHour: number;
  seats?: number;
  description?: string;
}

export interface UpdateTableInput {
  name?: string;
  type?: TableType;
  status?: TableStatus;
  pricePerHour?: number;
  seats?: number;
  description?: string;
}

export interface GetTablesQuery {
  search?: string;
  type?: TableType;
  status?: TableStatus;
}
