"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import { differenceInDays, addDays, isSameDay, getDaysInMonth, isLeapYear } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { useDateRange } from "@/components/dashboard/date-range-context";
import { useExpenseFilter } from "./expense-filter";
import { Expense } from "@/lib/db/schema/expenses";
import { ExpenseType } from "@/types/expenseTypes";

interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}

/**
 * Configuration for chart colors and labels based on expense types.
 */
const chartConfig: Record<ExpenseType, { color: string }> = {
  "Fixed Cost": {
    color: "hsl(var(--chart-1))",
  },
  "Variable Cost": {
    color: "hsl(var(--chart-2))",
  },
  Staff: {
    color: "hsl(var(--chart-3))",
  },
  Software: {
    color: "hsl(var(--chart-4))",
  },
  Marketing: {
    color: "hsl(var(--chart-5))",
  },
  "Operating Expenses": {
    color: "hsl(var(--chart-6))",
  },
  Taxes: {
    color: "hsl(var(--chart-7))",
  },
  Other: {
    color: "hsl(var(--chart-8))",
  },
};

interface ExpenseBarChartProps {
  expenses: Expense[];
  teamId: number;
  totalRevenue: number;
}

export function ExpenseBarChart({ expenses, totalRevenue }: ExpenseBarChartProps) {
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
  const { dateRange } = useDateRange();
  const { selectedTypes } = useExpenseFilter();

  React.useEffect(() => {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const dayCount = differenceInDays(endDate, startDate) + 1;

    const dailyData: ChartDataPoint[] = Array.from({ length: dayCount }, (_, index) => {
      const currentDate = addDays(startDate, index);
      return {
        date: currentDate.toISOString(),
        ...Object.fromEntries(Object.keys(chartConfig).map((key) => [key, 0])),
      };
    });

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const expenseAmount = parseFloat(expense.amount);
      let dailyAmount = expenseAmount;

      if (expense.frequency === "monthly") {
        dailyAmount = expenseAmount / getDaysInMonth(expenseDate);
      } else if (expense.frequency === "yearly") {
        dailyAmount = expenseAmount / (isLeapYear(expenseDate) ? 366 : 365);
      }

      dailyData.forEach((data, index) => {
        const currentDate = addDays(startDate, index);
        if (expense.frequency === "one_time" && isSameDay(currentDate, expenseDate)) {
          data[expense.type] = (data[expense.type] as number) + expenseAmount;
        } else if (expense.frequency === "monthly" || expense.frequency === "yearly") {
          data[expense.type] = (data[expense.type] as number) + dailyAmount;
        }
        // Note: 'per_order' frequency is not handled here as it depends on order data
      });
    });

    setChartData(dailyData);
  }, [expenses, dateRange, selectedTypes, totalRevenue]);

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expense Bar Chart</CardTitle>
        <CardDescription>
          Showing expenses from {new Date(dateRange.startDate).toLocaleDateString()} to{" "}
          {new Date(dateRange.endDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 24,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <ChartTooltip
                cursor={{ fill: "var(--background)", opacity: 0.5 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="text-sm font-medium mb-2">
                          {new Date(label).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="space-y-2">
                          {payload
                            .filter(
                              (entry) =>
                                selectedTypes.length === 0 ||
                                selectedTypes.includes(entry.name as ExpenseType)
                            )
                            .map((entry, index) => (
                              <div key={`item-${index}`} className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center w-full">
                                  <div
                                    className="mx-2 h-2 w-2 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="font-medium">{entry.name}</span>
                                </div>
                                <div className="text-right font-medium">
                                  {formatCurrency(entry.value as number)}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {(selectedTypes.length === 0 ? Object.keys(chartConfig) : selectedTypes).map(
                (key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={chartConfig[key as ExpenseType].color}
                  />
                )
              )}
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
