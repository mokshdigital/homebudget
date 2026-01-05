"use client";

import React from "react";
import { format } from "date-fns";
import {
    Building,
    ShoppingBag,
    Coffee,
    Car,
    Zap,
    Film,
    HelpCircle,
    CreditCard,
    Banknote,
    Landmark,
    MoreVertical,
    Edit,
    Trash2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Transaction } from "@/lib/types";
import { useData } from "@/lib/data-context";
import { cn } from "@/lib/utils";

type MobileListProps = {
    data: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void; // Added delete handler for generic use
};

const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
        case 'Home': return Building;
        case 'ShoppingBag': return ShoppingBag;
        case 'Coffee': return Coffee;
        case 'Car': return Car;
        case 'Zap': return Zap;
        case 'Film': return Film;
        default: return HelpCircle;
    }
};

export function MobileTransactionList({ data, onEdit, onDelete }: MobileListProps) {
    const { categories, paymentMethods } = useData();

    if (data.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <p>No expenses found.</p>
                <p className="text-sm mt-1">Tap + to add one.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-20"> {/* pb-20 for bottom nav clearance */}
            {data.map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                const paymentMethod = paymentMethods.find(p => p.id === transaction.paymentMethodId);

                const IconComponent = category ? getCategoryIcon(category.icon) : HelpCircle;
                const color = category?.color || "#94a3b8";

                return (
                    <Card key={transaction.id} className="overflow-hidden border-l-4 shadow-sm" style={{ borderLeftColor: color }}>
                        <CardContent className="p-0">
                            <div
                                className="flex items-center p-4 gap-3 active:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => onEdit(transaction)}
                            >
                                {/* Category Icon */}
                                <div
                                    className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
                                    style={{ backgroundColor: color }}
                                >
                                    <IconComponent className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold truncate pr-2 text-base">{transaction.description}</h3>
                                        <span className="font-bold text-red-500 whitespace-nowrap">
                                            -${transaction.amount.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2 truncate">
                                            <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                                            <span>•</span>
                                            <span className="truncate max-w-[100px]">{category?.name || 'Uncategorized'}</span>
                                        </div>

                                        {paymentMethod && (
                                            <div className="flex items-center gap-1 shrink-0 bg-secondary/50 px-1.5 py-0.5 rounded">
                                                <span className="text-[10px]">{paymentMethod.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions (Kebab Menu) mostly for delete, as tap is edit */}
                                <div onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(transaction)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => onDelete(transaction.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
