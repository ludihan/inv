# inv — Inventory Management

A local-first inventory app for tracking items grouped by **company** and **sector**
(e.g. T.I., RH, Financeiro), with monetary values in Brazilian Reais (BRL).
Built with [Expo](https://expo.dev) (SDK 57) and [Expo Router](https://docs.expo.dev/router/introduction).

All data is stored on-device with `AsyncStorage`. There is no backend; data moves
between devices through CSV export/import.

## Features

- **Companies & sectors** — nested organization; deleting a company or sector
  cascades to its sectors and items.
- **Items** — name, optional description, unit value (BRL), quantity, company and sector.
- **Home dashboard** — totals for items, quantity and value, plus breakdowns by
  company and by sector.
- **Search & filter** — filter the item list by text, company and sector.
- **CSV export / import** — share a single CSV containing companies, sectors and
  items; import merges by ID (existing rows are kept, new rows are appended).
- **Light / dark theme** — follows the system appearance.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Expo SDK 57, React Native 0.86, React 19 |
| Routing | expo-router (typed routes, file-based) |
| Storage | `@react-native-async-storage/async-storage` |
| Files | `expo-file-system`, `expo-sharing`, `expo-document-picker` |
| IDs | `expo-crypto` (`randomUUID`) |

## Project structure

```
src/
├── app/                     # expo-router routes
│   ├── _layout.tsx          # root stack + providers
│   ├── (tabs)/              # Home / Items / Companies tabs
│   └── modal/               # item, company and sector forms
├── components/              # UI components (cards, currency input, themed primitives)
├── constants/theme.ts       # colors, spacing, fonts
├── hooks/
│   ├── useInventory.tsx     # inventory state provider + CRUD
│   └── use-theme.ts         # resolves the active color palette
├── services/
│   ├── storage.ts           # AsyncStorage CRUD
│   └── csv.ts               # CSV export/import + BRL formatting
└── types/index.ts           # Company, Sector, Item, InventoryData
```

## Data model

```ts
Company { id, name, createdAt }
Sector  { id, name, companyId, createdAt }
Item    { id, name, description?, value, quantity, companyId, sectorId, createdAt, updatedAt }
```

`value` is the unit price stored as a plain number; totals are `value * quantity`.
Currency is formatted for display with `Intl.NumberFormat('pt-BR', …)`.

## CSV format

One file, one row per record, discriminated by the first column:

```
TYPE,ID,NAME,COMPANY_ID,SECTOR_ID,VALUE,QUANTITY,DESCRIPTION,CREATED_AT,UPDATED_AT
COMPANY,<id>,<name>,,,,,,<iso>,
SECTOR,<id>,<name>,<companyId>,,,,,<iso>,
ITEM,<id>,<name>,<companyId>,<sectorId>,<value>,<qty>,<description>,<iso>,<iso>
```

Import is a merge: records whose ID already exists are skipped, and imported
sectors/items that reference a missing company or sector are dropped.

## Get started

> **Note:** this app uses native modules and does **not** run in Expo Go. Use a
> development build.

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the dev server

   ```bash
   npx expo start
   ```

3. Run on a device / emulator

   ```bash
   npm run android   # or: npm run ios
   ```

   Web is supported for quick UI work (`npm run web`), but file sharing and some
   native behavior differ from device.

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run android` / `npm run ios` / `npm run web` | Start on a target platform |
| `npm run lint` | Run `expo lint` |

## Builds

EAS is configured in `eas.json` (`development`, `preview`, `production` profiles).
Android package: `com.ludihan.inv`.

```bash
eas build --profile preview --platform android
```
