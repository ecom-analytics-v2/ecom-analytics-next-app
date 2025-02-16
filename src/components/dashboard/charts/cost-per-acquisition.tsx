"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  costPerCustomer: {
    label: "Cost per New Customer",
    color: "hsl(var(--chart-2))",
  },
  costPerOrder: {
    label: "Cost per Order",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface DailySummary {
  created_at: Date;
  total_price: number;
  ad_spend: number;
  expenses: number;
  new_customers: number;
  orders: number;
}

// Custom legend style to match the design
const renderLegend = (props: any) => {
  const { payload } = props;

  return (
    <div className="flex justify-center gap-4 text-sm ">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">
            {entry.dataKey === "costPerNewCustomer"
              ? chartConfig.costPerCustomer.label
              : chartConfig.costPerOrder.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export function CostPerAcquisition({
  dailySummary,
  startDate,
  endDate,
}: {
  dailySummary: DailySummary[];
  startDate: Date;
  endDate: Date;
}) {
  // Create array of all dates in range
  const chartData = React.useMemo(() => {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const allDates = Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    });

    // Create a map of existing data
    const dataMap = new Map(
      dailySummary.map((day) => [
        new Date(day.created_at).setUTCHours(0, 0, 0, 0),
        {
          costPerNewCustomer: +(day.ad_spend / Math.max(day.new_customers, 1)).toFixed(2),
          costPerOrder: +(day.ad_spend / Math.max(day.orders, 1)).toFixed(2),
        },
      ])
    );

    // Transform data to include all dates
    return allDates.map((date) => ({
      date: date.getTime(),
      ...(dataMap.get(date.getTime()) || {
        costPerNewCustomer: 0,
        costPerOrder: 0,
      }),
    }));
  }, [dailySummary, startDate, endDate]);

  // Calculate averages for the period
  const averages = React.useMemo(() => {
    console.log(dailySummary.map((day) => day.ad_spend));
    console.log(dailySummary.map((day) => day.new_customers));
    console.log(dailySummary.map((day) => day.orders));

    const totalAdSpend = dailySummary.reduce((sum, day) => sum + day.ad_spend, 0);
    const totalNewCustomers = dailySummary.reduce((sum, day) => sum + day.new_customers, 0);
    const totalOrders = dailySummary.reduce((sum, day) => sum + day.orders, 0);

    return {
      costPerNewCustomer:
        totalNewCustomers > 0 ? +(totalAdSpend / totalNewCustomers).toFixed(2) : 0,
      costPerOrder: totalOrders > 0 ? +(totalAdSpend / totalOrders).toFixed(2) : 0,
    };
  }, [dailySummary]);

  const dateFormatter = (value: any) => {
    const date = new Date(value);
    const daysDiff =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (daysDiff <= 7) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Custom tooltip with the dateFormatter
  const renderTooltip = (
    <ChartTooltipContent
      className="w-[200px]"
      formatter={(value: ValueType, name: NameType) => (
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
            style={{
              backgroundColor:
                chartConfig[name === "costPerNewCustomer" ? "costPerCustomer" : "costPerOrder"]
                  .color,
            }}
          />
          <span>{name === "costPerNewCustomer" ? "Cost per New Customer" : "Cost per Order"}</span>
          <span className="ml-auto font-mono">${Number(value || 0).toFixed(2)}</span>
        </div>
      )}
      label={(label: string) => dateFormatter(Number(label))}
    />
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 p-6">
          <CardTitle>Acquisition Metrics</CardTitle>
          <CardDescription>Average daily acquisition costs</CardDescription>
        </div>
        <div className="flex flex-wrap">
          <div className="flex h-full min-h-24 flex-1 flex-col justify-center gap-1 px-6 text-left">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Avg. Cost per New Customer
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              ${averages.costPerNewCustomer}
            </span>
          </div>
          <div className="flex h-full min-h-24 flex-1 flex-col justify-center gap-1 px-6 text-left">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Avg. Cost per Order
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              ${averages.costPerOrder}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={chartData}
            margin={{
              left: -8,
              right: 12,
              top: 12,
            }}
          >
            <defs>
              <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.costPerCustomer.color} stopOpacity={1} />
                <stop
                  offset="95%"
                  stopColor={chartConfig.costPerCustomer.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.costPerOrder.color} stopOpacity={1} />
                <stop offset="95%" stopColor={chartConfig.costPerOrder.color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              domain={[startDate.getTime(), endDate.getTime()]}
              type="number"
              scale="time"
              tickFormatter={dateFormatter}
              tickMargin={10}
              minTickGap={32}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value}`}
              dx={-8}
              tickCount={6}
            />
            <ChartTooltip cursor={false} content={renderTooltip} />
            <Legend content={renderLegend} />
            <Area
              name="costPerNewCustomer"
              dataKey="costPerNewCustomer"
              type="natural"
              fill="url(#customerGradient)"
              stroke={chartConfig.costPerCustomer.color}
              strokeWidth={2}
            />
            <Area
              name="costPerOrder"
              dataKey="costPerOrder"
              type="natural"
              fill="url(#orderGradient)"
              stroke={chartConfig.costPerOrder.color}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
