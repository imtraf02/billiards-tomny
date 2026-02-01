export interface Table {
  id: string;
  name: string;
  type: 'pool' | 'carom' | 'snooker';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  pricePerHour: number;
  seats?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTableDto {
  name: string;
  type: 'pool' | 'carom' | 'snooker';
  status?: 'available' | 'maintenance';
  pricePerHour: number;
  seats?: number;
  description?: string;
}

export interface UpdateTableDto {
  name?: string;
  type?: 'pool' | 'carom' | 'snooker';
  status?: 'available' | 'occupied' | 'reserved' | 'maintenance';
  pricePerHour?: number;
  seats?: number;
  description?: string;
}
