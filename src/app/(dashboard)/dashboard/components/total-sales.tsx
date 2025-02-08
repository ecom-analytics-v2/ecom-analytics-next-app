"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

interface TotalSalesType {
  totalShopifySales: string;
  shopifyOrdersByDateRange: {
    date: Date;
    amount: string;
  }[];
}

export function TotalSales({ totalShopifySales, shopifyOrdersByDateRange }: TotalSalesType) {
  const groupOrdersByDay = (orders: { date: Date; amount: number }[]) => {
    const grouped = orders.reduce(
      (acc, order) => {
        const date = new Date(order.date);
        const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();

        if (!acc[day]) {
          acc[day] = {
            date: new Date(day),
            amount: 0,
          };
        }

        acc[day].amount += order.amount;
        return acc;
      },
      {} as Record<string, { date: Date; amount: number }>
    );

    return Object.values(grouped).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const chartData = groupOrdersByDay(
    shopifyOrdersByDateRange.map((order) => ({
      amount: parseFloat(order.amount),
      date: new Date(order.date),
    }))
  );

  const chartConfig = {
    amount: {
      label: "amount",
      color: "hsl(var(--chart01))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardDescription>Total sales over time</CardDescription>
        <CardTitle>{totalShopifySales}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              minTickGap={32}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickCount={4}
              domain={[-2000, "auto"]}
              tickFormatter={(value) => formatCompactCurrency(value)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Line
              dataKey="amount"
              type="monotone"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.4}
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
