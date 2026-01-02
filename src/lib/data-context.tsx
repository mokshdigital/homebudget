'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type {
  Category,
  PaymentMethod,
  Classification,
  Vendor,
  Transaction,
  IncomeSource,
  Income,
  SavingLocation,
  Saving,
  Budget,
  Insight,
} from './types';

interface DataContextProps {
  // User
  user: User | null;
  isUserLoading: boolean;
  signOut: () => Promise<void>;

  // Categories
  categories: Category[];
  setCategories: (items: Category[]) => Promise<void>;

  // Payment Methods
  paymentMethods: PaymentMethod[];
  setPaymentMethods: (items: PaymentMethod[]) => Promise<void>;

  // Classifications
  classifications: Classification[];
  setClassifications: (items: Classification[]) => Promise<void>;

  // Vendors
  vendors: Vendor[];
  setVendors: (items: Vendor[]) => Promise<void>;

  // Transactions
  transactions: Transaction[];
  setTransactions: (items: Transaction[]) => Promise<void>;
  addTransaction: (item: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (item: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Income Sources
  incomeSources: IncomeSource[];
  setIncomeSources: (items: IncomeSource[]) => Promise<void>;

  // Incomes
  incomes: Income[];
  setIncomes: (items: Income[]) => Promise<void>;
  addIncome: (item: Omit<Income, 'id'>) => Promise<void>;
  updateIncome: (item: Income) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

  // Saving Locations
  savingLocations: SavingLocation[];
  setSavingLocations: (items: SavingLocation[]) => Promise<void>;

  // Savings
  savings: Saving[];
  setSavings: (items: Saving[]) => Promise<void>;
  addSaving: (item: Omit<Saving, 'id'>) => Promise<void>;
  updateSaving: (item: Saving) => Promise<void>;
  deleteSaving: (id: string) => Promise<void>;

  // Budgets
  budgets: Budget[];
  setBudgets: (items: Budget[]) => Promise<void>;
  addBudget: (item: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (item: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Insights
  insights: Insight[];

  // State
  loading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

// Helper to convert snake_case to camelCase
function snakeToCamel<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (key === 'user_id' || key === 'created_at' || key === 'updated_at') continue;
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result as T;
}

// Helper to convert camelCase to snake_case
function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Data state
  const [categories, setLocalCategories] = useState<Category[]>([]);
  const [paymentMethods, setLocalPaymentMethods] = useState<PaymentMethod[]>([]);
  const [classifications, setLocalClassifications] = useState<Classification[]>([]);
  const [vendors, setLocalVendors] = useState<Vendor[]>([]);
  const [transactions, setLocalTransactions] = useState<Transaction[]>([]);
  const [incomeSources, setLocalIncomeSources] = useState<IncomeSource[]>([]);
  const [incomes, setLocalIncomes] = useState<Income[]>([]);
  const [savingLocations, setLocalSavingLocations] = useState<SavingLocation[]>([]);
  const [savings, setLocalSavings] = useState<Saving[]>([]);
  const [budgets, setLocalBudgets] = useState<Budget[]>([]);
  const [insights, setLocalInsights] = useState<Insight[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setIsUserLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsUserLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Fetch all data when user changes
  const fetchAllData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [
        categoriesRes,
        paymentMethodsRes,
        classificationsRes,
        vendorsRes,
        transactionsRes,
        incomeSourcesRes,
        incomesRes,
        savingLocationsRes,
        savingsRes,
        budgetsRes,
        insightsRes,
      ] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('payment_methods').select('*').order('name'),
        supabase.from('classifications').select('*').order('name'),
        supabase.from('vendors').select('*').order('name'),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('income_sources').select('*').order('name'),
        supabase.from('incomes').select('*').order('date', { ascending: false }),
        supabase.from('saving_locations').select('*').order('name'),
        supabase.from('savings').select('*').order('date', { ascending: false }),
        supabase.from('budgets').select('*'),
        supabase.from('insights').select('*').order('generated_at', { ascending: false }),
      ]);

      if (categoriesRes.data) setLocalCategories(categoriesRes.data.map(d => snakeToCamel<Category>(d as unknown as Record<string, unknown>)));
      if (paymentMethodsRes.data) setLocalPaymentMethods(paymentMethodsRes.data.map(d => snakeToCamel<PaymentMethod>(d as unknown as Record<string, unknown>)));
      if (classificationsRes.data) setLocalClassifications(classificationsRes.data.map(d => snakeToCamel<Classification>(d as unknown as Record<string, unknown>)));
      if (vendorsRes.data) setLocalVendors(vendorsRes.data.map(d => snakeToCamel<Vendor>(d as unknown as Record<string, unknown>)));
      if (transactionsRes.data) setLocalTransactions(transactionsRes.data.map(d => snakeToCamel<Transaction>(d as unknown as Record<string, unknown>)));
      if (incomeSourcesRes.data) setLocalIncomeSources(incomeSourcesRes.data.map(d => snakeToCamel<IncomeSource>(d as unknown as Record<string, unknown>)));
      if (incomesRes.data) setLocalIncomes(incomesRes.data.map(d => snakeToCamel<Income>(d as unknown as Record<string, unknown>)));
      if (savingLocationsRes.data) setLocalSavingLocations(savingLocationsRes.data.map(d => snakeToCamel<SavingLocation>(d as unknown as Record<string, unknown>)));
      if (savingsRes.data) setLocalSavings(savingsRes.data.map(d => snakeToCamel<Saving>(d as unknown as Record<string, unknown>)));
      if (budgetsRes.data) setLocalBudgets(budgetsRes.data.map(d => snakeToCamel<Budget>(d as unknown as Record<string, unknown>)));
      if (insightsRes.data) setLocalInsights(insightsRes.data.map(d => snakeToCamel<Insight>(d as unknown as Record<string, unknown>)));

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Generic CRUD helpers
  const createSettingsUpdater = <T extends { id: string }>(
    tableName: string,
    setLocal: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    return async (items: T[]) => {
      if (!user) return;

      // Get current items
      const { data: current } = await supabase.from(tableName).select('id');
      const currentIds = new Set((current || []).map((c: { id: string }) => c.id));
      const newIds = new Set(items.map(i => i.id));

      // Delete removed items
      const toDelete = [...currentIds].filter(id => !newIds.has(id));
      if (toDelete.length > 0) {
        await supabase.from(tableName).delete().in('id', toDelete);
      }

      // Upsert all items
      for (const item of items) {
        const snakeItem = camelToSnake(item as unknown as Record<string, unknown>);
        const { error } = await (supabase.from(tableName) as any).upsert({
          ...snakeItem,
          user_id: user.id,
        });
        if (error) {
          console.error(`Error upserting to ${tableName}:`, error);
          throw error;
        }
      }

      setLocal(items);
    };
  };

  const createCRUD = <T extends { id: string }>(
    tableName: string,
    setLocal: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    return {
      add: async (item: Omit<T, 'id'>) => {
        if (!user) throw new Error('Not authenticated');

        const snakeItem = camelToSnake(item as unknown as Record<string, unknown>);
        const { data, error } = await (supabase.from(tableName) as any)
          .insert({ ...snakeItem, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const newItem = snakeToCamel<T>(data as unknown as Record<string, unknown>);
          setLocal(prev => [newItem, ...prev]);
        }
      },
      update: async (item: T) => {
        if (!user) throw new Error('Not authenticated');

        const snakeItem = camelToSnake(item as unknown as Record<string, unknown>);
        const { error } = await (supabase.from(tableName) as any)
          .update(snakeItem)
          .eq('id', item.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setLocal(prev => prev.map(p => p.id === item.id ? item : p));
      },
      delete: async (id: string) => {
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        setLocal(prev => prev.filter(p => p.id !== id));
      },
    };
  };

  const transactionOps = createCRUD<Transaction>('transactions', setLocalTransactions);
  const incomeOps = createCRUD<Income>('incomes', setLocalIncomes);
  const savingOps = createCRUD<Saving>('savings', setLocalSavings);
  const budgetOps = createCRUD<Budget>('budgets', setLocalBudgets);

  const value: DataContextProps = {
    user,
    isUserLoading,
    signOut,

    categories,
    setCategories: createSettingsUpdater('categories', setLocalCategories),

    paymentMethods,
    setPaymentMethods: createSettingsUpdater('payment_methods', setLocalPaymentMethods),

    classifications,
    setClassifications: createSettingsUpdater('classifications', setLocalClassifications),

    vendors,
    setVendors: createSettingsUpdater('vendors', setLocalVendors),

    transactions,
    setTransactions: createSettingsUpdater('transactions', setLocalTransactions),
    addTransaction: transactionOps.add,
    updateTransaction: transactionOps.update,
    deleteTransaction: transactionOps.delete,

    incomeSources,
    setIncomeSources: createSettingsUpdater('income_sources', setLocalIncomeSources),

    incomes,
    setIncomes: createSettingsUpdater('incomes', setLocalIncomes),
    addIncome: incomeOps.add,
    updateIncome: incomeOps.update,
    deleteIncome: incomeOps.delete,

    savingLocations,
    setSavingLocations: createSettingsUpdater('saving_locations', setLocalSavingLocations),

    savings,
    setSavings: createSettingsUpdater('savings', setLocalSavings),
    addSaving: savingOps.add,
    updateSaving: savingOps.update,
    deleteSaving: savingOps.delete,

    budgets,
    setBudgets: createSettingsUpdater('budgets', setLocalBudgets),
    addBudget: budgetOps.add,
    updateBudget: budgetOps.update,
    deleteBudget: budgetOps.delete,

    insights,

    loading: loading || isUserLoading,
    error,
    refreshData: fetchAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// Export user hook for convenience
export function useUser() {
  const { user, isUserLoading } = useData();
  return { user, isUserLoading, userError: null };
}
