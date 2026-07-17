import { useState, useEffect, useCallback } from 'react';
import { Company, Sector, Item } from '@/types';
import * as storage from '@/services/storage';

export function useInventory() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [companiesData, sectorsData, itemsData] = await Promise.all([
      storage.getCompanies(),
      storage.getSectors(),
      storage.getItems(),
    ]);
    setCompanies(companiesData);
    setSectors(sectorsData);
    setItems(itemsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Company operations
  const addCompany = useCallback(async (name: string) => {
    const company = await storage.saveCompany({ name });
    setCompanies(prev => [...prev, company]);
    return company;
  }, []);

  const editCompany = useCallback(async (id: string, name: string) => {
    const updated = await storage.updateCompany(id, { name });
    if (updated) {
      setCompanies(prev => prev.map(c => c.id === id ? updated : c));
    }
    return updated;
  }, []);

  const removeCompany = useCallback(async (id: string) => {
    const success = await storage.deleteCompany(id);
    if (success) {
      setCompanies(prev => prev.filter(c => c.id !== id));
      setSectors(prev => prev.filter(s => s.companyId !== id));
      setItems(prev => prev.filter(i => i.companyId !== id));
    }
    return success;
  }, []);

  // Sector operations
  const addSector = useCallback(async (name: string, companyId: string) => {
    const sector = await storage.saveSector({ name, companyId });
    setSectors(prev => [...prev, sector]);
    return sector;
  }, []);

  const editSector = useCallback(async (id: string, name: string) => {
    const updated = await storage.updateSector(id, { name });
    if (updated) {
      setSectors(prev => prev.map(s => s.id === id ? updated : s));
    }
    return updated;
  }, []);

  const removeSector = useCallback(async (id: string) => {
    const success = await storage.deleteSector(id);
    if (success) {
      setSectors(prev => prev.filter(s => s.id !== id));
      setItems(prev => prev.filter(i => i.sectorId !== id));
    }
    return success;
  }, []);

  // Item operations
  const addItem = useCallback(async (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem = await storage.saveItem(item);
    setItems(prev => [...prev, newItem]);
    return newItem;
  }, []);

  const editItem = useCallback(async (id: string, updates: Partial<Item>) => {
    const updated = await storage.updateItem(id, updates);
    if (updated) {
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    }
    return updated;
  }, []);

  const removeItem = useCallback(async (id: string) => {
    const success = await storage.deleteItem(id);
    if (success) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
    return success;
  }, []);

  // Computed values
  const getTotalValue = useCallback(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  const getItemsByCompany = useCallback((companyId: string) => {
    return items.filter(i => i.companyId === companyId);
  }, [items]);

  const getItemsBySector = useCallback((sectorId: string) => {
    return items.filter(i => i.sectorId === sectorId);
  }, [items]);

  const getSectorsByCompany = useCallback((companyId: string) => {
    return sectors.filter(s => s.companyId === companyId);
  }, [sectors]);

  const getCompanyName = useCallback((companyId: string) => {
    return companies.find(c => c.id === companyId)?.name || 'Unknown';
  }, [companies]);

  const getSectorName = useCallback((sectorId: string) => {
    return sectors.find(s => s.id === sectorId)?.name || 'Unknown';
  }, [sectors]);

  return {
    companies,
    sectors,
    items,
    loading,
    // Company operations
    addCompany,
    editCompany,
    removeCompany,
    // Sector operations
    addSector,
    editSector,
    removeSector,
    // Item operations
    addItem,
    editItem,
    removeItem,
    // Computed values
    getTotalValue,
    getItemsByCompany,
    getItemsBySector,
    getSectorsByCompany,
    getCompanyName,
    getSectorName,
    // Data reload
    reload: loadData,
  };
}
