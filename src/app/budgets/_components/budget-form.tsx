
"use client";

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useData } from '@/lib/data-context';
import { useToast } from '@/hooks/use-toast';
import type { Budget } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const budgetFormSchema = z.object({
  categoryId: z.string().min(1, 'Category is required.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  duration: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'bi-annual', 'annual'], {
    required_error: "Please select a duration"
  }),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

type BudgetFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSuccess: (data: Budget) => void;
  budget?: Budget | null;
};

const durationOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'bi-annual', label: 'Bi-Annual' },
    { value: 'annual', label: 'Annual' },
];

export default function BudgetForm({ open, onOpenChange, onSubmitSuccess, budget }: BudgetFormProps) {
  const { toast } = useToast();
  const { categories } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: Partial<BudgetFormValues> = {
    categoryId: '',
    amount: 0,
    duration: 'monthly',
  };

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (budget) {
        form.reset({
          categoryId: budget.categoryId,
          amount: budget.amount,
          duration: budget.duration,
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [budget, open, form]);


  async function onSubmit(data: BudgetFormValues) {
    setIsSubmitting(true);
    try {
        const newBudget: Budget = {
          id: budget?.id || `bud-${Date.now()}`,
          ...data,
        };
    
        await onSubmitSuccess(newBudget);
        
        toast({
          title: budget ? 'Budget Updated' : 'Budget Added',
          description: `Successfully ${budget ? 'updated' : 'added'} budget.`,
        });
    } catch(e) {
        // Errors are handled by the parent
    } finally {
        setIsSubmitting(false);
    }
  }

  const title = budget ? 'Edit Budget' : 'Add Budget';
  const description = budget
    ? "Make changes to your budget. Click save when you're done."
    : "Set a new spending limit for a category. Click save when you're done.";
    
  const categoryOptions = React.useMemo(() => 
    categories.map(c => ({ value: c.id, label: c.name })), 
  [categories]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!!budget}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {categoryOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durationOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='pt-4'>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Budget
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
