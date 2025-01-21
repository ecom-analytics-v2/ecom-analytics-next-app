"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import { useDateRange } from "@/components/dashboard/date-range-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartTooltip } from "@/components/ui/chart";
import { Expense } from "@/lib/db/schema/expenses";
import { formatCurrency } from "@/lib/utils";
import { ExpenseType } from "@/types/expenseTypes";
import { Payload } from "recharts/types/component/DefaultLegendContent";
import { useExpenseFilter } from "./expense-filter";

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

interface ChartDataItem {
  type: ExpenseType;
  expenses: number;
  formattedExpenses: string;
  fill: string;
}

interface ExpensePieChartProps {
  expenses: Expense[];
  teamId: number;
  totalRevenue: number;
}

type CustomLegendProps = {
  payload?: Payload[];
};

const renderLegend: React.FC<CustomLegendProps> = ({ payload }) => {
  if (!payload) return null;

  return (
    <ul className="grid grid-cols-2 gap-4 m-auto pb-6">
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export function ExpensePieChart({ expenses, totalRevenue }: ExpensePieChartProps) {
  const [chartData, setChartData] = React.useState<ChartDataItem[]>([]);
  const { dateRange } = useDateRange();
  const { selectedTypes } = useExpenseFilter();

  React.useEffect(() => {
    if (!dateRange.endDate || !dateRange.startDate) return;

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const daysDifference = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1;
    const adjustmentFactor = daysDifference / 30; // Assuming original data is for 30 days

    const groupedExpenses: Partial<Record<ExpenseType, number>> = {};

    expenses.forEach((expense) => {
      if (selectedTypes.length === 0 || selectedTypes.includes(expense.type as ExpenseType)) {
        const amount = parseFloat(expense.amount) * adjustmentFactor;
        groupedExpenses[expense.type as ExpenseType] =
          (groupedExpenses[expense.type as ExpenseType] || 0) + amount;
      }
    });

    const newChartData: ChartDataItem[] = Object.entries(groupedExpenses).map(([type, amount]) => ({
      type: type as ExpenseType,
      expenses: amount,
      formattedExpenses: formatCurrency(amount),
      fill: chartConfig[type as ExpenseType].color,
    }));

    setChartData(newChartData);
  }, [expenses, dateRange, selectedTypes, totalRevenue]);

  const totalExpenses = React.useMemo(
    () => chartData.reduce((sum, item) => sum + item.expenses, 0),
    [chartData]
  );

  const hasExpenses = chartData.length > 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expense Categories</CardTitle>
        <CardDescription>
          {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
          {new Date(dateRange.endDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {hasExpenses ? (
          <ChartContainer config={chartConfig} className="mx-auto h-full w-full">
            <PieChart className="w-full h-full">
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length && payload[0]) {
                    const data = payload[0].payload as ChartDataItem;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center">
                            <div
                              className="mr-2 h-2 w-2 rounded-full"
                              style={{ backgroundColor: data.fill }}
                            />
                            <span className="font-medium">{data.type}</span>
                          </div>
                          <div className="text-right font-medium">{data.formattedExpenses}</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                dataKey="expenses"
                nameKey="type"
                innerRadius={80}
                outerRadius={120}
                strokeWidth={0}
                className="w-full h-full"
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-lg font-bold"
                          >
                            {formatCurrency(totalExpenses)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Total Expenses
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
              <ChartLegend content={renderLegend} />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              No expenses found for the selected categories and date range.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
