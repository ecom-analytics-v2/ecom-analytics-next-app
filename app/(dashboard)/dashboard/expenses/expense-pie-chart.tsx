"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { differenceInDays } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { useDateRange } from "@/components/dashboard/date-range-context";
import { cn } from "@/lib/utils";

// Define the Order interface
interface Order {
  name: string;
  type:
    | "Fixed Cost"
    | "Variable Cost"
    | "Staff"
    | "Software"
    | "Marketing"
    | "Operating Expenses"
    | "Taxes"
    | "Other";
  amount: number;
  amount_type: "dollar" | "percentage";
}

interface ExpenseChartProps {
  orders: Order[];
}

const TOTAL_REVENUE = 100000; // Assuming total revenue of $100,000

const chartConfig: ChartConfig = {
  expenses: {
    label: "Expenses",
  },
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

export function ExpensePieChart({ orders }: ExpenseChartProps) {
  const { dateRange } = useDateRange();

  const adjustedOrders = React.useMemo(() => {
    if (!dateRange.endDate || !dateRange.startDate) return orders;

    const daysInRange = differenceInDays(dateRange.endDate, dateRange.startDate) + 1;
    const adjustmentFactor = daysInRange / 30; // Assuming original data is for 30 days

    return orders.map((order) => ({
      ...order,
      amount: order.amount_type === "dollar" ? order.amount * adjustmentFactor : order.amount, // Percentage remains the same
    }));
  }, [orders, dateRange]);

  const calculateActualAmount = (order: Order) => {
    if (order.amount_type === "percentage") {
      return (order.amount / 100) * TOTAL_REVENUE;
    }
    return order.amount;
  };

  const chartData = React.useMemo(() => {
    const groupedExpenses = adjustedOrders.reduce(
      (acc, order) => {
        const actualAmount = calculateActualAmount(order);
        if (!acc[order.type]) {
          acc[order.type] = 0;
        }
        acc[order.type] += actualAmount;
        return acc;
      },
      {} as Record<Order["type"], number>
    );

    return Object.entries(groupedExpenses).map(([type, amount]) => ({
      type,
      expenses: amount,
      formattedExpenses: formatCurrency(amount),
      fill: chartConfig[type as keyof typeof chartConfig].color,
    }));
  }, [adjustedOrders]);

  const totalExpenses = React.useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.expenses, 0);
  }, [chartData]);

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expense Categories</CardTitle>
        <CardDescription>
          {new Date(dateRange.startDate).toLocaleDateString()} -{" "}
          {new Date(dateRange.endDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
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
                        <div className="text-right font-medium">
                          {formatCurrency(data.expenses)}
                        </div>
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
              innerRadius={60}
              strokeWidth={0}
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
                          className="fill-foreground text-2xl font-bold"
                        >
                          ${totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
