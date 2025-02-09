"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCompactCurrency } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

const chartData = [
  { date: "2024-04-01", revenue: 1200, expenses: 800, profit: 400 },
  { date: "2024-04-02", revenue: 1500, expenses: 900, profit: 600 },
  { date: "2024-04-03", revenue: 1100, expenses: 750, profit: 350 },
  { date: "2024-04-04", revenue: 1800, expenses: 1100, profit: 700 },
  { date: "2024-04-05", revenue: 2000, expenses: 1300, profit: 700 },
  { date: "2024-04-06", revenue: 1600, expenses: 950, profit: 650 },
  { date: "2024-04-07", revenue: 1400, expenses: 850, profit: 550 },
  { date: "2024-04-08", revenue: 2200, expenses: 1400, profit: 800 },
  { date: "2024-04-09", revenue: 1300, expenses: 800, profit: 500 },
  { date: "2024-04-10", revenue: 1700, expenses: 1000, profit: 700 },
  { date: "2024-04-11", revenue: 1900, expenses: 1200, profit: 700 },
  { date: "2024-04-12", revenue: 1500, expenses: 900, profit: 600 },
  { date: "2024-04-13", revenue: 2100, expenses: 1300, profit: 800 },
  { date: "2024-04-14", revenue: 1400, expenses: 850, profit: 550 },
  { date: "2024-04-15", revenue: 1600, expenses: 950, profit: 650 },
  { date: "2024-04-16", revenue: 1800, expenses: 1100, profit: 700 },
  { date: "2024-04-17", revenue: 2400, expenses: 1500, profit: 900 },
  { date: "2024-04-18", revenue: 2200, expenses: 1400, profit: 800 },
  { date: "2024-04-19", revenue: 1700, expenses: 1000, profit: 700 },
  { date: "2024-04-20", revenue: 1300, expenses: 800, profit: 500 },
  { date: "2024-04-21", revenue: 1500, expenses: 900, profit: 600 },
  { date: "2024-04-22", revenue: 1800, expenses: 1100, profit: 700 },
  { date: "2024-04-23", revenue: 1600, expenses: 950, profit: 650 },
  { date: "2024-04-24", revenue: 2000, expenses: 1300, profit: 700 },
  { date: "2024-04-25", revenue: 1700, expenses: 1000, profit: 700 },
  { date: "2024-04-26", revenue: 1200, expenses: 750, profit: 450 },
  { date: "2024-04-27", revenue: 2300, expenses: 1400, profit: 900 },
  { date: "2024-04-28", revenue: 1400, expenses: 850, profit: 550 },
  { date: "2024-04-29", revenue: 1900, expenses: 1200, profit: 700 },
  { date: "2024-04-30", revenue: 2500, expenses: 1600, profit: 900 },
];

const chartConfig = {
  amount: {
    label: "Amount",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export function ProfitOverTime() {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("profit");

  const total = React.useMemo(
    () => ({
      profit: chartData.reduce((acc, curr) => acc + curr.profit, 0),
      revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
      expenses: chartData.reduce((acc, curr) => acc + curr.expenses, 0),
    }),
    []
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row h-full">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <div className="flex items-center gap-2">
            <CardTitle>Total Profit Over Time</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Profit = Revenue - Expenses</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>Showing profit, revenue and expenses over time</CardDescription>
        </div>
        <div className="flex">
          {["profit", "revenue", "expenses"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">{chartConfig[chart].label}</span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {formatCompactCurrency(total[key as keyof typeof total])}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${activeChart})`} stopOpacity={0.6} />
                <stop offset="95%" stopColor={`var(--color-${activeChart})`} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={4}
              tickFormatter={(value) => formatCompactCurrency(value)}
              dx={-8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey={chartConfig[activeChart].label}
                  formatter={(value) => formatCompactCurrency(value as number)}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Area
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
              fill="url(#colorGradient)"
              fillOpacity={1}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
