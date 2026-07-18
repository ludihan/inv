import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Company, Sector, Item, InventoryData } from '@/types';

const STORAGE_KEYS = {
  COMPANIES: '@inventory_companies',
  SECTORS: '@inventory_sectors',
  ITEMS: '@inventory_items',
};

function generateId(): string {
  return Crypto.randomUUID();
}

// Company operations
export async function getCompanies(): Promise<Company[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.COMPANIES);
  return data ? JSON.parse(data) : [];
}

export async function saveCompany(company: Omit<Company, 'id' | 'createdAt'>): Promise<Company> {
  const companies = await getCompanies();
  const newCompany: Company = {
    ...company,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  companies.push(newCompany);
  await AsyncStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  return newCompany;
}

export async function updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
  const companies = await getCompanies();
  const index = companies.findIndex(c => c.id === id);
  if (index === -1) return null;
  companies[index] = { ...companies[index], ...updates };
  await AsyncStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  return companies[index];
}

export async function deleteCompany(id: string): Promise<boolean> {
  const companies = await getCompanies();
  const filtered = companies.filter(c => c.id !== id);
  if (filtered.length === companies.length) return false;
  await AsyncStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(filtered));
  // Also delete associated sectors
  const sectors = await getSectors();
  const filteredSectors = sectors.filter(s => s.companyId !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(filteredSectors));
  // Also delete associated items
  const items = await getItems();
  const filteredItems = items.filter(i => i.companyId !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(filteredItems));
  return true;
}

// Sector operations
export async function getSectors(): Promise<Sector[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SECTORS);
  return data ? JSON.parse(data) : [];
}

export async function getSectorsByCompany(companyId: string): Promise<Sector[]> {
  const sectors = await getSectors();
  return sectors.filter(s => s.companyId === companyId);
}

export async function saveSector(sector: Omit<Sector, 'id' | 'createdAt'>): Promise<Sector> {
  const sectors = await getSectors();
  const newSector: Sector = {
    ...sector,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  sectors.push(newSector);
  await AsyncStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(sectors));
  return newSector;
}

export async function updateSector(id: string, updates: Partial<Sector>): Promise<Sector | null> {
  const sectors = await getSectors();
  const index = sectors.findIndex(s => s.id === id);
  if (index === -1) return null;
  sectors[index] = { ...sectors[index], ...updates };
  await AsyncStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(sectors));
  return sectors[index];
}

export async function deleteSector(id: string): Promise<boolean> {
  const sectors = await getSectors();
  const filtered = sectors.filter(s => s.id !== id);
  if (filtered.length === sectors.length) return false;
  await AsyncStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(filtered));
  // Also delete associated items
  const items = await getItems();
  const filteredItems = items.filter(i => i.sectorId !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(filteredItems));
  return true;
}

// Item operations
export async function getItems(): Promise<Item[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.ITEMS);
  return data ? JSON.parse(data) : [];
}

export async function getItemsByCompany(companyId: string): Promise<Item[]> {
  const items = await getItems();
  return items.filter(i => i.companyId === companyId);
}

export async function getItemsBySector(sectorId: string): Promise<Item[]> {
  const items = await getItems();
  return items.filter(i => i.sectorId === sectorId);
}

export async function saveItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
  const items = await getItems();
  const newItem: Item = {
    ...item,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(newItem);
  await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  return newItem;
}

export async function updateItem(id: string, updates: Partial<Item>): Promise<Item | null> {
  const items = await getItems();
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  return items[index];
}

export async function deleteItem(id: string): Promise<boolean> {
  const items = await getItems();
  const filtered = items.filter(i => i.id !== id);
  if (filtered.length === items.length) return false;
  await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(filtered));
  return true;
}

// Get all inventory data
export async function getAllData(): Promise<InventoryData> {
  const [companies, sectors, items] = await Promise.all([
    getCompanies(),
    getSectors(),
    getItems(),
  ]);
  return { companies, sectors, items };
}

// Save all inventory data (for import)
export async function saveAllData(data: InventoryData): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(data.companies)),
    AsyncStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(data.sectors)),
    AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(data.items)),
  ]);
}

// Clear all data
export async function clearAllData(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.COMPANIES),
    AsyncStorage.removeItem(STORAGE_KEYS.SECTORS),
    AsyncStorage.removeItem(STORAGE_KEYS.ITEMS),
  ]);
}
