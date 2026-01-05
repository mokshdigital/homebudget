"use client";

import React from "react";
import { format } from "date-fns";
import {
    PiggyBank,
    Landmark,
    MoreVertical,
    Edit,
    Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Saving } from "@/lib/types";
import { useData } from "@/lib/data-context";

type MobileSavingListProps = {
    data: Saving[];
    onEdit: (saving: Saving) => void;
    onDelete: (id: string) => void;
};

export function MobileSavingList({ data, onEdit, onDelete }: MobileSavingListProps) {
    const { savingLocations } = useData();

    if (data.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <p>No savings records found.</p>
                <p className="text-sm mt-1">Tap + to add one.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 pb-20">
            {data.map((saving) => {
                const location = savingLocations.find(l => l.id === saving.locationId);

                // Savings Theme: Blue/Cyan
                const color = "#0ea5e9"; // Sky-500

                return (
                    <Card key={saving.id} className="overflow-hidden border-l-4 shadow-sm" style={{ borderLeftColor: color }}>
                        <CardContent className="p-0">
                            <div
                                className="flex items-center p-4 gap-3 active:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => onEdit(saving)}
                            >
                                {/* Icon */}
                                <div
                                    className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
                                    style={{ backgroundColor: color }}
                                >
                                    <Landmark className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold truncate pr-2 text-base">{saving.description}</h3>
                                        <span className="font-bold text-sky-600 whitespace-nowrap">
                                            ${saving.amount.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2 truncate">
                                            <span>{format(new Date(saving.date), 'MMM d, yyyy')}</span>
                                            <span>•</span>
                                            <span className="truncate max-w-[100px]">{location?.name || 'Unknown Location'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(saving)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => onDelete(saving.id)}
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
