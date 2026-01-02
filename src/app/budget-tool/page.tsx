
"use client";
export const runtime = 'nodejs';

import React from "react";
import { useActionState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Lightbulb } from "lucide-react";
import { suggestBudgetAction } from "./actions";
import { SuggestionCard } from "./_components/suggestion-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialState = {
  suggestions: null,
  error: null,
};

const durationOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "bi-annual", label: "Bi-Annual" },
    { value: "annual", label: "Annual" },
];

export default function BudgetToolPage() {
  const [state, formAction, isPending] = useActionState(suggestBudgetAction, initialState);
  const [duration, setDuration] = React.useState("monthly");

  return (
    <div>
      <PageHeader
        title="Intelligent Budgeting Tool"
        description="Let AI analyze your spending and suggest a personalized budget."
      />
      <Card className="mb-6">
        <CardContent className="p-4">
          <form action={formAction} className="flex flex-col sm:flex-row items-center gap-4">
            <input type="hidden" name="duration" value={duration} />
            <Select onValueChange={setDuration} value={duration}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                    {durationOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Generate Budget"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {state.suggestions && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.suggestions.map((suggestion, index) => (
            <SuggestionCard key={index} suggestion={suggestion} />
          ))}
        </div>
      )}

      {state.error && (
        <div className="text-destructive text-center p-4">{state.error}</div>
      )}

      {!state.suggestions && !state.error && !isPending && (
        <div className="text-center p-10 border-2 border-dashed rounded-lg">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Ready to get started?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Select a duration and run the tool to get your AI-powered budget suggestions.</p>
        </div>
      )}
    </div>
  );
}
