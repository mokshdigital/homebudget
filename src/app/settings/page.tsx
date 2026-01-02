
"use client";

import React from 'react';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ManageList } from './_components/manage-list';
import { useData } from '@/lib/data-context';
import type { Transaction, Income, Saving } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const {
    categories, setCategories,
    paymentMethods, setPaymentMethods,
    classifications, setClassifications,
    vendors, setVendors,
    transactions, setTransactions: setExpenseTransactions,
    incomeSources, setIncomeSources,
    incomes, setIncomes: setIncomeTransactions,
    savingLocations, setSavingLocations,
    savings, setSavings: setSavingTransactions,
    loading
  } = useData();

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
        title="Settings"
        description="Customize your categories, payment methods, and more."
      />
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="flex-wrap h-auto justify-start">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="classifications">Classifications</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="income-sources">Income Sources</TabsTrigger>
          <TabsTrigger value="saving-locations">Saving Locations</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <ManageList<Transaction>
            items={categories} 
            setItems={(items) => setCategories(items as any)}
            transactions={transactions}
            setTransactions={(items) => setExpenseTransactions(items as any)}
            title="Categories" 
            itemName="Category"
            itemKey="name"
            transactionItemKey="categoryId"
          />
        </TabsContent>
        <TabsContent value="payment-methods">
          <ManageList<Transaction>
            items={paymentMethods} 
            setItems={(items) => setPaymentMethods(items as any)} 
            transactions={transactions}
            setTransactions={(items) => setExpenseTransactions(items as any)}
            title="Payment Methods" 
            itemName="Payment Method"
            itemKey="name"
            transactionItemKey="paymentMethodId"
          />
        </TabsContent>
        <TabsContent value="classifications">
          <ManageList<Transaction>
            items={classifications} 
            setItems={(items) => setClassifications(items as any)}
            transactions={transactions}
            setTransactions={(items) => setExpenseTransactions(items as any)}
            title="Classifications" 
            itemName="Classification"
            itemKey="name"
            transactionItemKey="classificationId"
          />
        </TabsContent>
        <TabsContent value="vendors">
          <ManageList<Transaction>
            items={vendors} 
            setItems={(items) => setVendors(items as any)}
            transactions={transactions}
            setTransactions={(items) => setExpenseTransactions(items as any)}
            title="Vendors" 
            itemName="Vendor"
            itemKey="name"
            transactionItemKey="vendorId"
          />
        </TabsContent>
        <TabsContent value="income-sources">
          <ManageList<Income>
            items={incomeSources} 
            setItems={(items) => setIncomeSources(items as any)}
            transactions={incomes}
            setTransactions={(items) => setIncomeTransactions(items as any)}
            title="Income Sources" 
            itemName="Income Source"
            itemKey="name"
            transactionItemKey="sourceId"
          />
        </TabsContent>
        <TabsContent value="saving-locations">
          <ManageList<Saving>
            items={savingLocations} 
            setItems={(items) => setSavingLocations(items as any)}
            transactions={savings}
            setTransactions={(items) => setSavingTransactions(items as any)}
            title="Saving Locations" 
            itemName="Saving Location"
            itemKey="name"
            transactionItemKey="locationId"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
