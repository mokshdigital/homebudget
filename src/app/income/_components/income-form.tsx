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
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Income, IncomeSource } from '@/lib/types';

const incomeFormSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  date: z.string().min(1, 'A date is required.'),
  sourceId: z.string().min(1, 'Source is required.'),
  remarks: z.string().optional(),
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

type IncomeFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSuccess: (data: Income) => void;
  income?: Income | null;
};

// Quick Add Dialog Component
function QuickAddDialog({
  open,
  onOpenChange,
  title,
  onAdd
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onAdd: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(name.trim());
      setName('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add New {title}</DialogTitle>
          <DialogDescription>
            Create a new {title.toLowerCase()} to use for your income.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder={`${title} name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add {title}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function IncomeForm({ open, onOpenChange, onSubmitSuccess, income }: IncomeFormProps) {
  const { toast } = useToast();
  const { incomeSources, setIncomeSources } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);

  const defaultValues: Partial<IncomeFormValues> = {
    description: '',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    sourceId: '',
    remarks: '',
  };

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (open) {
      const resetDate = income?.date ? new Date(income.date) : new Date();
      const formattedDate = format(new Date(resetDate.getTime() + resetDate.getTimezoneOffset() * 60000), 'yyyy-MM-dd');

      if (income) {
        form.reset({
          ...income,
          date: formattedDate,
        });
      } else {
        form.reset({
          ...defaultValues,
          date: format(new Date(), 'yyyy-MM-dd'),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [income, open, form]);

  const handleAddSource = async (name: string) => {
    const newSource: IncomeSource = {
      id: crypto.randomUUID(),
      name,
      icon: 'Banknote',
    };
    await setIncomeSources([...incomeSources, newSource]);
    form.setValue('sourceId', newSource.id);
    toast({ title: 'Income Source Added', description: `"${name}" has been created.` });
  };

  async function onSubmit(data: IncomeFormValues) {
    setIsSubmitting(true);
    try {
      const newIncome: Income = {
        id: income?.id || `inc-${Date.now()}`,
        ...data,
        date: data.date,
      };

      await onSubmitSuccess(newIncome);

      toast({
        title: income ? 'Income Updated' : 'Income Added',
        description: `Successfully ${income ? 'updated' : 'added'} "${data.description}".`,
      });
      onOpenChange(false);
    } catch (e) {
      // Error toast is handled in parent component
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = income ? 'Edit Income' : 'Add Income';
  const description = income
    ? "Make changes to your income record. Click save when you're done."
    : "Record a new income. Click save when you're done.";

  const incomeSourceOptions = React.useMemo(() => incomeSources.map(s => ({ value: s.id, label: s.name })), [incomeSources]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monthly Salary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Source with Add New */}
              <FormField
                control={form.control}
                name="sourceId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Source</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setShowAddSource(true)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add New
                      </Button>
                    </div>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {incomeSourceOptions.map(option => (
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
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any notes here..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className='pt-4'>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Income
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Quick Add Dialog for Income Source */}
      <QuickAddDialog
        open={showAddSource}
        onOpenChange={setShowAddSource}
        title="Income Source"
        onAdd={handleAddSource}
      />
    </>
  );
}
