"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Wallet,
  Settings,
  Lightbulb,
  ArrowLeftRight,
  Landmark,
  PiggyBank,
  FileText,
  LogOut,
  Loader2,
  PlusCircle,
  Home,
} from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { AnimatePresence, motion } from "framer-motion";
import { useData } from "@/lib/data-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/expenses", icon: ArrowLeftRight, label: "Expenses" },
  { href: "/income", icon: Landmark, label: "Income" },
  { href: "/savings", icon: PiggyBank, label: "Savings" },
  { href: "/budgets", icon: Wallet, label: "Budgets" },
  { href: "/reports", icon: FileText, label: "Reports" },
];

const mobileMenuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/expenses", icon: ArrowLeftRight, label: "Expenses" },
  { href: "add-action", icon: PlusCircle, label: "Add" },
  { href: "/budgets", icon: Wallet, label: "Budgets" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

function HomeDisplay() {
  const { currentHome } = useData();

  if (!currentHome) return null;

  return (
    <div className="px-2 py-2 mb-2 bg-muted/30 rounded-md border border-border/40 mx-2">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Home className="h-4 w-4 text-primary" />
        <span className="truncate">{currentHome.name}</span>
      </div>
    </div>
  );
}

function UserProfile() {
  const { user, signOut } = useData();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  if (!user) return null;

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    const parts = email.split('@');
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    <div className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm">
      <Avatar className="h-8 w-8">
        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 truncate group-data-[collapsible=icon]:hidden">
        <p className="truncate font-medium">{user.user_metadata?.full_name || user.email}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 group-data-[collapsible=icon]:hidden" onClick={handleSignOut}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  )
}

function BottomNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const handleNav = (href: string) => {
    if (href === 'add-action') {
      setIsAddSheetOpen(true);
    } else {
      router.push(href);
    }
  };

  return (
    <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
        <div className="grid h-16 grid-cols-5 items-center justify-center">
          {mobileMenuItems.map((item) => {
            const isActive = item.href !== 'add-action' && pathname.startsWith(item.href);
            const isAddAction = item.href === 'add-action';

            const buttonContent = isAddAction ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg -translate-y-4">
                <item.icon className="h-6 w-6" />
              </div>
            ) : (
              <>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </>
            );

            const buttonClassName = cn(
              "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            );

            if (isAddAction) {
              return (
                <SheetTrigger asChild key={item.label}>
                  <button className={buttonClassName}>
                    {buttonContent}
                  </button>
                </SheetTrigger>
              );
            }

            return (
              <button key={item.label} onClick={() => handleNav(item.href)} className={buttonClassName}>
                {buttonContent}
              </button>
            );
          })}
        </div>
      </div>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader>
          <SheetTitle>Add New</SheetTitle>
          <SheetDescription>What would you like to record?</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Button variant="outline" size="lg" onClick={() => { setIsAddSheetOpen(false); router.push('/expenses'); }}>
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            New Expense
          </Button>
          <Button variant="outline" size="lg" onClick={() => { setIsAddSheetOpen(false); router.push('/income'); }}>
            <Landmark className="mr-2 h-4 w-4" />
            New Income
          </Button>
          <Button variant="outline" size="lg" onClick={() => { setIsAddSheetOpen(false); router.push('/savings'); }}>
            <PiggyBank className="mr-2 h-4 w-4" />
            New Saving
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const publicPages = [
  '/',
  '/login',
  '/unauthorized',
  '/about',
  '/privacy-policy',
  '/terms-and-conditions',
  '/disclaimer',
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useData();
  const isMobile = useIsMobile();

  const isPublicPage = publicPages.includes(pathname);

  useEffect(() => {
    // If we're not loading, and there's no user, AND we are on a private page
    if (!isUserLoading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [isUserLoading, user, isPublicPage, router]);

  useEffect(() => {
    // If the user is logged in and tries to access the login page, redirect to dashboard
    if (!isUserLoading && user && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [isUserLoading, user, pathname, router]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="md:hidden">
        <BottomNavBar />
      </div>
      <Sidebar className="hidden md:block">
        <SidebarHeader>
          <AppLogo />
          <HomeDisplay />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    className="rounded-none"
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <Link href="/settings" passHref>
                <SidebarMenuButton
                  className="rounded-none"
                  isActive={pathname.startsWith('/settings')}
                  tooltip={{ children: "Settings" }}
                >
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <UserProfile />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 sm:p-6 pb-24 md:pb-6">
          <div className="md:hidden flex items-center mb-4">
            <SidebarTrigger />
            <div className="flex-grow"></div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
