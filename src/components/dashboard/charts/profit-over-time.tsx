"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ComposedChart,
  Legend,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Value } from "@radix-ui/react-select";

const chartData = [
  { date: "2024-04-01", revenue: 1200, expenses: 800, profit: 400 },
  { date: "2024-04-02", revenue: 1500, expenses: 900, profit: 600 },
  { date: "2024-04-03", revenue: 1100, expenses: 1500, profit: -400 },
  { date: "2024-04-04", revenue: 1800, expenses: 1100, profit: 700 },
  { date: "2024-04-05", revenue: 1300, expenses: 1500, profit: -200 },
  { date: "2024-04-06", revenue: 1600, expenses: 950, profit: 650 },
  { date: "2024-04-07", revenue: 1400, expenses: 1800, profit: -400 },
  { date: "2024-04-08", revenue: 2200, expenses: 1400, profit: 800 },
  { date: "2024-04-09", revenue: 800, expenses: 1200, profit: -400 },
  { date: "2024-04-10", revenue: 1700, expenses: 1000, profit: 700 },
  { date: "2024-04-11", revenue: 1900, expenses: 2300, profit: -400 },
  { date: "2024-04-12", revenue: 1500, expenses: 900, profit: 600 },
  { date: "2024-04-13", revenue: 2100, expenses: 1300, profit: 800 },
  { date: "2024-04-14", revenue: 1400, expenses: 1900, profit: -500 },
  { date: "2024-04-15", revenue: 900, expenses: 1600, profit: -700 },
  { date: "2024-04-16", revenue: 1800, expenses: 1100, profit: 700 },
  { date: "2024-04-17", revenue: 2400, expenses: 1500, profit: 900 },
  { date: "2024-04-18", revenue: 2200, expenses: 2800, profit: -600 },
  { date: "2024-04-19", revenue: 1700, expenses: 1000, profit: 700 },
  { date: "2024-04-20", revenue: 1300, expenses: 1800, profit: -500 },
  { date: "2024-04-21", revenue: 1500, expenses: 900, profit: 600 },
  { date: "2024-04-22", revenue: 1800, expenses: 2100, profit: -300 },
  { date: "2024-04-23", revenue: 1600, expenses: 950, profit: 650 },
  { date: "2024-04-24", revenue: 2000, expenses: 2500, profit: -500 },
  { date: "2024-04-25", revenue: 1700, expenses: 1000, profit: 700 },
  { date: "2024-04-26", revenue: 1200, expenses: 1500, profit: -300 },
  { date: "2024-04-27", revenue: 2300, expenses: 1400, profit: 900 },
  { date: "2024-04-28", revenue: 1400, expenses: 2000, profit: -600 },
  { date: "2024-04-29", revenue: 1900, expenses: 1200, profit: 700 },
  { date: "2024-04-30", revenue: 2500, expenses: 1600, profit: 900 },
];

const transformedChartData = chartData.map((item) => ({
  ...item,
  expenses: -item.expenses,
}));

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

// Add average profit calculation
const avgProfit = (
  chartData.reduce((sum, item) => sum + item.profit, 0) / chartData.length
).toFixed(2);

type ChartType = "combined" | "profit" | "revenue" | "expenses";

export function ProfitOverTime() {
  const [activeChart, setActiveChart] = useState<ChartType>("combined");

  const totals = React.useMemo(
    () => ({
      profit: chartData.reduce((acc, curr) => acc + curr.profit, 0),
      revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
      expenses: chartData.reduce((acc, curr) => acc + curr.expenses, 0),
    }),
    []
  );

  const averages = React.useMemo(
    () => ({
      profit: totals.profit / chartData.length,
      revenue: totals.revenue / chartData.length,
      expenses: totals.expenses / chartData.length,
    }),
    [totals]
  );

  const renderChart = () => {
    switch (activeChart) {
      case "combined":
        return (
          <ComposedChart data={transformedChartData} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactCurrency(Math.abs(value))}
              dx={-8}
            />
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[4, 4, 0, 0]}
              barSize={20}
              fillOpacity={0.5}
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              radius={[0, 0, 4, 4]}
              barSize={20}
              fillOpacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="var(--color-profit)"
              strokeWidth={2}
              fill="url(#profitGradient)"
              dot={false}
            />
            <Legend />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  className="w-[200px]"
                  formatter={(value, name, item) => (
                    <div className={`flex flex-col ${name === "profit" ? "gap-2" : ""}`}>
                      <div className="flex items-center gap-2">
                        {name !== "profit" && (
                          <>
                            <div
                              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                              style={{
                                backgroundColor: `var(--color-${name})`,
                              }}
                            />
                            <span>{chartConfig[name as keyof typeof chartConfig]?.label}</span>
                            <span className="ml-auto font-mono">
                              {formatCompactCurrency(Math.abs(value as number))}
                            </span>
                          </>
                        )}
                      </div>
                      {name === "profit" && (
                        <div className="border-t pt-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                              style={{
                                backgroundColor: `var(--color-${name})`,
                              }}
                            />
                            <span>{chartConfig[name as keyof typeof chartConfig]?.label}</span>
                            <span className="ml-auto font-mono">
                              {formatCompactCurrency(value as number)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                />
              }
            />
          </ComposedChart>
        );
      case "profit":
        return (
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactCurrency(value)}
              dx={-8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{
                          backgroundColor: "var(--color-profit)",
                        }}
                      />
                      <span>Profit</span>
                      <span className="ml-auto font-mono">
                        {formatCompactCurrency(Math.abs(value as number))}
                      </span>
                    </div>
                  )}
                  label={(label: number) =>
                    new Date(label).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
              }
            />
            <Bar dataKey="profit" fill="var(--color-profit)" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case "revenue":
        return (
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactCurrency(value)}
              dx={-8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{
                          backgroundColor: "var(--color-revenue)",
                        }}
                      />
                      <span>Revenue</span>
                      <span className="ml-auto font-mono">
                        {formatCompactCurrency(Math.abs(value as number))}
                      </span>
                    </div>
                  )}
                  label={(label: number) =>
                    new Date(label).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
              }
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case "expenses":
        return (
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactCurrency(value)}
              dx={-8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{
                          backgroundColor: "var(--color-expenses)",
                        }}
                      />
                      <span>Expenses</span>
                      <span className="ml-auto font-mono">
                        {formatCompactCurrency(Math.abs(value as number))}
                      </span>
                    </div>
                  )}
                  label={(label: number) =>
                    new Date(label).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
              }
            />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Profit Analysis</CardTitle>
          <CardDescription>Daily financial performance breakdown</CardDescription>
        </div>
        <div className="flex flex-wrap">
          <button
            data-active={activeChart === "combined"}
            className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
            onClick={() => setActiveChart("combined")}
          >
            <span className="text-xs text-muted-foreground">Avg. Daily Profit</span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {formatCurrency(Number(averages.profit.toFixed(2)))}
            </span>
          </button>

          {(["profit", "revenue", "expenses"] as const).map((type) => (
            <button
              key={type}
              data-active={activeChart === type}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              onClick={() => setActiveChart(type)}
            >
              <span className="text-xs text-muted-foreground">
                Total {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {formatCompactCurrency(Math.abs(totals[type]))}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
          {renderChart()}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
