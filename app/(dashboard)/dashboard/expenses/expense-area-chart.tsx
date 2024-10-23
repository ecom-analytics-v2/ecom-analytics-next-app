"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { differenceInDays, addDays, isSameDay } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { useDateRange } from "@/components/dashboard/date-range-context";
import { useExpenseFilter } from "./expense-filter";
import { Expense } from "@/lib/db/schema/expenses";
import { ExpenseType } from "@/types/expenseTypes";

/**
 * Represents a data point for the expense area chart.
 */
interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}

/**
 * Configuration for chart colors and labels based on expense types.
 */
const chartConfig: Record<ExpenseType, { label: string; color: string }> = {
  "Fixed Cost": {
    label: "Fixed Cost",
    color: "hsl(var(--chart-1))",
  },
  "Variable Cost": {
    label: "Variable Cost",
    color: "hsl(var(--chart-2))",
  },
  Staff: {
    label: "Staff",
    color: "hsl(var(--chart-3))",
  },
  Software: {
    label: "Software",
    color: "hsl(var(--chart-4))",
  },
  Marketing: {
    label: "Marketing",
    color: "hsl(var(--chart-5))",
  },
  "Operating Expenses": {
    label: "Operating Expenses",
    color: "hsl(var(--chart-6))",
  },
  Taxes: {
    label: "Taxes",
    color: "hsl(var(--chart-7))",
  },
  Other: {
    label: "Other",
    color: "hsl(var(--chart-8))",
  },
};

/**
 * Props for the ExpenseAreaChart component.
 */
interface ExpenseAreaChartProps {
  expenses: Expense[];
  teamId: number;
  totalRevenue: number;
}

/**
 * ExpenseAreaChart component displays an area chart of expenses over time.
 * It allows filtering by expense type and date range.
 *
 * @param {ExpenseAreaChartProps} props - The component props
 * @returns {JSX.Element} The rendered ExpenseAreaChart component
 */
export function ExpenseAreaChart({ expenses, totalRevenue }: ExpenseAreaChartProps) {
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([]);
  const { dateRange } = useDateRange();
  const { selectedTypes } = useExpenseFilter();

  /**
   * Effect to calculate and update chart data based on expenses, date range, and selected types.
   */
  React.useEffect(() => {
    if (!dateRange.endDate || !dateRange.startDate) return;

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const daysDifference = differenceInDays(end, start) + 1;

    // Process expenses to handle recurring and one-time expenses
    const processedExpenses: ProcessedExpense[] = expenses.map((expense) => ({
      ...expense,
      processedAmount: parseFloat(expense.amount),
      isRecurring: expense.frequency !== "one_time" && expense.frequency !== "per_order",
    }));

    const data: ChartDataPoint[] = [];
    for (let i = 0; i < daysDifference; i++) {
      const currentDate = addDays(start, i);
      const dataPoint: ChartDataPoint = {
        date: currentDate.toISOString().split("T")[0],
      };

      // Initialize selected expense types
      (selectedTypes.length === 0 ? Object.keys(chartConfig) : selectedTypes).forEach((type) => {
        dataPoint[type] = 0;
      });

      processedExpenses.forEach((expense) => {
        if (selectedTypes.length === 0 || selectedTypes.includes(expense.type as ExpenseType)) {
          if (expense.isRecurring) {
            // For recurring expenses, add the daily amount
            const dailyAmount = expense.processedAmount / 30; // Assuming monthly recurring
            dataPoint[expense.type] = ((dataPoint[expense.type] as number) || 0) + dailyAmount;
          } else {
            // For one-time expenses, add the full amount on the specific date
            const expenseDate = new Date(expense.date);
            if (isSameDay(currentDate, expenseDate)) {
              dataPoint[expense.type] =
                ((dataPoint[expense.type] as number) || 0) + expense.processedAmount;
            }
          }
        }
      });

      data.push(dataPoint);
    }

    setChartData(data);
  }, [expenses, dateRange, selectedTypes, totalRevenue]);

  return (
    <Card className="flex flex-col h-[400px] ">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expense Area Chart</CardTitle>
        <CardDescription>
          Showing expenses from {new Date(dateRange.startDate).toLocaleDateString()} to{" "}
          {new Date(dateRange.endDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
            width={1000}
            height={300}
            className="mx-auto"
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
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
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
                      <div className="space-y-1">
                        {payload
                          .filter(
                            (entry) =>
                              selectedTypes.length === 0 ||
                              selectedTypes.includes(entry.name as ExpenseType)
                          )
                          .map((entry, index) => (
                            <div key={`item-${index}`} className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center">
                                <div
                                  className="mr-2 h-2 w-2 rounded-full"
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
            {(selectedTypes.length === 0 ? Object.keys(chartConfig) : selectedTypes).map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={chartConfig[key as ExpenseType].color}
                fill={chartConfig[key as ExpenseType].color}
                fillOpacity={0.4}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Add this interface to represent a processed expense
interface ProcessedExpense extends Expense {
  processedAmount: number;
  isRecurring: boolean;
}
