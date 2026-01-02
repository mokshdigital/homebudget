
"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { IncomeDataTable } from './_components/data-table';
import { getColumns } from './_components/columns';
import IncomeForm from './_components/income-form';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import type { Income } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/lib/data-context';

export default function IncomePage() {
  const { incomes, addIncome, updateIncome, deleteIncome, loading } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const { toast } = useToast();


  const handleAddClick = () => {
    setEditingIncome(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (income: Income) => {
    setEditingIncome(income);
    setIsFormOpen(true);
  };

  const handleDelete = async (incomeId: string) => {
    try {
        await deleteIncome(incomeId);
        toast({
            title: "Income Deleted",
            description: "The income record has been successfully deleted.",
        });
    } catch (error) {
        console.error("Failed to delete income:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete income. Please try again.",
        });
    }
  };
  
  const handleFormSubmit = async (data: Income) => {
    try {
        if (editingIncome) {
            await updateIncome(data);
        } else {
            const { id, ...rest } = data;
            await addIncome(rest);
        }
    } catch (error) {
        console.error("Failed to save income:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save income. Please try again.",
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
      <PageHeader title="Income" description="Manage and track all your income.">
          <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Income
          </Button>
      </PageHeader>
      <IncomeDataTable columns={columns} data={incomes} />
      <IncomeForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmitSuccess={handleFormSubmit}
        income={editingIncome}
      />
    </div>
  );
}
