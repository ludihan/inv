# Inventory Management System - Implementation Plan

## Overview
Build an inventory management system for tracking items grouped by company and sector (e.g., T.I.), with monetary values in Brazilian Reais (BRL). The app will use local storage with CSV export/import and be ready for future backend integration.

## Data Model

### Company
```typescript
interface Company {
  id: string;          // UUID
  name: string;        // Company name
  createdAt: Date;
}
```

### Sector
```typescript
interface Sector {
  id: string;          // UUID
  name: string;        // Sector name (e.g., "T.I.", "RH", "Financeiro")
  companyId: string;   // Foreign key to Company
  createdAt: Date;
}
```

### Item
```typescript
interface Item {
  id: string;          // UUID
  name: string;        // Item name/description
  description?: string; // Optional detailed description
  value: number;       // Monetary value in BRL (stored as number, displayed as R$ X.XXX,XX)
  companyId: string;   // Foreign key to Company
  sectorId: string;    // Foreign key to Sector
  createdAt: Date;
  updatedAt: Date;
}
```

## Storage Layer

### Architecture
- **Primary Storage**: AsyncStorage (local, persistent)
- **Export/Import**: CSV format for portability between instances
- **Future Backend**: Abstract interface allows swapping to API calls later

### Files to Create
1. `src/types/index.ts` - TypeScript interfaces
2. `src/services/storage.ts` - AsyncStorage wrapper with CRUD operations
3. `src/services/csv.ts` - CSV export/import utilities
4. `src/hooks/useInventory.ts` - React hook for inventory state management

## UI Structure

### Tab Navigation (3 tabs)
1. **Home** - Dashboard with summary statistics
2. **Items** - Item management (list, add, edit, delete)
3. **Companies** - Company management with nested sectors

### Screens

#### Home Tab (`src/app/index.tsx`)
- Total items count
- Total inventory value (R$)
- Items by company (top 5)
- Items by sector (top 5)
- Recent items list

#### Items Tab (`src/app/items.tsx`)
- Search bar to filter items
- List of items showing: name, company, sector, value (R$)
- FAB to add new item
- Swipe/tap to edit or delete
- Filter by company/sector

#### Companies Tab (`src/app/companies.tsx`)
- List of companies
- Tap to expand and see sectors
- Add/edit/delete companies
- Add/edit/delete sectors within companies
- Show item count per sector

### Modal Screens (for forms)
1. `src/app/modal/item-form.tsx` - Add/edit item form
2. `src/app/modal/company-form.tsx` - Add/edit company form
3. `src/app/modal/sector-form.tsx` - Add/edit sector form

## Features

### Currency Formatting (BRL)
- Display: R$ 1.234,56
- Input: Accept numbers, format on display
- Storage: Store as number (no currency symbol)

### Search & Filter
- Search items by name
- Filter by company
- Filter by sector

### CSV Export/Import
- Export all data (companies, sectors, items) to CSV
- Import CSV to restore/merge data
- Handle duplicates on import

## File Structure
```
src/
├── types/
│   └── index.ts              # TypeScript interfaces
├── services/
│   ├── storage.ts            # AsyncStorage CRUD operations
│   └── csv.ts                # CSV export/import
├── hooks/
│   └── useInventory.ts       # Inventory state hook
├── components/
│   ├── item-card.tsx         # Item display component
│   ├── company-card.tsx      # Company display with sectors
│   ├── sector-chip.tsx       # Sector tag component
│   ├── empty-state.tsx       # Empty list placeholder
│   └── currency-input.tsx    # BRL currency input
├── app/
│   ├── _layout.tsx           # Root layout (updated tabs)
│   ├── index.tsx             # Home dashboard
│   ├── items.tsx             # Items list
│   ├── companies.tsx         # Companies list
│   └── modal/
│       ├── item-form.tsx     # Add/edit item
│       ├── company-form.tsx  # Add/edit company
│       └── sector-form.tsx   # Add/edit sector
```

## Implementation Order

1. Create types and storage service
2. Build inventory hook
3. Create company/sector management
4. Create item management
5. Build home dashboard
6. Add CSV export/import
7. Polish UI and error handling

## Dependencies Needed
- `expo-file-system` - For CSV file operations
- `expo-sharing` - For sharing exported CSV
- `expo-document-picker` - For importing CSV files
- `uuid` - For generating unique IDs (or use `crypto.randomUUID()`)
