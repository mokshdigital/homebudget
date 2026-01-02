
"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { ExpensesDataTable } from './_components/data-table';
import { getColumns } from './_components/columns';
import ExpenseForm from './_components/expense-form';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/lib/data-context';

export default function ExpensesPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, loading } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();


  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (transactionId: string) => {
    try {
        await deleteTransaction(transactionId);
        toast({
            title: "Expense Deleted",
            description: "The expense has been successfully deleted.",
        });
    } catch (error) {
        console.error("Failed to delete expense:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete expense. Please try again.",
        });
    }
  };
  
  const handleFormSubmit = async (data: Transaction) => {
    try {
        if (editingTransaction) {
            await updateTransaction(data);
        } else {
            const { id, ...rest } = data;
            await addTransaction(rest);
        }
    } catch (error) {
        console.error("Failed to save expense:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save expense. Please try again.",
        });
    }
  };

  const columns = getColumns(handleEditClick, handleDelete);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div>
      <PageHeader title="Expenses" description="Manage and track all your expenses.">
          <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
      </PageHeader>
      <ExpensesDataTable columns={columns} data={transactions} />
      <ExpenseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmitSuccess={handleFormSubmit}
        transaction={editingTransaction}
      />
    </div>
  );
}
