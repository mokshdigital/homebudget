// src/ai/flows/suggest-budget.ts
'use server';
/**
 * @fileOverview A flow to suggest budget allocations based on past spending patterns.
 *
 * This file defines the Genkit flow for budget suggestion.
 * It should only be imported and used in server-side code (e.g., Server Actions).
 */

import { ai } from '@/ai';
import { z } from 'zod';

const SuggestBudgetInputSchema = z.object({
  spendingData: z
    .array(
      z.object({
        category: z
          .string()
          .describe('The category of the expense (e.g., groceries, utilities).'),
        amount: z.number().describe('The amount spent in the category.'),
        date: z.string().describe('The date of the expense.'),
      })
    )
    .describe(
      'An array of past spending data, including category, amount, and date.'
    ),
  duration: z
    .enum(['daily', 'weekly', 'monthly', 'quarterly', 'bi-annual', 'annual'])
    .describe('The duration for which to suggest the budget.'),
});
export type SuggestBudgetInput = z.infer<typeof SuggestBudgetInputSchema>;

const SuggestBudgetOutputSchema = z
  .array(
    z.object({
      category: z.string().describe('The category of the expense.'),
      suggestedBudget: z
        .number()
        .describe(
          'The suggested budget for the category for the specified duration.'
        ),
      tips: z
        .string()
        .describe('Tips on how to meet the target budget for the category.'),
    })
  )
  .describe('An array of suggested budgets for each category, along with tips.');
export type SuggestBudgetOutput = z.infer<typeof SuggestBudgetOutputSchema>;

const prompt = ai.definePrompt({
  name: 'suggestBudgetPrompt',
  input: { schema: SuggestBudgetInputSchema },
  output: { schema: SuggestBudgetOutputSchema },
  prompt: `You are a personal finance advisor. Analyze the user's past spending data and suggest a budget for each category for the specified duration.

Spending Data:
{{#each spendingData}}
- Category: {{this.category}}, Amount: {{this.amount}}, Date: {{this.date}}
{{/each}}

Duration: {{duration}}

Consider the spending patterns and suggest a budget that is realistic and achievable. Also provide tips on how to meet the target budget for each category.

Output the suggested budget as a JSON array of objects with the following structure:
[{
  "category": "category name",
  "suggestedBudget": suggested budget amount,
 "tips": "tips on meeting budget"
}]
`,
});

const suggestBudgetFlow = ai.defineFlow(
  {
    name: 'suggestBudgetFlow',
    inputSchema: SuggestBudgetInputSchema,
    outputSchema: SuggestBudgetOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function suggestBudget(input: SuggestBudgetInput): Promise<SuggestBudgetOutput> {
  return suggestBudgetFlow(input);
}
