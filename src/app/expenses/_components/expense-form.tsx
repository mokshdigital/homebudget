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
import type { Transaction, Category, PaymentMethod, Classification, Vendor } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const expenseFormSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  date: z.string().min(1, 'A date is required.'),
  categoryId: z.string().min(1, 'Category is required.'),
  paymentMethodId: z.string().min(1, 'Payment method is required.'),
  classificationId: z.string().min(1, 'Classification is required.'),
  vendorId: z.string().optional(),
  receipt: z.string().optional(),
  remarks: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

type ExpenseFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSuccess: (data: Transaction) => void;
  transaction?: Transaction | null;
};

// Quick Add Dialog Component
function QuickAddDialog({
  open,
  onOpenChange,
  title,
  onAdd,
  hasColor = false
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onAdd: (name: string, color?: string) => Promise<void>;
  hasColor?: boolean;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(name.trim(), hasColor ? color : undefined);
      setName('');
      setColor('#6366f1');
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
            Create a new {title.toLowerCase()} to use in your expenses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder={`${title} name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {hasColor && (
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-14 p-1 h-10"
              />
            )}
          </div>
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

export default function ExpenseForm({ open, onOpenChange, onSubmitSuccess, transaction }: ExpenseFormProps) {
  const { toast } = useToast();
  const {
    categories, setCategories,
    paymentMethods, setPaymentMethods,
    classifications, setClassifications,
    vendors, setVendors
  } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick add dialog states
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [showAddClassification, setShowAddClassification] = useState(false);

  const defaultValues: Partial<ExpenseFormValues> = {
    description: '',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    categoryId: '',
    paymentMethodId: '',
    classificationId: '',
    vendorId: '',
    receipt: '',
    remarks: '',
  };

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (open) {
      const resetDate = transaction?.date ? new Date(transaction.date) : new Date();
      const formattedDate = format(new Date(resetDate.getTime() + resetDate.getTimezoneOffset() * 60000), 'yyyy-MM-dd');

      if (transaction) {
        form.reset({
          ...transaction,
          date: formattedDate,
          vendorId: transaction.vendorId || '',
        });
      } else {
        form.reset({
          ...defaultValues,
          date: format(new Date(), 'yyyy-MM-dd'),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction, open, form]);

  // Quick add handlers
  const handleAddCategory = async (name: string, color?: string) => {
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name,
      icon: 'HelpCircle',
      color: color || '#6366f1',
    };
    await setCategories([...categories, newCategory]);
    form.setValue('categoryId', newCategory.id);
    toast({ title: 'Category Added', description: `"${name}" has been created.` });
  };

  const handleAddVendor = async (name: string) => {
    const newVendor: Vendor = {
      id: crypto.randomUUID(),
      name,
    };
    await setVendors([...vendors, newVendor]);
    form.setValue('vendorId', newVendor.id);
    toast({ title: 'Vendor Added', description: `"${name}" has been created.` });
  };

  const handleAddPaymentMethod = async (name: string) => {
    const newPM: PaymentMethod = {
      id: crypto.randomUUID(),
      name,
      icon: 'CreditCard',
    };
    await setPaymentMethods([...paymentMethods, newPM]);
    form.setValue('paymentMethodId', newPM.id);
    toast({ title: 'Payment Method Added', description: `"${name}" has been created.` });
  };

  const handleAddClassification = async (name: string) => {
    const newClassification: Classification = {
      id: crypto.randomUUID(),
      name,
    };
    await setClassifications([...classifications, newClassification]);
    form.setValue('classificationId', newClassification.id);
    toast({ title: 'Classification Added', description: `"${name}" has been created.` });
  };

  async function onSubmit(data: ExpenseFormValues) {
    setIsSubmitting(true);
    try {
      const newTransaction: Transaction = {
        id: transaction?.id || `txn-${Date.now()}`,
        ...data,
        date: data.date,
      };

      await onSubmitSuccess(newTransaction);

      toast({
        title: transaction ? 'Expense Updated' : 'Expense Added',
        description: `Successfully ${transaction ? 'updated' : 'added'} "${data.description}".`,
      });
      onOpenChange(false);
    } catch (e) {
      // Error toast is handled in parent component
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = transaction ? 'Edit Expense' : 'Add Expense';
  const description = transaction
    ? "Make changes to your expense. Click save when you're done."
    : "Record a new expense. Click save when you're done.";

  const categoryOptions = React.useMemo(() => categories.map(c => ({ value: c.id, label: c.name })), [categories]);
  const vendorOptions = React.useMemo(() => vendors.map(v => ({ value: v.id, label: v.name })), [vendors]);
  const paymentMethodOptions = React.useMemo(() => paymentMethods.map(pm => ({ value: pm.id, label: pm.name })), [paymentMethods]);
  const classificationOptions = React.useMemo(() => classifications.map(c => ({ value: c.id, label: c.name })), [classifications]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] sm:max-h-[80vh]">
            <div className="pr-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Weekly groceries" {...field} />
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

                  {/* Category with Add New */}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Category</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setShowAddCategory(true)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add New
                          </Button>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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

                  {/* Vendor with Add New */}
                  <FormField
                    control={form.control}
                    name="vendorId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Store/Vendor</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setShowAddVendor(true)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add New
                          </Button>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a store or vendor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vendorOptions.map(option => (
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

                  {/* Payment Method with Add New */}
                  <FormField
                    control={form.control}
                    name="paymentMethodId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Payment Method</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setShowAddPaymentMethod(true)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add New
                          </Button>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentMethodOptions.map(option => (
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

                  {/* Classification with Add New */}
                  <FormField
                    control={form.control}
                    name="classificationId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Classification</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setShowAddClassification(true)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add New
                          </Button>
                        </div>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a classification" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classificationOptions.map(option => (
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
                      Save Expense
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Quick Add Dialogs */}
      <QuickAddDialog
        open={showAddCategory}
        onOpenChange={setShowAddCategory}
        title="Category"
        onAdd={handleAddCategory}
        hasColor={true}
      />
      <QuickAddDialog
        open={showAddVendor}
        onOpenChange={setShowAddVendor}
        title="Vendor"
        onAdd={handleAddVendor}
      />
      <QuickAddDialog
        open={showAddPaymentMethod}
        onOpenChange={setShowAddPaymentMethod}
        title="Payment Method"
        onAdd={handleAddPaymentMethod}
      />
      <QuickAddDialog
        open={showAddClassification}
        onOpenChange={setShowAddClassification}
        title="Classification"
        onAdd={handleAddClassification}
      />
    </>
  );
}
