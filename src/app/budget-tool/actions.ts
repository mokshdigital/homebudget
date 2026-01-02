"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { suggestBudget, type SuggestBudgetInput, type SuggestBudgetOutput } from "@/ai/flows/suggest-budget";

type FormState = {
  suggestions: SuggestBudgetOutput | null;
  error: string | null;
};

export async function suggestBudgetAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const duration = formData.get("duration") as SuggestBudgetInput['duration'];

  if (!duration) {
    return { suggestions: null, error: "Please select a duration." };
  }

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { suggestions: null, error: 'User not authenticated. Please sign in.' };
  }

  const userId = user.id;

  try {
    // Fetch transactions and categories from Supabase
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    if (transactionsError) {
      throw new Error(`Failed to fetch transactions: ${transactionsError.message}`);
    }

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    if (!transactionsData || transactionsData.length === 0) {
      return { suggestions: null, error: "No spending data found to generate suggestions. Please add some transactions first." };
    }

    if (!categoriesData || categoriesData.length === 0) {
      return { suggestions: null, error: "No categories found. Please set up your spending categories first." };
    }

    // Create a map of category IDs to names
    const categoryMap = new Map(categoriesData.map(c => [c.id, c.name]));

    const spendingData = transactionsData.map((t) => {
      return {
        category: categoryMap.get(t.category_id) || 'Unknown',
        amount: Number(t.amount),
        date: t.date,
      };
    });

    const suggestions = await suggestBudget({ spendingData, duration });

    revalidatePath('/budget-tool');
    return { suggestions, error: null };
  } catch (error) {
    console.error("Error in suggestBudgetAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { suggestions: null, error: `Failed to generate budget suggestions: ${errorMessage}` };
  }
}
