
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Income } from '@/lib/types';
import { useData } from '@/lib/data-context';

type RecentIncomesProps = {
  incomes: Income[];
};

export default function RecentIncomes({ incomes }: RecentIncomesProps) {
  const { incomeSources } = useData();
  const recentIncomes = incomes.slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Income</CardTitle>
        <CardDescription>Your last 5 income entries in this period.</CardDescription>
      </CardHeader>
      <CardContent>
        {recentIncomes.length > 0 ? (
          <div className="divide-y divide-border/50">
            {recentIncomes.map((income) => {
              const source = incomeSources.find((s) => s.id === income.sourceId);
              return (
                <div key={income.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {income.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {source?.name}
                    </p>
                  </div>
                  <div className="font-medium text-emerald-400">{`+$${income.amount.toFixed(2)}`}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No income in this period.</p>
        )}
      </CardContent>
    </Card>
  );
}
