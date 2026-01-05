# Project Context: HomeBudgetAI

## 1. Project Overview
**HomeBudgetAI** is a modern, mobile-first personal finance application built with Next.js and Supabase. It allows users to track expenses, income, savings, and budgets within a household context. It features AI-powered tools such as receipt scanning.

## 2. Tech Stack
- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript
- **Database & Auth:** Supabase (PostgreSQL, RLS enabled)
- **UI Library:** Shadcn/UI (based on Radix Primitives)
- **Styling:** Tailwind CSS (Dark Mode enabled)
- **AI Integrations:** Google Gemini 1.5 Flash (via `@google/generative-ai`)
- **PWA:** Fully configured with `next-pwa` patterns (manifest, service worker registration).

## 3. Architecture & Key Directories
- `src/app`: App Router structure.
  - `/expenses`, `/income`, `/savings`: Core CRUD modules.
  - `/scan`: AI Receipt Scanner module.
  - `/api/scan-receipt`: Server-side API route for calling Gemini AI.
- `src/components`: Reusable UI components.
  - `main-layout.tsx`: Handles responsive navigation (Sidebar for Desktop, Bottom Nav for Mobile).
- `src/lib`: Utilities.
  - `data-context.tsx`: Global state management for fetching real-time data from Supabase.
  - `supabase/client.ts`: Supabase client configuration.
- `supabase-migrations`: SQL scripts for DB schema management.

## 4. Database Schema (Key Tables)
- **`transactions`**: Central table for all financial records (Expenses, Income, Savings).
  - Columns: `id`, `amount`, `date`, `description`, `category_id`, `payment_method_id`, `vendor_id`, `home_id`, `user_id`.
- **`receipt_scans`**: Staging table for AI-scanned receipts.
  - Columns: `id`, `image_path` (Storage path), `scanned_data` (JSON), `status` ('pending' | 'processed').
- **`homes` & `home_members`**: Multi-tenant household system.
- **`categories`, `payment_methods`, `vendors`**: Metadata tables.

## 5. Mobile-First Strategy
- The UI is explicitly designed for mobile usage.
- **Responsive Navigation:** Bottom bar on mobile, Sidebar on desktop (`MainLayout`).
- **Conditional Rendering:** Desktop uses Data Tables (TanStack Table). Mobile uses custom "Card Lists" (`mobile-list.tsx` components) to prevent horizontal scrolling.
- **Forms:** Optimized for touch interactions.
- **Dark Mode:** Default interface style.

## 6. AI Features
- **Receipt Scanner:**
  - Logic: Upload Image -> Upload to Supabase Storage -> Send to Gemini AI API -> JSON Extraction -> Save to `receipt_scans`.
  - Staging Area: Users review scanned items in an "Inbox" before converting them to actual transactions.

## 7. Current State & Configuration
- **Environment Variables:**
  - `.env.local` must contain:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `GOOGLE_GENERATIVE_AI_API_KEY` (or `GOOGLE_GENAI_API_KEY`)
- **RLS Policies:** Strict Row Level Security is enabled. Users can only access data belonging to their Home.
