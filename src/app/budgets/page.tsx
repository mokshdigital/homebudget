
"use client";

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import BudgetCard from './_components/budget-card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wallet, PiggyBank, Loader2 } from 'lucide-react';
import BudgetForm from './_components/budget-form';
import type { Budget, Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import StatCard from '../dashboard/_components/stat-card';
import { MotionDiv } from '@/components/motion-div';
import { useData } from '@/lib/data-context';

export default function BudgetsPage() {
  const { budgets, addBudget, updateBudget, deleteBudget, categories, transactions, loading } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const { toast } = useToast();

  const handleAddClick = () => {
    setEditingBudget(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const handleDelete = async (budgetId: string) => {
    try {
        await deleteBudget(budgetId);
        toast({
          title: "Budget Deleted",
          description: "The budget has been successfully deleted.",
        });
    } catch (error) {
        console.error("Failed to delete budget:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete budget. Please try again.",
        });
    }
  };

  const handleFormSubmit = async (data: Budget) => {
    const isEditing = !!editingBudget;

    const budgetExists = budgets.some(b => b.categoryId === data.categoryId && b.id !== data.id);
    if (!isEditing && budgetExists) {
        toast({
            variant: "destructive",
            title: "Budget already exists",
            description: `A budget for this category has already been set.`,
        });
        return;
    }
    
    try {
        if (isEditing) {
            await updateBudget(data);
        } else {
            const { id, ...rest } = data;
            await addBudget(rest);
        }
        setIsFormOpen(false);
    } catch(error) {
        console.error("Failed to save budget:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save budget. Please try again.",
        });
    }
  };

  const { budgetData, totalBudget, remainingBudget } = useMemo(() => {
    const data = budgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      // For now, let's assume monthly budget calculations.
      // A more robust solution would filter transactions based on budget duration.
      const spent = transactions
        .filter(t => t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        ...budget,
        categoryName: category?.name || 'Unknown',
        categoryIcon: category?.icon,
        categoryColor: category?.color,
        spent,
        remaining: budget.amount - spent,
        progress: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
      };
    });
    
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpending = data.reduce((sum, d) => sum + d.spent, 0);
    const remainingBudget = totalBudget - totalSpending;
    
    return { budgetData: data, totalBudget, remainingBudget };
  }, [budgets, categories, transactions]);

  const stats = [
    {
      title: 'Total Budget',
      value: `$${totalBudget.toFixed(2)}`,
      icon: Wallet,
      description: 'Total budget for this month',
      className: 'bg-gradient-to-tr from-violet-700 to-violet-500',
    },
    {
      title: 'Remaining Budget',
      value: `$${remainingBudget.toFixed(2)}`,
      icon: PiggyBank,
      description: 'Amount left to spend this month',
      className:
        remainingBudget >= 0
          ? 'bg-gradient-to-tr from-purple-700 to-purple-500'
          : 'bg-gradient-to-tr from-red-700 to-red-500',
      variant: remainingBudget < 0 ? 'destructive' : 'default',
    },
  ];

  if (loading) {
    return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Budgets"
        description="Set and track your spending goals for each category."
      >
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>
      
      {budgetData.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgetData.map((budget, i) => (
            <BudgetCard key={budget.id} budget={budget} onEdit={handleEditClick} onDelete={handleDelete} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center p-10 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-semibold">No budgets set</h3>
            <p className="mt-2 text-sm text-muted-foreground">Click "Add Budget" to get started.</p>
        </div>
      )}

      <BudgetForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmitSuccess={handleFormSubmit}
        budget={editingBudget}
      />
    </div>
  );
}
