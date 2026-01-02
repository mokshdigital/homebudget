
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress as OriginalProgress } from "@/components/ui/progress";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import * as ProgressPrimitive from "@radix-ui/react-progress"
import React, { forwardRef } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import type { Budget } from "@/lib/types";
import { useData } from "@/lib/data-context";
import { MotionDiv } from "@/components/motion-div";

type BudgetData = Budget & {
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  spent: number;
  remaining: number;
  progress: number;
};

type BudgetCardProps = {
    budget: BudgetData;
    onEdit: (budget: Budget) => void;
    onDelete: (budgetId: string) => void;
    index: number;
}

const Progress = forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 transition-all", indicatorClassName)}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;


export default function BudgetCard({ budget, onEdit, onDelete, index }: BudgetCardProps) {
  const { categories } = useData();
  const Icon = getIcon(budget.categoryIcon);
  const category = categories.find(c => c.id === budget.categoryId);
  const progressColor = budget.progress > 100 ? "bg-destructive" : category?.color ? `bg-[${category.color}]` : "bg-primary";
  const remainingColor = budget.remaining >= 0 ? "text-foreground" : "text-destructive";
  
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <MotionDiv
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
    >
        <Card className="h-full">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center">
                <Icon className="h-5 w-5" style={{ color: category?.color }} />
            </div>
            <CardTitle className="text-lg">{budget.categoryName}</CardTitle>
            </div>
            <div className="flex items-center gap-1">
                <CardDescription className="capitalize">{budget.duration}</CardDescription>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(budget)}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => onDelete(budget.id)}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
            <div className={cn("text-2xl font-bold", remainingColor)}>
                ${budget.remaining.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground"> remaining</span>
            </div>
            <p className="text-xs text-muted-foreground">
                ${budget.spent.toFixed(2)} spent of ${budget.amount.toFixed(2)}
            </p>
            </div>
            <Progress value={Math.min(budget.progress, 100)} indicatorClassName={progressColor} style={{ '--tw-bg-opacity': 1, backgroundColor: budget.progress > 100 ? 'hsl(var(--destructive))' : category?.color } as React.CSSProperties} />
        </CardContent>
        </Card>
    </MotionDiv>
  );
}
