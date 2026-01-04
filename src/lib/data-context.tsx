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
  Home,
  HomeMember,
} from './types';

interface DataContextProps {
  // User
  user: User | null;
  isUserLoading: boolean;
  signOut: () => Promise<void>;

  // Home/Household
  currentHome: Home | null;
  homeMembers: HomeMember[];
  isOwner: boolean;
  isHomeLoading: boolean;
  needsHomeSetup: boolean;
  createHome: (name: string) => Promise<void>;
  updateHomeName: (name: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;

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

  // Home state
  const [currentHome, setCurrentHome] = useState<Home | null>(null);
  const [homeMembers, setHomeMembers] = useState<HomeMember[]>([]);
  const [isHomeLoading, setIsHomeLoading] = useState(true);
  const [needsHomeSetup, setNeedsHomeSetup] = useState(false);

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

  // Computed: Is current user the owner?
  const isOwner = useMemo(() => {
    if (!user || !homeMembers.length) return false;
    const currentMember = homeMembers.find(m => m.userId === user.id);
    return currentMember?.role === 'owner';
  }, [user, homeMembers]);

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

  // Fetch home data when user changes
  const fetchHomeData = useCallback(async () => {
    if (!user) {
      setIsHomeLoading(false);
      return;
    }

    setIsHomeLoading(true);
    try {
      // Step 1 & 2: Get active home details in one secure call
      const { data: activeHomeData, error: activeHomeError } = await (supabase
        .rpc('get_user_active_home') as any)
        .maybeSingle();

      if (activeHomeError) throw activeHomeError;

      if (!activeHomeData) {
        // User has no home, needs setup
        setNeedsHomeSetup(true);
        setCurrentHome(null);
        setHomeMembers([]);
        setIsHomeLoading(false);
        setLoading(false); // No home = no data to load
        return;
      }

      // Success! Set the home data
      const homeObj: Home = {
        id: activeHomeData.id,
        name: activeHomeData.name,
        inviteCode: activeHomeData.invite_code,
        inviteExpiresAt: activeHomeData.invite_expires_at,
        createdAt: activeHomeData.created_at,
        createdBy: activeHomeData.created_by,
      };

      setCurrentHome(homeObj);
      setNeedsHomeSetup(false);

      // Step 3: Get all members of this home
      const { data: membersData } = await supabase
        .from('home_members')
        .select('*')
        .eq('home_id', homeObj.id);

      if (membersData) {
        // Get user emails for display
        const membersList = membersData.map(m => snakeToCamel<HomeMember>(m as unknown as Record<string, unknown>));
        setHomeMembers(membersList);
      }

      setNeedsHomeSetup(false);
    } catch (err) {
      console.error('Error fetching home data:', err);
      // In case of error, assume setup might be needed or just stop loading
      setNeedsHomeSetup(false); // Don't force redirect on error, might just be network
    } finally {
      setIsHomeLoading(false);
    }
  }, [user, supabase]);



  useEffect(() => {
    if (user) {
      fetchHomeData();
    }
  }, [user, fetchHomeData]);

  // Create a new home (for first-time users)
  const createHome = async (name: string) => {
    if (!user) throw new Error('Not authenticated');

    // 1. Create the home
    const { data: homeData, error: homeError } = await supabase
      .from('homes')
      .insert({ name, created_by: user.id } as any)
      .select()
      .single();

    if (homeError) throw homeError;

    // 2. Add user as owner
    const { error: memberError } = await supabase
      .from('home_members')
      .insert({
        home_id: (homeData as any).id,
        user_id: user.id,
        role: 'owner',
        display_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
      } as any);

    if (memberError) {
      // If adding member fails, we should ideally delete the home to clean up,
      // but for now let's just throw. The user might have created a 'ghost' home.
      console.error("Failed to add member to new home:", memberError);
      throw memberError;
    }

    // 3. Force refresh immediately
    await fetchHomeData();
    setNeedsHomeSetup(false);
  };

  // Update home name
  const updateHomeName = async (name: string) => {
    if (!currentHome) throw new Error('No home');

    const { error } = await (supabase
      .from('homes') as any)
      .update({ name })
      .eq('id', currentHome.id);

    if (error) throw error;
    setCurrentHome({ ...currentHome, name });
  };

  // Remove a member
  const removeMember = async (memberId: string) => {
    if (!currentHome) throw new Error('No home');

    const { error } = await supabase
      .from('home_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
    setHomeMembers(prev => prev.filter(m => m.id !== memberId));
  };

  // Fetch all data when home is ready
  const fetchAllData = useCallback(async () => {
    if (!user || !currentHome) {
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
        supabase.from('categories').select('*').eq('home_id', currentHome.id).order('name'),
        supabase.from('payment_methods').select('*').eq('home_id', currentHome.id).order('name'),
        supabase.from('classifications').select('*').eq('home_id', currentHome.id).order('name'),
        supabase.from('vendors').select('*').eq('home_id', currentHome.id).order('name'),
        supabase.from('transactions').select('*').eq('home_id', currentHome.id).order('date', { ascending: false }),
        supabase.from('income_sources').select('*').eq('home_id', currentHome.id).order('name'),
        supabase.from('incomes').select('*').eq('home_id', currentHome.id).order('date', { ascending: false }),
        supabase.from('saving_locations').select('*').eq('home_id', currentHome.id).order('name'),
        supabase.from('savings').select('*').eq('home_id', currentHome.id).order('date', { ascending: false }),
        supabase.from('budgets').select('*').eq('home_id', currentHome.id),
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
  }, [user, currentHome, supabase]);

  useEffect(() => {
    if (user && currentHome) {
      fetchAllData();
    }
  }, [user, currentHome, fetchAllData]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentHome(null);
    setHomeMembers([]);
  };

  // Generic CRUD helpers - now using home_id
  const createSettingsUpdater = <T extends { id: string }>(
    tableName: string,
    setLocal: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    return async (items: T[]) => {
      if (!user || !currentHome) return;

      // Get current items for this home
      const { data: current } = await supabase.from(tableName).select('id').eq('home_id', currentHome.id);
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
          home_id: currentHome.id,
          user_id: user.id, // satisfying legacy NOT NULL constraint
        });
        if (error) {
          console.error(`Error upserting to ${tableName}:`, error);
          console.log(`Failed Payload:`, { ...snakeItem, home_id: currentHome.id, user_id: user.id });
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
        if (!user || !currentHome) throw new Error('Not authenticated');

        const snakeItem = camelToSnake(item as unknown as Record<string, unknown>);
        const { data, error } = await (supabase.from(tableName) as any)
          .insert({
            ...snakeItem,
            home_id: currentHome.id,
            added_by: user.id,
            user_id: user.id, // satisfying legacy NOT NULL constraint
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const newItem = snakeToCamel<T>(data as unknown as Record<string, unknown>);
          setLocal(prev => [newItem, ...prev]);
        }
      },
      update: async (item: T) => {
        if (!user || !currentHome) throw new Error('Not authenticated');

        const snakeItem = camelToSnake(item as unknown as Record<string, unknown>);
        const { error } = await (supabase.from(tableName) as any)
          .update(snakeItem)
          .eq('id', item.id)
          .eq('home_id', currentHome.id);

        if (error) throw error;
        setLocal(prev => prev.map(p => p.id === item.id ? item : p));
      },
      delete: async (id: string) => {
        if (!user || !currentHome) throw new Error('Not authenticated');

        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', id)
          .eq('home_id', currentHome.id);

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

    // Home
    currentHome,
    homeMembers,
    isOwner,
    isHomeLoading,
    needsHomeSetup,
    createHome,
    updateHomeName,
    removeMember,

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

    loading: loading || isUserLoading || isHomeLoading,
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
