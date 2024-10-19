"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"
import { useDateRange } from "@/components/dashboard/date-range-context"
import { useState } from "react"
import { useExpenseFilter } from "./expense-filter"

// Reuse the Expense interface
interface Expense {
  name: string;
  type: "Fixed Cost" | "Variable Cost" | "Staff" | "Software" | "Marketing" | "Operating Expenses" | "Taxes" | "Other";
  amount: number;
  amount_type: "dollar" | "percentage";
}

const chartConfig: ChartConfig = {
  "Fixed Cost": {
    label: "Fixed Cost",
    color: "hsl(var(--chart-1))",
  },
  "Variable Cost": {
    label: "Variable Cost",
    color: "hsl(var(--chart-2))",
  },
  "Staff": {
    label: "Staff",
    color: "hsl(var(--chart-3))",
  },
  "Software": {
    label: "Software",
    color: "hsl(var(--chart-4))",
  },
  "Marketing": {
    label: "Marketing",
    color: "hsl(var(--chart-5))",
  },
  "Operating Expenses": {
    label: "Operating Expenses",
    color: "hsl(var(--chart-6))",
  },
  "Taxes": {
    label: "Taxes",
    color: "hsl(var(--chart-7))",
  },
  "Other": {
    label: "Other",
    color: "hsl(var(--chart-8))",
  },
}

const TOTAL_REVENUE = 100000; // Assuming total revenue of $100,000

export function ExpenseAreaChart({ expenses }: { expenses: Expense[] }) {
  const [chartData, setChartData] = useState<any[]>([]);
  const { dateRange } = useDateRange();
  const { selectedType } = useExpenseFilter();

  React.useEffect(() => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const daysDifference = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate appropriate number of data points
    let dataPoints = Math.min(Math.max(Math.floor(daysDifference / 7), 7), 52);

    const interval = (end.getTime() - start.getTime()) / (dataPoints - 1);

    const data: any[] = [];
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(start.getTime() + i * interval);
      const dataPoint: any = { date: date.toISOString().split('T')[0] };
      
      if (selectedType === "All") {
        Object.keys(chartConfig).forEach(type => {
          dataPoint[type] = 0;
        });
      } else {
        dataPoint[selectedType] = 0;
      }
      
      expenses.forEach(expense => {
        if (selectedType === "All" || expense.type === selectedType) {
          const amount = expense.amount_type === "percentage" ? (expense.amount / 100) * TOTAL_REVENUE : expense.amount;
          dataPoint[expense.type] = (dataPoint[expense.type] || 0) + amount / dataPoints;
        }
      });
      
      data.push(dataPoint);
    }

    setChartData(data);
  }, [expenses, dateRange.startDate, dateRange.endDate, selectedType]);

  const totalExpenses = React.useMemo(() => {
    return expenses.reduce((sum, expense) => sum + (expense.amount_type === "percentage" ? (expense.amount / 100) * TOTAL_REVENUE : expense.amount), 0);
  }, [expenses]);

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expense Area Chart</CardTitle>
        <CardDescription>
          Showing expenses from {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              {(selectedType === "All" ? Object.keys(chartConfig) : [selectedType]).map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={chartConfig[key as keyof typeof chartConfig].color}
                  fill={chartConfig[key as keyof typeof chartConfig].color}
                  fillOpacity={0.4}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
