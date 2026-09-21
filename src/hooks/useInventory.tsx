import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { Company, Sector, Item, InventoryData } from '@/types';
import * as storage from '@/services/storage';
import { sumQuantity, sumTotal } from '@/services/stock';

interface InventoryContextValue {
  companies: Company[];
  sectors: Sector[];
  items: Item[];
  loading: boolean;
  addCompany: (name: string) => Promise<Company>;
  editCompany: (id: string, name: string) => Promise<Company | null>;
  removeCompany: (id: string) => Promise<boolean>;
  addSector: (name: string, companyId: string) => Promise<Sector>;
  editSector: (id: string, name: string) => Promise<Sector | null>;
  removeSector: (id: string) => Promise<boolean>;
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Item>;
  editItem: (id: string, updates: Partial<Item>) => Promise<Item | null>;
  removeItem: (id: string) => Promise<boolean>;
  duplicateItem: (id: string) => Promise<Item | null>;
  adjustQuantity: (id: string, delta: number) => Promise<void>;
  clearAll: () => Promise<void>;
  loadSampleData: () => Promise<void>;
  getTotalValue: () => number;
  getTotalQuantity: () => number;
  getItemsByCompany: (companyId: string) => Item[];
  getItemsBySector: (sectorId: string) => Item[];
  getSectorsByCompany: (companyId: string) => Sector[];
  getCompanyName: (companyId: string) => string;
  getSectorName: (sectorId: string) => string;
  reload: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsRef = useRef<Item[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const applyData = useCallback((data: InventoryData) => {
    setCompanies(data.companies);
    setSectors(data.sectors);
    setItems(data.items);
    setLoading(false);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    applyData(await storage.getAllData());
  }, [applyData]);

  useEffect(() => {
    let active = true;
    storage.getAllData().then(data => {
      if (active) applyData(data);
    });
    return () => {
      active = false;
    };
  }, [applyData]);

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

  const duplicateItem = useCallback(async (id: string) => {
    const source = itemsRef.current.find(i => i.id === id);
    if (!source) return null;
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = source;
    const copy = await storage.saveItem({ ...rest, name: `${source.name} (copy)` });
    setItems(prev => [...prev, copy]);
    return copy;
  }, []);

  // Rapid +/- taps must not race on the read-modify-write in storage, so
  // quantity changes are chained one after another.
  const adjustQueue = useRef<Promise<unknown>>(Promise.resolve());
  const adjustQuantity = useCallback((id: string, delta: number) => {
    const run = adjustQueue.current.then(async () => {
      const updated = await storage.adjustItemQuantity(id, delta);
      if (updated) setItems(prev => prev.map(i => (i.id === id ? updated : i)));
    });
    adjustQueue.current = run.catch(() => {});
    return run;
  }, []);

  const clearAll = useCallback(async () => {
    await storage.clearAllData();
    setCompanies([]);
    setSectors([]);
    setItems([]);
  }, []);

  const loadSampleData = useCallback(async () => {
    const acme = await storage.saveCompany({ name: 'Acme Ltda.' });
    const ti = await storage.saveSector({ name: 'T.I.', companyId: acme.id });
    const rh = await storage.saveSector({ name: 'RH', companyId: acme.id });
    const samples = [
      { name: 'Notebook Dell Latitude', value: 5499.9, quantity: 12, minQuantity: 3, sku: 'TI-0001', sectorId: ti.id },
      { name: 'Monitor 24"', value: 899.0, quantity: 2, minQuantity: 4, sku: 'TI-0002', sectorId: ti.id },
      { name: 'Cadeira ergonômica', value: 1250.0, quantity: 20, minQuantity: 5, sku: 'RH-0001', sectorId: rh.id },
      { name: 'Headset USB', value: 189.9, quantity: 0, minQuantity: 2, sku: 'TI-0003', sectorId: ti.id },
    ];
    const created: Item[] = [];
    for (const { sectorId, ...rest } of samples) {
      created.push(await storage.saveItem({ ...rest, companyId: acme.id, sectorId }));
    }
    setCompanies(prev => [...prev, acme]);
    setSectors(prev => [...prev, ti, rh]);
    setItems(prev => [...prev, ...created]);
  }, []);

  const getTotalValue = useCallback(() => sumTotal(items), [items]);

  const getTotalQuantity = useCallback(() => sumQuantity(items), [items]);

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

  return (
    <InventoryContext.Provider
      value={{
        companies, sectors, items, loading,
        addCompany, editCompany, removeCompany,
        addSector, editSector, removeSector,
        addItem, editItem, removeItem,
        duplicateItem, adjustQuantity, clearAll, loadSampleData,
        getTotalValue, getTotalQuantity,
        getItemsByCompany, getItemsBySector, getSectorsByCompany,
        getCompanyName, getSectorName,
        reload: loadData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
