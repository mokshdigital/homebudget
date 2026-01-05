
"use client";

import React, { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { SavingsDataTable } from './_components/data-table';
import { getColumns } from './_components/columns';
import SavingForm from './_components/saving-form';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import type { Saving } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/lib/data-context';

import { useIsMobile } from '@/hooks/use-mobile';
import { MobileSavingList } from './_components/mobile-list';

export default function SavingsPage() {
  const { savings, addSaving, updateSaving, deleteSaving, loading } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();


  const handleAddClick = () => {
    setEditingSaving(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (saving: Saving) => {
    setEditingSaving(saving);
    setIsFormOpen(true);
  };

  const handleDelete = async (savingId: string) => {
    try {
      await deleteSaving(savingId);
      toast({
        title: "Saving Deleted",
        description: "The saving record has been successfully deleted.",
      });
    } catch (error) {
      console.error("Failed to delete saving:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete saving. Please try again.",
      });
    }
  };

  const handleFormSubmit = async (data: Saving) => {
    try {
      if (editingSaving) {
        await updateSaving(data);
      } else {
        const { id, ...rest } = data;
        await addSaving(rest);
      }
    } catch (error) {
      console.error("Failed to save saving:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save saving. Please try again.",
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
    <div className="pb-6">
      <PageHeader title="Savings" description="Manage and track all your savings.">
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Saving
        </Button>
      </PageHeader>

      {isMobile ? (
        <MobileSavingList
          data={savings}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      ) : (
        <SavingsDataTable columns={columns} data={savings} />
      )}

      <SavingForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmitSuccess={handleFormSubmit}
        saving={editingSaving}
      />
    </div>
  );
}
