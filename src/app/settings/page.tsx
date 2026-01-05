
"use client";

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ManageList } from './_components/manage-list';
import HomeMembersSettings from './_components/home-members';
import DeleteAccount from './_components/delete-account';
import { useData } from '@/lib/data-context';
import type { Transaction, Income, Saving } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'home';
  const [activeTab, setActiveTab] = React.useState(initialTab);

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

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    router.replace(`/settings?tab=${val}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { value: 'home', label: 'Home & Members' },
    { value: 'categories', label: 'Categories' },
    { value: 'payment-methods', label: 'Payment Methods' },
    { value: 'classifications', label: 'Classifications' },
    { value: 'vendors', label: 'Vendors' },
    { value: 'income-sources', label: 'Income Sources' },
    { value: 'saving-locations', label: 'Saving Locations' },
    { value: 'danger', label: 'Danger Zone', className: 'text-destructive' }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Settings"
        description="Customize your categories, payment methods, and more."
      />

      {/* Mobile Navigation: Select Dropdown */}
      <div className="md:hidden w-full">
        <label className="text-sm font-medium mb-2 block text-muted-foreground">Navigate to...</label>
        <Select value={activeTab} onValueChange={handleTabChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select setting..." />
          </SelectTrigger>
          <SelectContent>
            {tabs.map(t => (
              <SelectItem key={t.value} value={t.value} className={t.className}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Desktop Navigation: Tabs */}
        <TabsList className="hidden md:flex flex-wrap h-auto justify-start w-full mb-4">
          {tabs.map(t => (
            <TabsTrigger key={t.value} value={t.value} className={t.className}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="home">
          <HomeMembersSettings />
        </TabsContent>
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
        <TabsContent value="danger">
          <DeleteAccount />
        </TabsContent>
      </Tabs>
    </div>
  );
}
