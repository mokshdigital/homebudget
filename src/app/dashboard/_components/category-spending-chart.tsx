
"use client";

import React from "react";
import { Pie, PieChart, Cell, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { Transaction, Category } from "@/lib/types";

type CategorySpendingChartProps = {
  transactions: Transaction[];
  categories: Category[];
};

const CustomChartLegend = ({ payload, spendingByCategory }: any) => {
  if (!payload) return null;
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {payload.map((entry: any, index: number) => {
        const item = spendingByCategory.find((c: any) => c.name === entry.value);
        if (!item) return null;
        return (
          <div key={`item-${index}`} className="flex items-center gap-1.5 text-sm">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.fill }} />
            <span>{item.name} ({item.percentage.toFixed(0)}%)</span>
          </div>
        );
      })}
    </div>
  );
};

export default function CategorySpendingChart({ transactions, categories }: CategorySpendingChartProps) {
  const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

  const spendingByCategory = categories.map((category) => {
    const total = transactions
      .filter((t) => t.categoryId === category.id)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      name: category.name,
      total: total,
      fill: category.color,
      percentage: totalSpending > 0 ? (total / totalSpending) * 100 : 0,
    };
  }).filter(c => c.total > 0);

  const chartConfig = {
    ...Object.fromEntries(spendingByCategory.map((c) => [c.name, { label: c.name, color: c.fill }]))
  } as ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>A breakdown of your expenses for the selected period.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {spendingByCategory.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(value, name, props) => {
                  return (
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: props.payload.fill}}/>
                      <div className="flex justify-between flex-1">
                        <span>{props.payload.name}</span>
                        <span className="font-bold ml-4">${(value as number).toFixed(2)}</span>
                      </div>
                    </div>
                  )
                }} hideLabel={true} />}
              />
              <Pie
                data={spendingByCategory}
                dataKey="total"
                nameKey="name"
                strokeWidth={5}
              >
                {spendingByCategory.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend
                content={<CustomChartLegend spendingByCategory={spendingByCategory} />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">No spending data for this period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
