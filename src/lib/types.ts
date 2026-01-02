/**
 * Application Types
 * These types mirror the database structure but with camelCase for frontend use
 */

// Re-export database types for direct Supabase usage
export type { Tables, InsertTables, UpdateTables } from './supabase/database.types';

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type PaymentMethod = {
  id: string;
  name: string;
  icon: string;
};

export type Classification = {
  id: string;
  name: string;
};

export type Vendor = {
  id: string;
  name: string;
};

export type Transaction = {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  description: string;
  categoryId: string | null;
  paymentMethodId: string | null;
  classificationId: string | null;
  vendorId?: string | null;
  receipt?: string | null;
  remarks?: string | null;
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  duration: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'bi-annual' | 'annual';
};

export type IncomeSource = {
  id: string;
  name: string;
  icon: string;
};

export type Income = {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  description: string;
  sourceId: string | null;
  remarks?: string | null;
};

export type SavingLocation = {
  id: string;
  name: string;
};

export type Saving = {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  description: string;
  locationId: string | null;
  remarks?: string | null;
};

export type Insight = {
  id: string;
  title: string;
  content: string;
  type: 'spending_habit' | 'price_comparison' | 'suggestion';
  generatedAt: string;
};

// Generic type for list items in settings
export type SettingItem = Category | PaymentMethod | Classification | Vendor | IncomeSource | SavingLocation;

export type AnyTransaction = (Transaction | Income | Saving) & {
  type: 'Expense' | 'Income' | 'Saving';
  source_location: string;
};

// Helper functions to convert between snake_case (DB) and camelCase (frontend)
export function toCamelCase<T extends Record<string, unknown>>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result as T;
}

export function toSnakeCase<T extends Record<string, unknown>>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result as T;
}
