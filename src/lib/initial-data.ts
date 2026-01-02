
import type { Category, PaymentMethod, Classification, Vendor, IncomeSource, SavingLocation } from './types';

export const categories: Category[] = [
  { id: 'cat-1', name: 'Groceries', icon: 'ShoppingBasket', color: '#4f46e5' },
  { id: 'cat-2', name: 'Utilities', icon: 'Zap', color: '#2563eb' },
  { id: 'cat-3', name: 'Transportation', icon: 'Car', color: '#0ea5e9' },
  { id: 'cat-4', name: 'Dining Out', icon: 'Utensils', color: '#f97316' },
  { id: 'cat-5', name: 'Entertainment', icon: 'Ticket', color: '#10b981' },
  { id: 'cat-6', name: 'Health', icon: 'HeartPulse', color: '#ef4444' },
  { id: 'cat-7', name: 'Shopping', icon: 'Shirt', color: '#d946ef' },
];

export const paymentMethods: PaymentMethod[] = [
  { id: 'pm-1', name: 'Credit Card', icon: 'CreditCard' },
  { id: 'pm-2', name: 'E-Transfer', icon: 'Send' },
  { id: 'pm-3', name: 'Cash', icon: 'Wallet' },
  { id: 'pm-4', name: 'Debit Card', icon: 'CreditCard' },
];

export const classifications: Classification[] = [
  { id: 'cls-1', name: 'Household' },
  { id: 'cls-2', name: 'Personal' },
  { id: 'cls-3', name: 'Spouse' },
  { id: 'cls-4', name: 'Social' },
];

export const vendors: Vendor[] = [
  { id: 'ven-1', name: 'Walmart' },
  { id: 'ven-2', name: 'Costco' },
  { id: 'ven-3', name: 'Amazon' },
  { id: 'ven-4', name: 'Shell' },
  { id: 'ven-5', name: 'The Keg' },
];

export const incomeSources: IncomeSource[] = [
  { id: 'is-1', name: 'Salary', icon: 'Briefcase' },
  { id: 'is-2', name: 'Freelance', icon: 'Laptop' },
  { id: 'is-3', name: 'Bonus', icon: 'Star' },
];

export const savingLocations: SavingLocation[] = [
    { id: 'sl-1', name: 'High-Yield Savings' },
    { id: 'sl-2', name: 'India Mutual Funds' },
    { id: 'sl-3', name: 'US Crypto' },
];
