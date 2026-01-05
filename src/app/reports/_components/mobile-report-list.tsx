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
    Briefcase,
    TrendingUp,
    Gift,
    DollarSign,
    Landmark,
    PiggyBank
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AnyTransaction } from "@/lib/types";

type MobileReportListProps = {
    data: AnyTransaction[];
};

const getIcon = (type: string, sourceLocation: string) => {
    // Simple heuristic mapping since we only have the name in the flattened report data
    // In a real app we might pass the full object ID to look up the icon properly
    if (type === 'Income') return DollarSign;
    if (type === 'Saving') return PiggyBank;

    // For expenses, we could try to map names if we wanted, but HelpCircle is safe
    return ShoppingBag;
};

export function MobileReportList({ data }: MobileReportListProps) {
    if (data.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <p>No records found for this period.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {data.map((item) => {
                let color = "#94a3b8"; // Default Gray
                let IconComponent = HelpCircle;
                let amountClass = "font-bold";
                let sign = "";

                if (item.type === 'Expense') {
                    color = "#ef4444"; // Red
                    IconComponent = ShoppingBag;
                    amountClass = "font-bold text-red-500";
                    sign = "-";
                } else if (item.type === 'Income') {
                    color = "#10b981"; // Green
                    IconComponent = TrendingUp;
                    amountClass = "font-bold text-emerald-600";
                    sign = "+";
                } else if (item.type === 'Saving') {
                    color = "#0ea5e9"; // Blue
                    IconComponent = PiggyBank;
                    amountClass = "font-bold text-sky-600";
                    sign = "";
                }

                return (
                    <Card key={`${item.type}-${item.id}`} className="overflow-hidden border-l-4 shadow-sm" style={{ borderLeftColor: color }}>
                        <CardContent className="p-0">
                            <div className="flex items-center p-4 gap-3">
                                {/* Icon */}
                                <div
                                    className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
                                    style={{ backgroundColor: color }}
                                >
                                    <IconComponent className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold truncate pr-2 text-base">{item.description}</h3>
                                        <span className={cn(amountClass, "whitespace-nowrap")}>
                                            {sign}${item.amount.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2 truncate">
                                            <span>{format(new Date(item.date), 'MMM d, yyyy')}</span>
                                            <span>•</span>
                                            <span className="font-medium text-foreground">{item.type}</span>
                                            <span>•</span>
                                            <span className="truncate max-w-[80px]">{item.source_location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

// Helper for classnames
import { cn } from "@/lib/utils";
