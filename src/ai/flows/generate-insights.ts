'use server';
/**
 * @fileOverview A flow to generate spending insights from historical data.
 *
 * This flow is designed to be run on a schedule (e.g., daily) by a Cloud Scheduler job
 * or can be triggered manually via an API route.
 * It fetches all transaction data for a given user, analyzes it, and saves
 * the generated insights back to Supabase.
 */

import { ai } from '@/ai';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';

const GenerateInsightsInputSchema = z.object({
  userId: z.string().describe('The ID of the user for whom to generate insights.'),
});
type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;

const InsightSchema = z.object({
  title: z.string().describe('A short, catchy title for the insight.'),
  content: z.string().describe('The full, human-readable insight text, providing details and context.'),
  type: z.enum(['spending_habit', 'price_comparison', 'suggestion']).describe("The type or category of the insight."),
});

const GenerateInsightsOutputSchema = z.array(InsightSchema);
type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;

const generateInsightsPrompt = ai.definePrompt({
  name: 'generateInsightsPrompt',
  input: {
    schema: z.object({
      transactions: z.string().describe("A JSON string of the user's transactions over the last year."),
    })
  },
  output: { schema: GenerateInsightsOutputSchema },
  prompt: `You are a financial analyst AI. Your task is to analyze a user's spending data from the last year and generate 3-5 actionable and personalized insights.

Focus on identifying trends, anomalies, and opportunities for savings. Examples of good insights:
- "Your coffee spending is up 20% this month. You've spent $75 at Starbucks. Consider making coffee at home on weekdays to save."
- "You've consistently bought apples from both Safeway and Whole Foods. Over the last 3 months, you could have saved $12 by always buying them at Safeway where they are, on average, $0.50/lb cheaper."
- "Your spending on 'Subscriptions' is $45/month. Consider reviewing services like 'Extra News' ($15/mo) and 'Music Stream Pro' ($12/mo) to see if you still need them."

Analyze the following transaction data:
{{{transactions}}}

Generate a JSON array of insights.`,
});

export const generateInsightsFlow = ai.defineFlow(
  {
    name: 'generateInsightsFlow',
    inputSchema: GenerateInsightsInputSchema,
    outputSchema: z.object({ success: z.boolean(), insightsGenerated: z.number() }),
  },
  async ({ userId }) => {
    // Note: This uses the admin client which bypasses RLS
    // Make sure SUPABASE_SERVICE_ROLE_KEY is set in environment variables
    const supabase = createAdminClient();

    // 1. Fetch all data for the user
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    if (transactionsError || categoriesError) {
      console.error('Error fetching data:', transactionsError || categoriesError);
      return { success: false, insightsGenerated: 0 };
    }

    if (!transactionsData?.length || !categoriesData?.length) {
      console.log(`Not enough data for user ${userId} to generate insights.`);
      return { success: false, insightsGenerated: 0 };
    }

    const categoryMap = new Map(categoriesData.map(c => [c.id, c.name]));

    const transactionData = transactionsData.map(data => ({
      amount: Number(data.amount),
      date: data.date,
      description: data.description,
      category: categoryMap.get(data.category_id) || 'Unknown',
    }));

    // 2. Generate insights with AI
    const { output } = await generateInsightsPrompt({ transactions: JSON.stringify(transactionData) });

    if (!output || output.length === 0) {
      console.log(`AI did not generate any insights for user ${userId}.`);
      return { success: true, insightsGenerated: 0 };
    }

    // 3. Save insights to Supabase
    const insightsToInsert = output.map(insight => ({
      user_id: userId,
      title: insight.title,
      content: insight.content,
      type: insight.type,
      generated_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('insights')
      .insert(insightsToInsert);

    if (insertError) {
      console.error('Error inserting insights:', insertError);
      return { success: false, insightsGenerated: 0 };
    }

    return { success: true, insightsGenerated: output.length };
  }
);
