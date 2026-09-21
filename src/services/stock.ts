import { Item } from '@/types';

/** Legacy items may lack a quantity; treat them as a single unit. */
export function itemQuantity(item: Item): number {
  return item.quantity ?? 1;
}

export function itemTotal(item: Item): number {
  return item.value * itemQuantity(item);
}

export function isOutOfStock(item: Item): boolean {
  return itemQuantity(item) === 0;
}

export function isLowStock(item: Item): boolean {
  const min = item.minQuantity ?? 0;
  return min > 0 && itemQuantity(item) > 0 && itemQuantity(item) <= min;
}

export function sumTotal(items: Item[]): number {
  return items.reduce((sum, i) => sum + itemTotal(i), 0);
}

export function sumQuantity(items: Item[]): number {
  return items.reduce((sum, i) => sum + itemQuantity(i), 0);
}

/** Lowercase and strip accents so "Informática" matches "informatica". */
export function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
