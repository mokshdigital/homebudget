import {
  ShoppingBasket,
  Zap,
  Car,
  Utensils,
  Ticket,
  HeartPulse,
  Shirt,
  CreditCard,
  Send,
  Wallet,
  HelpCircle,
  Briefcase,
  Laptop,
  Star,
  CandlestickChart,
  Bitcoin,
  Banknote,
  FileText,
  type LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  ShoppingBasket,
  Zap,
  Car,
  Utensils,
  Ticket,
  HeartPulse,
  Shirt,
  CreditCard,
  Send,
  Wallet,
  Briefcase,
  Laptop,
  Star,
  CandlestickChart,
  Bitcoin,
  Banknote,
  FileText,
};

export const getIcon = (name?: string): LucideIcon => {
  if (name && icons[name]) {
    return icons[name];
  }
  return HelpCircle;
};
