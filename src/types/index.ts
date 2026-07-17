export interface Company {
  id: string;
  name: string;
  createdAt: string; // ISO date string
}

export interface Sector {
  id: string;
  name: string;
  companyId: string;
  createdAt: string; // ISO date string
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  value: number; // Monetary value in BRL (stored as number)
  companyId: string;
  sectorId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface InventoryData {
  companies: Company[];
  sectors: Sector[];
  items: Item[];
}
