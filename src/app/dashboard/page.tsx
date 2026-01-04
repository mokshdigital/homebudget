
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { startOfMonth } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import StatCard from './_components/stat-card';
import {
  DollarSign,
  Landmark,
  ShieldCheck,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import CategorySpendingChart from './_components/category-spending-chart';
import RecentTransactions from './_components/recent-transactions';
import RecentIncomes from './_components/recent-incomes';
import RecentSavings from './_components/recent-savings';
import { MotionDiv } from '@/components/motion-div';
import { DateRangePicker } from './_components/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { useData } from '@/lib/data-context';

export default function DashboardPage() {
  const { transactions: allTransactions, incomes: allIncomes, savings: allSavings, categories, loading, currentHome, isHomeLoading } = useData();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Set initial date range only once on mount
    if (!dateRange) {
      setDateRange({
        from: startOfMonth(new Date()),
        to: new Date(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    // Wait until dateRange is initialized
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return { transactions: [] as typeof allTransactions, incomes: [] as typeof allIncomes, savings: [] as typeof allSavings };
    }

    const fromDate = dateRange.from;
    const toDate = dateRange.to;

    const filterByDate = <T extends { date: string }>(items: T[]): T[] => {
      // Create new date objects to avoid mutating the original dateRange
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);

      return items.filter(item => {
        // Parse YYYY-MM-DD format correctly in local timezone
        const [year, month, day] = item.date.split('-').map(Number);
        const itemDate = new Date(year, month - 1, day, 12, 0, 0); // noon to avoid DST issues
        return itemDate >= start && itemDate <= end;
      });
    };

    const transactions = filterByDate(allTransactions);
    const incomes = filterByDate(allIncomes);
    const savings = filterByDate(allSavings);

    return { transactions, incomes, savings };
  }, [dateRange, allTransactions, allIncomes, allSavings]);

  const { transactions, incomes, savings } = filteredData;

  const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);

  const stats = [
    {
      title: 'Total Income',
      value: `$${totalIncome.toFixed(2)}`,
      icon: Landmark,
      className: 'bg-gradient-to-tr from-sky-700 to-sky-500',
    },
    {
      title: 'Total Spending',
      value: `$${totalSpending.toFixed(2)}`,
      icon: DollarSign,
      className: 'bg-gradient-to-tr from-blue-700 to-blue-500',
    },
    {
      title: 'Total Savings',
      value: `$${totalSavings.toFixed(2)}`,
      icon: ShieldCheck,
      className: 'bg-gradient-to-tr from-emerald-700 to-emerald-500',
    },
  ];

  // Check if user has no home
  const hasNoHome = !isHomeLoading && !currentHome;

  if (loading && !allTransactions.length && !hasNoHome) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={hasNoHome ? 'pointer-events-none select-none' : ''}
    >
      {/* No Home Banner */}
      {hasNoHome && (
        <div className="mb-6 p-4 bg-orange-600 text-white rounded-lg flex items-center gap-3 pointer-events-auto">
          <AlertTriangle className="h-6 w-6 flex-shrink-0" />
          <p className="font-medium">
            Not part of any home yet –{' '}
            <Link href="/settings?tab=home" className="underline font-bold hover:text-orange-100">
              click here
            </Link>{' '}
            to create or join a home.
          </p>
        </div>
      )}

      <div className={hasNoHome ? 'opacity-40' : ''}>
        <PageHeader
          title="Dashboard"
          description="Your financial overview for the selected period."
        >
          {isClient && <DateRangePicker onUpdate={setDateRange} defaultRange={dateRange} defaultPreset="this_month" />}
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {stats.map((stat, i) => (
            <StatCard key={stat.title} {...stat} index={i} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <RecentTransactions transactions={transactions} />
          </MotionDiv>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <RecentIncomes incomes={incomes} />
          </MotionDiv>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <RecentSavings savings={savings} />
          </MotionDiv>
        </div>
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <CategorySpendingChart transactions={transactions} categories={categories} />
        </MotionDiv>
      </div>
    </MotionDiv>
  );
}
