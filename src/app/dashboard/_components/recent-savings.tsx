
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Saving } from '@/lib/types';
import { useData } from '@/lib/data-context';

type RecentSavingsProps = {
  savings: Saving[];
};

export default function RecentSavings({ savings }: RecentSavingsProps) {
  const { savingLocations } = useData();
  const recentSavings = savings.slice(0, 5);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Savings</CardTitle>
        <CardDescription>Your last 5 saving entries in this period.</CardDescription>
      </CardHeader>
      <CardContent>
        {recentSavings.length > 0 ? (
          <div className="divide-y divide-border/50">
            {recentSavings.map((saving) => {
              const location = savingLocations.find((l) => l.id === saving.locationId);
              return (
                <div key={saving.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {saving.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {location?.name}
                    </p>
                  </div>
                  <div className="font-medium text-violet-400">{`+$${saving.amount.toFixed(2)}`}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No savings in this period.</p>
        )}
      </CardContent>
    </Card>
  );
}
