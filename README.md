# HomeBudgetAI 🏠🤖

A modern, mobile-first personal finance application powered by AI. Designed to help households track expenses, income, and savings with zero friction.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black) ![Tech Stack](https://img.shields.io/badge/Supabase-Database-green) ![Tech Stack](https://img.shields.io/badge/AI-Gemini_1.5-blue)

## ✨ Key Features

- **📱 Mobile-First Design**: Fully responsive UI that works like a native app. Installable as a PWA.
- **🤖 AI Receipt Scanner**: Snap a photo of a receipt, and let Google Gemini extract the vendor, date, and amount automatically.
- **🏠 Household Management**: Track finances for your entire home. Collaborate with family members.
- **📊 Comprehensive Reports**: Visualize your spending habits with dynamic charts and breakdown lists.
- **💸 Smart Budgeting**: Set savings goals and track your progress.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/UI.
- **Backend Service**: Supabase (PostgreSQL, Auth, Storage, Realtime).
- **AI Engine**: Google Gemini (via Vercel AI SDK / Google Generative AI SDK).

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/mokshdigital/homebudget.git
    cd homebudget
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file with the following keys:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    GOOGLE_GENAI_API_KEY=your_gemini_api_key
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) (or the port shown in terminal).

## 📂 Documentation

For AI Agents and Developers, please refer to the following logs for context:

- **[CONTEXT.md](./CONTEXT.md)**: High-level architectural overview and database schema.
- **[PHASE_LOG.md](./PHASE_LOG.md)**: Development phases and milestones.
- **[SESSION_LOG.md](./SESSION_LOG.md)**: Detailed history of recent changes and sessions.

## 📄 License

Private / Proprietary.
