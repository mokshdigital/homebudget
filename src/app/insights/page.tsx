
'use client';

import React from 'react';
import { PageHeader } from '@/components/page-header';
import { useData } from '@/lib/data-context';
import { Loader2, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

export default function InsightsPage() {
  const { insights, loading: loadingData } = useData();

  const sortedInsights = React.useMemo(() => {
    if (!insights) return [];
    // Sort by date, most recent first
    return [...insights].sort((a, b) => {
        const dateA = a.generatedAt ? new Date(a.generatedAt.seconds * 1000) : new Date(0);
        const dateB = b.generatedAt ? new Date(b.generatedAt.seconds * 1000) : new Date(0);
        return dateB.getTime() - dateA.getTime();
    });
  }, [insights]);
  
  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Spending Insights"
        description="AI-generated analysis of your spending habits, updated daily."
      />
      {sortedInsights.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedInsights.map(insight => (
            <Card key={insight.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <Sparkles className="h-5 w-5 text-primary" />
                </div>
                {insight.generatedAt && (
                    <CardDescription>
                        {formatDistanceToNow(new Date(insight.generatedAt.seconds * 1000), { addSuffix: true })}
                    </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{insight.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-10 border-2 border-dashed rounded-lg">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Insights Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your personalized spending insights are generated automatically. Check back tomorrow!
            <br />
            Make sure you have some transactions logged for the AI to analyze.
          </p>
        </div>
      )}
    </div>
  );
}
