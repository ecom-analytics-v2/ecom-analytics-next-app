"use client";
import * as React from "react";
import { Area, Bar, BarChart, CartesianGrid, ComposedChart, Legend, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { dateFormatter, formatCurrency } from "@/lib/utils";
import { useState } from "react";

const chartConfig = {
  profit: { label: "Profit", color: "hsl(var(--chart-1))" },
  revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
  expenses: { label: "Expenses", color: "hsl(var(--chart-3))" },
};

type Props = {
  orders: {
    created_at: Date;
    total_price: number;
    expenses: number;
  }[];
  startDate: Date;
  endDate: Date;
};

const formatCompactCurrency = (value: number) => {
  // Use Intl.NumberFormat with explicit options for consistency
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value);
};

export function ProfitOverTime({ orders, startDate, endDate }: Props) {
  type ChartType = "combined" | "profit" | "revenue" | "expenses";
  const [activeChart, setActiveChart] = useState<ChartType>("combined");

  // Process daily summary into chart data
  const chartData = React.useMemo(() => {
    return orders.map((order) => ({
      date: order.created_at,
      revenue: order.total_price,
      expenses: order.expenses,
      profit: order.total_price - order.expenses,
    }));
  }, [orders]);

  const transformedChartData = chartData.map((item) => ({
    ...item,
    expenses: -item.expenses,
  }));

  const totals = React.useMemo(
    () => ({
      revenue: chartData.reduce((acc, curr) => acc + curr.revenue, 0),
      expenses: chartData.reduce((acc, curr) => acc + curr.expenses, 0),
      profit: chartData.reduce((acc, curr) => acc + (curr.revenue - curr.expenses), 0),
    }),
    [chartData]
  );

  const averages = React.useMemo(
    () => ({
      revenue: totals.revenue / chartData.length,
      expenses: totals.expenses / chartData.length,
      profit: totals.profit / chartData.length,
    }),
    [totals, chartData]
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
              tickFormatter={(value) => dateFormatter(value, startDate, endDate)}
              tickMargin={10}
              minTickGap={32}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactCurrency(Math.abs(value))}
              dx={-8}
            />
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={1} />
              </linearGradient>
            </defs>
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[4, 4, 0, 0]}
              barSize={20}
              fillOpacity={1}
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              radius={[0, 0, 4, 4]}
              barSize={20}
              fillOpacity={1}
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
                        <div className=" pt-2">
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
              tickFormatter={(value) => dateFormatter(value, startDate, endDate)}
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
                    new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    }).format(new Date(label))
                  }
                />
              }
            />
            <Bar dataKey="profit" fill="var(--color-profit)" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case "revenue":
      case "expenses":
        const dataKey = activeChart;
        return (
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => dateFormatter(value, startDate, endDate)}
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
                          backgroundColor: `var(--color-${dataKey})`,
                        }}
                      />
                      <span>{chartConfig[dataKey].label}</span>
                      <span className="ml-auto font-mono">
                        {formatCompactCurrency(Math.abs(value as number))}
                      </span>
                    </div>
                  )}
                  label={(label: number) =>
                    new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    }).format(new Date(label))
                  }
                />
              }
            />
            <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0  p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Profit Metrics</CardTitle>
          <CardDescription>Daily financial performance breakdown</CardDescription>
        </div>
        <div className="flex flex-wrap">
          <button
            data-active={activeChart === "combined"}
            className="relative z-30 flex flex-1 flex-col justify-center gap-1
             px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:px-8 sm:py-6"
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
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left  data-[active=true]:bg-muted/50 sm:px-8 sm:py-6"
              onClick={() => setActiveChart(type)}
            >
              <span className="text-xs text-muted-foreground">Total {chartConfig[type].label}</span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {type === "profit"
                  ? formatCompactCurrency(totals[type])
                  : formatCompactCurrency(Math.abs(totals[type]))}
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
