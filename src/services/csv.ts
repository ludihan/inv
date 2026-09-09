import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Company, Sector, Item, InventoryData } from '@/types';
import { getAllData, saveAllData } from './storage';

function escapeCSV(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Parse a whole CSV document into rows of fields. Handles quoted fields that
// contain commas, escaped quotes ("") and newlines, plus CRLF line endings.
function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(current);
      current = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && content[i + 1] === '\n') i++;
      row.push(current);
      rows.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  if (current !== '' || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows.filter(r => r.some(field => field.trim() !== ''));
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
  const rows = parseCSV(content);

  const companies: Company[] = [];
  const sectors: Sector[] = [];
  const items: Item[] = [];
  const now = new Date().toISOString();

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    const type = values[0]?.trim();

    if (type === 'COMPANY' && values[1]) {
      companies.push({
        id: values[1],
        name: values[2] ?? '',
        createdAt: values[8] || now,
      });
    } else if (type === 'SECTOR' && values[1]) {
      sectors.push({
        id: values[1],
        name: values[2] ?? '',
        companyId: values[3] ?? '',
        createdAt: values[8] || now,
      });
    } else if (type === 'ITEM' && values[1]) {
      const quantity = parseInt(values[6], 10);
      items.push({
        id: values[1],
        name: values[2] ?? '',
        companyId: values[3] ?? '',
        sectorId: values[4] ?? '',
        value: parseFloat(values[5]) || 0,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
        description: values[7] || undefined,
        createdAt: values[8] || now,
        updatedAt: values[9] || now,
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

  // Sectors must reference a known company (existing or newly imported)
  const validCompanyIds = new Set([
    ...existingCompanyIds,
    ...newCompanies.map(c => c.id),
  ]);
  const newSectors = data.sectors.filter(
    s => !existingSectorIds.has(s.id) && validCompanyIds.has(s.companyId),
  );

  // Items must reference a known company and sector
  const validSectorIds = new Set([
    ...existingSectorIds,
    ...newSectors.map(s => s.id),
  ]);
  const newItems = data.items.filter(
    i =>
      !existingItemIds.has(i.id) &&
      validCompanyIds.has(i.companyId) &&
      validSectorIds.has(i.sectorId),
  );

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
