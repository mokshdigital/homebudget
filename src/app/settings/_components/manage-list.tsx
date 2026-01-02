
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Edit, Save, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SettingItem } from '@/lib/types';

type Item = SettingItem;
type Transaction = { id: string;[key: string]: any };

type ManageListProps<T extends Transaction> = {
  items: Item[];
  setItems: (items: Item[]) => Promise<void>;
  transactions: T[];
  setTransactions: (items: T[]) => Promise<void>;
  title: string;
  itemName: string;
  itemKey: keyof Item;
  transactionItemKey: keyof T;
};

export function ManageList<T extends Transaction>({ items, setItems, transactions, setTransactions, title, itemName, itemKey, transactionItemKey }: ManageListProps<T>) {
  const [newItemName, setNewItemName] = useState('');
  const [newItemColor, setNewItemColor] = useState('#000000');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedItemName, setEditedItemName] = useState('');
  const [editedItemColor, setEditedItemColor] = useState('#000000');
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [transferToId, setTransferToId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isCategory = itemName === 'Category';
  const hasIcon = ['Category', 'Payment Method', 'Income Source'].includes(itemName);

  const handleAddItem = async () => {
    const trimmedName = newItemName.trim();
    if (trimmedName === '') {
      toast({
        title: 'Error',
        description: `${itemName} name cannot be empty.`,
        variant: 'destructive',
      });
      return;
    }

    const isDuplicate = items.some(item => (item as any)[itemKey].toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) {
      toast({
        title: 'Duplicate Name',
        description: `A ${itemName.toLowerCase()} with the name "${trimmedName}" already exists.`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newItem: Item = {
        id: crypto.randomUUID(),
        name: trimmedName,
        ...(hasIcon && { icon: 'HelpCircle' }), // Only add icon for tables that support it
        ...(isCategory && { color: newItemColor }),
      } as Item;

      await setItems([...items, newItem]);
      setNewItemName('');
      if (isCategory) {
        setNewItemColor('#000000');
      }
      toast({
        title: `${itemName} Added`,
        description: `Successfully added "${trimmedName}".`,
      });
    } catch (error) {
      console.error(`Failed to add ${itemName}:`, error);
      toast({ variant: 'destructive', title: 'Error', description: `Failed to add ${itemName}.` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const attemptDelete = (item: Item) => {
    const transactionsUsingItem = transactions.filter(
      t => t[transactionItemKey] === item.id
    );

    if (transactionsUsingItem.length > 0) {
      setItemToDelete(item);
      const firstAvailableTarget = items.find(i => i.id !== item.id);
      if (firstAvailableTarget) {
        setTransferToId(firstAvailableTarget.id);
      }
    } else {
      performDelete(item.id);
    }
  };

  const performDelete = async (id: string, newId?: string) => {
    const itemToDelete = items.find(item => item.id === id);
    if (!itemToDelete) return;

    setIsSubmitting(true);
    try {
      if (newId) {
        const updatedTransactions = transactions.map(t =>
          t[transactionItemKey] === id ? { ...t, [transactionItemKey]: newId } : t
        );
        await setTransactions(updatedTransactions);
      }

      const newItems = items.filter(item => item.id !== id);
      await setItems(newItems);

      toast({
        title: `${itemName} Deleted`,
        description: `Successfully deleted "${(itemToDelete as any)[itemKey]}". ${newId ? 'Transactions transferred.' : ''}`,
      });
      setItemToDelete(null);
      setTransferToId('');
    } catch (error) {
      console.error(`Failed to delete ${itemName}:`, error);
      toast({ variant: 'destructive', title: 'Error', description: `Failed to delete ${itemName}.` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete && transferToId) {
      performDelete(itemToDelete.id, transferToId);
    } else if (itemToDelete && otherItems.length === 0) {
      performDelete(itemToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setItemToDelete(null);
    setTransferToId('');
  };

  const handleEditClick = (item: Item) => {
    setEditingItemId(item.id);
    setEditedItemName((item as any)[itemKey]);
    if (isCategory && (item as any).color) {
      setEditedItemColor((item as any).color);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditedItemName('');
    if (isCategory) {
      setEditedItemColor('#000000');
    }
  };

  const handleSaveEdit = async (id: string) => {
    const trimmedName = editedItemName.trim();
    if (trimmedName === '') {
      toast({
        title: 'Error',
        description: `${itemName} name cannot be empty.`,
        variant: 'destructive',
      });
      return;
    }

    const isDuplicate = items.some(item => item.id !== id && (item as any)[itemKey].toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) {
      toast({
        title: 'Duplicate Name',
        description: `A ${itemName.toLowerCase()} with the name "${trimmedName}" already exists.`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedItems = items.map(item =>
        item.id === id ? { ...item, name: trimmedName, ...(isCategory && { color: editedItemColor }) } : item
      );

      await setItems(updatedItems as any);
      toast({
        title: `${itemName} Updated`,
        description: `Successfully updated to "${trimmedName}".`,
      });
      handleCancelEdit();
    } catch (error) {
      console.error(`Failed to update ${itemName}:`, error);
      toast({ variant: 'destructive', title: 'Error', description: `Failed to update ${itemName}.` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const otherItems = items.filter(i => i.id !== itemToDelete?.id);
  const otherItemsOptions = React.useMemo(() => otherItems.map(item => ({ value: item.id, label: (item as any)[itemKey] })), [otherItems, itemKey]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Add, edit, or delete your custom {title.toLowerCase()}.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 items-center">
            <Input
              placeholder={`New ${itemName} name`}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            />
            {isCategory && (
              <Input
                type="color"
                value={newItemColor}
                onChange={(e) => setNewItemColor(e.target.value)}
                className="p-1 h-10 w-14"
              />
            )}
            <Button onClick={handleAddItem} className="shrink-0" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><PlusCircle className="h-4 w-4 mr-2" /> Add</>}
            </Button>
          </div>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 min-h-12">
                {editingItemId === item.id ? (
                  <>
                    <div className='flex gap-2 w-full'>
                      <Input
                        value={editedItemName}
                        onChange={(e) => setEditedItemName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                        className="h-8"
                      />
                      {isCategory && (
                        <Input
                          type="color"
                          value={editedItemColor}
                          onChange={(e) => setEditedItemColor(e.target.value)}
                          className="p-1 h-8 w-14 shrink-0"
                        />
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleSaveEdit(item.id)} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-primary" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {isCategory && (item as any).color && <div className="h-4 w-4 rounded-full" style={{ backgroundColor: (item as any).color }} />}
                      <span>{(item as any)[itemKey]}</span>
                    </div>
                    <div className='flex items-center'>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => attemptDelete(item)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reassign Items</AlertDialogTitle>
            <AlertDialogDescription>
              There are records associated with "{(itemToDelete as any)?.[itemKey]}". Please select a new {itemName.toLowerCase()} to transfer them to before deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {otherItems.length > 0 ? (
            <Select onValueChange={setTransferToId} value={transferToId}>
              <SelectTrigger>
                <SelectValue placeholder={`Select a new ${itemName.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {otherItemsOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className='text-sm text-destructive'>There are no other {title.toLowerCase()} to transfer items to. Deleting this may unlink the associated records.</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={(otherItems.length > 0 && !transferToId) || isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete and Transfer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
