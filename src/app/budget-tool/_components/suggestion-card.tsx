
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/lib/data-context";
import { getIcon } from "@/lib/icons";
import type { SuggestBudgetOutput } from "@/ai/flows/suggest-budget";

type SuggestionCardProps = {
  suggestion: SuggestBudgetOutput[0];
};

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const { categories } = useData();
  const category = categories.find(c => c.name === suggestion.category);
  const Icon = getIcon(category?.icon);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{suggestion.category}</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Suggested Budget</p>
          </div>
          <div className="text-2xl font-bold text-primary">
            ${suggestion.suggestedBudget.toFixed(2)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm font-semibold mb-2">Tips to save:</p>
        <p className="text-sm text-muted-foreground">{suggestion.tips}</p>
      </CardContent>
    </Card>
  );
}
