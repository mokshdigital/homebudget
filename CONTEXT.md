# Project Context: HomeBudgetAI

## 1. Project Overview
**HomeBudgetAI** is a modern, mobile-first personal finance application built with Next.js and Supabase. It allows users to track expenses, income, savings, and budgets within a household context. It features AI-powered tools such as receipt scanning.

## 2. Tech Stack
| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Database & Auth** | Supabase (PostgreSQL, RLS enabled) |
| **UI Library** | Shadcn/UI (based on Radix Primitives) |
| **Styling** | Tailwind CSS (Dark Mode default) |
| **AI** | Google Gemini (`gemini-3-flash-preview` via `@google/generative-ai`) |
| **PWA** | Custom Service Worker, Manifest, installable |

## 3. Architecture & Key Directories
```
src/
├── app/
│   ├── expenses/          # Expense CRUD
│   ├── income/            # Income CRUD
│   ├── savings/           # Savings CRUD
│   ├── scan/              # AI Receipt Scanner
│   │   └── _components/   # Scanner, ScanInbox
│   ├── settings/          # User preferences
│   │   └── _components/   # ManageList, HomeMembersSettings
│   └── api/
│       └── scan-receipt/  # Gemini AI endpoint
├── components/
│   ├── main-layout.tsx    # Responsive nav (Sidebar/BottomBar)
│   └── ui/                # Shadcn components
├── lib/
│   ├── data-context.tsx   # Global state (Supabase real-time)
│   └── supabase/          # Client configuration
└── hooks/
    └── use-mobile.tsx     # Mobile detection hook
```

## 4. Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `transactions` | Central table for Expenses, Income, Savings |
| `receipt_scans` | Staging area for AI-scanned receipts |
| `homes` | Multi-tenant household units |
| `home_members` | User-to-home relationships |
| `categories` | Expense categories |
| `payment_methods` | Payment method options |
| `vendors` | Store/vendor records |
| `income_sources` | Income source types |
| `saving_locations` | Savings destination types |

## 5. Mobile-First Strategy

| Pattern | Implementation |
|---------|----------------|
| **Navigation** | Sidebar (desktop) / Bottom Bar (mobile) via `MainLayout` |
| **List Views** | Data Tables (desktop) / Card Lists (mobile) via `useIsMobile` hook |
| **Settings** | Tabs (desktop, 768px+) / Select Dropdown (mobile, <768px) |
| **Forms** | Dialogs (current), consider Drawers for future |
| **Theme** | Dark mode default |

## 6. AI Features

### Receipt Scanner
- **Flow:** Upload Image → Supabase Storage → Gemini AI → JSON Extraction → `receipt_scans` table
- **Model:** `gemini-3-flash-preview`
- **Staging Pattern:** Users review AI results in "Inbox" before committing to `transactions`
- **API Route:** `/api/scan-receipt`

## 7. Environment Configuration

Required variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

## 8. Security
- **RLS Policies:** All tables have Row Level Security. Users can only access data belonging to their Home.
- **Storage:** `receipts` bucket is private with authenticated upload/download policies.
- **Auth:** Supabase Auth with email/password.

## 9. Known Issues & Workarounds

| Issue | Workaround |
|-------|------------|
| Turbopack HMR "module factory" errors | Delete `.next` folder and restart dev server |
| Env vars not loading | Restart dev server after any `.env.local` changes |
| PWA icon not updating | Hard refresh (Ctrl+Shift+R) or clear browser cache |
