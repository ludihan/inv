import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Company, Sector, Item, InventoryData } from '@/types';
import { getAllData, saveAllData } from './storage';

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export async function exportToCSV(): Promise<void> {
  const data = await getAllData();
  
  // Companies CSV
  let csv = 'TYPE,ID,NAME,COMPANY_ID,SECTOR_ID,VALUE,QUANTITY,DESCRIPTION,CREATED_AT,UPDATED_AT\n';
  
  for (const company of data.companies) {
    csv += `COMPANY,${company.id},${escapeCSV(company.name)},,,,,"",${company.createdAt},\n`;
  }
  
  for (const sector of data.sectors) {
    csv += `SECTOR,${sector.id},${escapeCSV(sector.name)},${sector.companyId},,,,"",${sector.createdAt},\n`;
  }
  
  for (const item of data.items) {
    csv += `ITEM,${item.id},${escapeCSV(item.name)},${item.companyId},${item.sectorId},${item.value},${item.quantity || 1},${escapeCSV(item.description || '')},${item.createdAt},${item.updatedAt}\n`;
  }
  
  const file = new File(Paths.document, 'inventory_export.csv');
  await file.write(csv);
  
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri);
  }
}

export async function importFromCSV(): Promise<InventoryData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'text/csv',
    copyToCacheDirectory: true,
  });
  
  if (result.canceled || !result.assets[0]) {
    return null;
  }
  
  const fileUri = result.assets[0].uri;
  const file = new File(fileUri);
  const content = await file.text();
  const lines = content.split('\n').filter(line => line.trim());
  
  const companies: Company[] = [];
  const sectors: Sector[] = [];
  const items: Item[] = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const type = values[0];
    
    if (type === 'COMPANY') {
      companies.push({
        id: values[1],
        name: values[2],
        createdAt: values[8] || new Date().toISOString(),
      });
    } else if (type === 'SECTOR') {
      sectors.push({
        id: values[1],
        name: values[2],
        companyId: values[3],
        createdAt: values[8] || new Date().toISOString(),
      });
    } else if (type === 'ITEM') {
      items.push({
        id: values[1],
        name: values[2],
        companyId: values[3],
        sectorId: values[4],
        value: parseFloat(values[5]) || 0,
        quantity: parseInt(values[6]) || 1,
        description: values[7] || undefined,
        createdAt: values[8] || new Date().toISOString(),
        updatedAt: values[9] || new Date().toISOString(),
      });
    }
  }
  
  return { companies, sectors, items };
}

export async function importAndMergeCSV(): Promise<{ imported: boolean; message: string }> {
  const data = await importFromCSV();
  
  if (!data) {
    return { imported: false, message: 'Import cancelled' };
  }
  
  const currentData = await getAllData();
  
  // Merge data (simple approach: append new items, skip duplicates by ID)
  const existingCompanyIds = new Set(currentData.companies.map(c => c.id));
  const existingSectorIds = new Set(currentData.sectors.map(s => s.id));
  const existingItemIds = new Set(currentData.items.map(i => i.id));
  
  const newCompanies = data.companies.filter(c => !existingCompanyIds.has(c.id));
  const newSectors = data.sectors.filter(s => !existingSectorIds.has(s.id));
  const newItems = data.items.filter(i => !existingItemIds.has(i.id));
  
  const mergedData: InventoryData = {
    companies: [...currentData.companies, ...newCompanies],
    sectors: [...currentData.sectors, ...newSectors],
    items: [...currentData.items, ...newItems],
  };
  
  await saveAllData(mergedData);
  
  return {
    imported: true,
    message: `Imported ${newCompanies.length} companies, ${newSectors.length} sectors, ${newItems.length} items`,
  };
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseBRL(value: string): number {
  const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}
