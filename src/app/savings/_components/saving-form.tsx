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
import type { Saving, SavingLocation } from '@/lib/types';

const savingFormSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  date: z.string().min(1, 'A date is required.'),
  locationId: z.string().min(1, 'Location is required.'),
  remarks: z.string().optional(),
});

type SavingFormValues = z.infer<typeof savingFormSchema>;

type SavingFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSuccess: (data: Saving) => void;
  saving?: Saving | null;
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
            Create a new {title.toLowerCase()} to use for your savings.
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

export default function SavingForm({ open, onOpenChange, onSubmitSuccess, saving }: SavingFormProps) {
  const { toast } = useToast();
  const { savingLocations, setSavingLocations } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);

  const defaultValues: Partial<SavingFormValues> = {
    description: '',
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    locationId: '',
    remarks: '',
  };

  const form = useForm<SavingFormValues>({
    resolver: zodResolver(savingFormSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (open) {
      const resetDate = saving?.date ? new Date(saving.date) : new Date();
      const formattedDate = format(new Date(resetDate.getTime() + resetDate.getTimezoneOffset() * 60000), 'yyyy-MM-dd');

      if (saving) {
        form.reset({
          ...saving,
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
  }, [saving, open, form]);

  const handleAddLocation = async (name: string) => {
    const newLocation: SavingLocation = {
      id: crypto.randomUUID(),
      name,
    };
    await setSavingLocations([...savingLocations, newLocation]);
    form.setValue('locationId', newLocation.id);
    toast({ title: 'Saving Location Added', description: `"${name}" has been created.` });
  };

  async function onSubmit(data: SavingFormValues) {
    setIsSubmitting(true);
    try {
      const newSaving: Saving = {
        id: saving?.id || `sav-${Date.now()}`,
        ...data,
        date: data.date,
      };

      await onSubmitSuccess(newSaving);

      toast({
        title: saving ? 'Saving Updated' : 'Saving Added',
        description: `Successfully ${saving ? 'updated' : 'added'} "${data.description}".`,
      });
      onOpenChange(false);
    } catch (e) {
      // Error is handled in parent component
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = saving ? 'Edit Saving' : 'Add Saving';
  const description = saving
    ? "Make changes to your saving record. Click save when you're done."
    : "Record a new saving. Click save when you're done.";

  const savingLocationOptions = React.useMemo(() => savingLocations.map(l => ({ value: l.id, label: l.name })), [savingLocations]);

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
                      <Input placeholder="e.g., Monthly Investment" {...field} />
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

              {/* Location with Add New */}
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Location</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setShowAddLocation(true)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add New
                      </Button>
                    </div>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {savingLocationOptions.map(option => (
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
                  Save Saving
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Quick Add Dialog for Saving Location */}
      <QuickAddDialog
        open={showAddLocation}
        onOpenChange={setShowAddLocation}
        title="Location"
        onAdd={handleAddLocation}
      />
    </>
  );
}
