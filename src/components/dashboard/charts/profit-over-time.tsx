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

const chartConfig = {
  profit: { label: "Profit", color: "hsl(var(--chart-1))" },
  revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
  expenses: { label: "Expenses", color: "hsl(var(--chart-3))" },
};

type Props = {
  orders: {
    created_at: Date;
    total_price: number;
  }[];
  startDate: Date;
  endDate: Date;
};

export function ProfitOverTime({ orders, startDate, endDate }: Props) {
  type ChartType = "combined" | "profit" | "revenue" | "expenses";
  const [activeChart, setActiveChart] = useState<ChartType>("combined");

  // Process daily summary into chart data
  const chartData = React.useMemo(() => {
    // Create a map of date to revenue
    const revenueByDate = orders.reduce((acc: Record<string, number>, order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0]!;
      acc[date] = (acc[date] || 0) + order.total_price;
      return acc;
    }, {});

    // Calculate number of days between start and end
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Create the full dataset with expenses
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0]!;

      const revenue = revenueByDate[dateStr] || 0;
      // Use a deterministic value for expenses based on the date
      const expenses = 800 + date.getDate() * 30; // This will vary expenses between 830-1700 based on day of month

      return {
        date,
        revenue,
        expenses,
        profit: revenue - expenses,
      };
    });
  }, [orders, startDate, endDate]);

  const transformedChartData = chartData.map((item) => ({
    ...item,
    expenses: -item.expenses,
  }));

  const totals = React.useMemo(
    () => ({
      profit: chartData.reduce((acc, curr) => acc + curr.profit, 0),
      revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
      expenses: chartData.reduce((acc, curr) => acc + curr.expenses, 0),
    }),
    [chartData]
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
                        {formatCompactCurrency(value as number)}
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
