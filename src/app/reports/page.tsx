
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { startOfMonth } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { DateRangePicker } from "@/app/dashboard/_components/date-range-picker";
import { ReportCard } from "./_components/report-card";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow, TableFooter } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DateRange } from "react-day-picker";
import type { AnyTransaction } from "@/lib/types";
import { useData } from "@/lib/data-context";

import { useIsMobile } from '@/hooks/use-mobile';
import { MobileReportList } from './_components/mobile-report-list';

export default function ReportsPage() {
  const {
    transactions: allTransactions,
    incomes: allIncomes,
    savings: allSavings,
    categories,
    incomeSources,
    savingLocations,
  } = useData();

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsClient(true);
    if (!dateRange) {
      setDateRange({
        from: startOfMonth(new Date()),
        to: new Date(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return { transactions: [], incomes: [], savings: [] };
    }

    const fromDate = dateRange.from;
    const toDate = dateRange.to;

    const filterByDate = <T extends { date: string }>(items: T[]): T[] => {
      const start = new Date(fromDate.setHours(0, 0, 0, 0));
      const end = new Date(toDate.setHours(23, 59, 59, 999));
      return items.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
      });
    };

    const transactions = filterByDate(allTransactions);
    const incomes = filterByDate(allIncomes);
    const savings = filterByDate(allSavings);

    return { transactions, incomes, savings };
  }, [dateRange, allTransactions, allIncomes, allSavings]);

  const { transactions, incomes, savings } = filteredData;

  const allTransactionsReport: AnyTransaction[] = useMemo(() => {
    const expenseData = transactions.map(t => ({ ...t, type: 'Expense' as const, source_location: categories.find(c => c.id === t.categoryId)?.name || 'N/A' }));
    const incomeData = incomes.map(i => ({ ...i, type: 'Income' as const, source_location: incomeSources.find(s => s.id === i.sourceId)?.name || 'N/A' }));
    const savingData = savings.map(s => ({ ...s, type: 'Saving' as const, source_location: savingLocations.find(sl => sl.id === s.locationId)?.name || 'N/A' }));

    // The type assertion is needed because concat doesn't preserve the union type perfectly
    const combined = (expenseData as AnyTransaction[]).concat(incomeData).concat(savingData);

    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, incomes, savings, categories, incomeSources, savingLocations]);

  const categorySpendingReport = useMemo(() => {
    const spendingMap = new Map<string, number>();
    transactions.forEach(t => {
      const categoryName = categories.find(c => c.id === t.categoryId)?.name || 'Unknown';
      const current = spendingMap.get(categoryName) || 0;
      spendingMap.set(categoryName, current + t.amount);
    });
    return Array.from(spendingMap.entries()).map(([name, total]) => ({
      name,
      total,
    })).sort((a, b) => b.total - a.total);
  }, [transactions, categories]);

  const incomeBySourceReport = useMemo(() => {
    const incomeMap = new Map<string, number>();
    incomes.forEach(i => {
      const sourceName = incomeSources.find(s => s.id === i.sourceId)?.name || 'Unknown';
      const current = incomeMap.get(sourceName) || 0;
      incomeMap.set(sourceName, current + i.amount);
    });
    return Array.from(incomeMap.entries()).map(([name, total]) => ({
      name,
      total,
    })).sort((a, b) => b.total - a.total);
  }, [incomes, incomeSources]);

  const savingsByLocationReport = useMemo(() => {
    const savingsMap = new Map<string, number>();
    savings.forEach(s => {
      const locationName = savingLocations.find(l => l.id === s.locationId)?.name || 'Unknown';
      const current = savingsMap.get(locationName) || 0;
      savingsMap.set(locationName, current + s.amount);
    });
    return Array.from(savingsMap.entries()).map(([name, total]) => ({
      name,
      total,
    })).sort((a, b) => b.total - a.total);
  }, [savings, savingLocations]);

  const totalSpending = useMemo(() => categorySpendingReport.reduce((sum, item) => sum + item.total, 0), [categorySpendingReport]);
  const totalIncome = useMemo(() => incomeBySourceReport.reduce((sum, item) => sum + item.total, 0), [incomeBySourceReport]);
  const totalSavings = useMemo(() => savingsByLocationReport.reduce((sum, item) => sum + item.total, 0), [savingsByLocationReport]);

  return (
    <div className="pb-6">
      <PageHeader
        title="Reports"
        description="Generate and download reports of your financial data."
      >
        {isClient && <DateRangePicker onUpdate={setDateRange} defaultRange={dateRange} defaultPreset="this_month" />}
      </PageHeader>
      <div className="grid gap-6">
        <ReportCard
          title="All Transactions"
          description="A detailed log of all expenses, incomes, and savings for the period."
          data={allTransactionsReport}
          columns={[
            { key: "date", label: "Date" },
            { key: "type", label: "Type" },
            { key: "description", label: "Description" },
            { key: "amount", label: "Amount" },
            { key: "source_location", label: "Category/Source/Location" },
          ]}
        >
          {isMobile ? (
            <MobileReportList data={allTransactionsReport} />
          ) : (
            <ScrollArea className="h-72">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category/Source</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTransactionsReport.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.source_location}</TableCell>
                      <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </ReportCard>

        <div className="grid gap-6 md:grid-cols-3">
          <ReportCard
            title="Spending by Category"
            description="Summary of your spending across all categories."
            data={categorySpendingReport}
            total={totalSpending}
            columns={[
              { key: "name", label: "Category" },
              { key: "total", label: "Total Spent" },
            ]}
          >
            <ScrollArea className="h-72">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorySpendingReport.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">${totalSpending.toFixed(2)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </ScrollArea>
          </ReportCard>
          <ReportCard
            title="Income by Source"
            description="Breakdown of your income from different sources."
            data={incomeBySourceReport}
            total={totalIncome}
            columns={[
              { key: "name", label: "Source" },
              { key: "total", label: "Total Income" },
            ]}
          >
            <ScrollArea className="h-72">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Total Income</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeBySourceReport.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">${totalIncome.toFixed(2)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </ScrollArea>
          </ReportCard>
          <ReportCard
            title="Savings by Location"
            description="Summary of your savings."
            data={savingsByLocationReport}
            total={totalSavings}
            columns={[
              { key: "name", label: "Location" },
              { key: "total", label: "Total Saved" },
            ]}
          >
            <ScrollArea className="h-72">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Total Saved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savingsByLocationReport.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold">${totalSavings.toFixed(2)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </ScrollArea>
          </ReportCard>
        </div>
      </div>
    </div>
  );
}
