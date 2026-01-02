/**
 * Database Types for Supabase
 * Auto-generated types for type-safe database queries
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            categories: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    icon: string;
                    color: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    icon?: string;
                    color?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    icon?: string;
                    color?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            payment_methods: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    icon: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    icon?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    icon?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            classifications: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            vendors: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    date: string;
                    amount: number;
                    description: string;
                    category_id: string | null;
                    payment_method_id: string | null;
                    classification_id: string | null;
                    vendor_id: string | null;
                    receipt: string | null;
                    remarks: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    date: string;
                    amount: number;
                    description: string;
                    category_id?: string | null;
                    payment_method_id?: string | null;
                    classification_id?: string | null;
                    vendor_id?: string | null;
                    receipt?: string | null;
                    remarks?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    date?: string;
                    amount?: number;
                    description?: string;
                    category_id?: string | null;
                    payment_method_id?: string | null;
                    classification_id?: string | null;
                    vendor_id?: string | null;
                    receipt?: string | null;
                    remarks?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            income_sources: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    icon: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    icon?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    icon?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            incomes: {
                Row: {
                    id: string;
                    user_id: string;
                    date: string;
                    amount: number;
                    description: string;
                    source_id: string | null;
                    remarks: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    date: string;
                    amount: number;
                    description: string;
                    source_id?: string | null;
                    remarks?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    date?: string;
                    amount?: number;
                    description?: string;
                    source_id?: string | null;
                    remarks?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            saving_locations: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            savings: {
                Row: {
                    id: string;
                    user_id: string;
                    date: string;
                    amount: number;
                    description: string;
                    location_id: string | null;
                    remarks: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    date: string;
                    amount: number;
                    description: string;
                    location_id?: string | null;
                    remarks?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    date?: string;
                    amount?: number;
                    description?: string;
                    location_id?: string | null;
                    remarks?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            budgets: {
                Row: {
                    id: string;
                    user_id: string;
                    category_id: string;
                    amount: number;
                    duration: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'bi-annual' | 'annual';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    category_id: string;
                    amount: number;
                    duration?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'bi-annual' | 'annual';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    category_id?: string;
                    amount?: number;
                    duration?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'bi-annual' | 'annual';
                    created_at?: string;
                    updated_at?: string;
                };
            };
            insights: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    content: string;
                    type: 'spending_habit' | 'price_comparison' | 'suggestion';
                    generated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    content: string;
                    type: 'spending_habit' | 'price_comparison' | 'suggestion';
                    generated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    content?: string;
                    type?: 'spending_habit' | 'price_comparison' | 'suggestion';
                    generated_at?: string;
                };
            };
        };
        Enums: {
            budget_duration: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'bi-annual' | 'annual';
            insight_type: 'spending_habit' | 'price_comparison' | 'suggestion';
        };
    };
};

// Helper types for easier use
export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update'];
