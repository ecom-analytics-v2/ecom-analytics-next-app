"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";

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

const chartData = [
  { date: "2024-04-01", orders: 45, adSpend: 320, newCustomers: 12 },
  { date: "2024-04-02", orders: 52, adSpend: 280, newCustomers: 15 },
  { date: "2024-04-03", orders: 38, adSpend: 450, newCustomers: 14 },
  { date: "2024-04-04", orders: 63, adSpend: 380, newCustomers: 21 },
  { date: "2024-04-05", orders: 41, adSpend: 290, newCustomers: 14 },
  { date: "2024-04-06", orders: 35, adSpend: 250, newCustomers: 11 },
  { date: "2024-04-07", orders: 28, adSpend: 220, newCustomers: 7 },
  { date: "2024-04-08", orders: 58, adSpend: 420, newCustomers: 19 },
  { date: "2024-04-09", orders: 47, adSpend: 350, newCustomers: 16 },
  { date: "2024-04-10", orders: 51, adSpend: 380, newCustomers: 18 },
  { date: "2024-04-11", orders: 44, adSpend: 310, newCustomers: 13 },
  { date: "2024-04-12", orders: 49, adSpend: 340, newCustomers: 15 },
  { date: "2024-04-13", orders: 32, adSpend: 280, newCustomers: 9 },
  { date: "2024-04-14", orders: 29, adSpend: 240, newCustomers: 8 },
  { date: "2024-04-15", orders: 55, adSpend: 390, newCustomers: 20 },
  { date: "2024-04-16", orders: 61, adSpend: 420, newCustomers: 22 },
  { date: "2024-04-17", orders: 48, adSpend: 350, newCustomers: 17 },
  { date: "2024-04-18", orders: 42, adSpend: 300, newCustomers: 14 },
  { date: "2024-04-19", orders: 53, adSpend: 380, newCustomers: 19 },
  { date: "2024-04-20", orders: 39, adSpend: 290, newCustomers: 12 },
  { date: "2024-04-21", orders: 31, adSpend: 250, newCustomers: 9 },
  { date: "2024-04-22", orders: 57, adSpend: 410, newCustomers: 21 },
  { date: "2024-04-23", orders: 46, adSpend: 340, newCustomers: 16 },
  { date: "2024-04-24", orders: 50, adSpend: 370, newCustomers: 18 },
  { date: "2024-04-25", orders: 43, adSpend: 320, newCustomers: 15 },
  { date: "2024-04-26", orders: 37, adSpend: 280, newCustomers: 11 },
  { date: "2024-04-27", orders: 34, adSpend: 260, newCustomers: 10 },
  { date: "2024-04-28", orders: 30, adSpend: 230, newCustomers: 8 },
  { date: "2024-04-29", orders: 54, adSpend: 400, newCustomers: 20 },
  { date: "2024-04-30", orders: 59, adSpend: 430, newCustomers: 23 },
];

const transformedData = chartData.map((day) => ({
  date: day.date,
  costPerNewCustomer: +(day.adSpend / day.newCustomers).toFixed(2),
  costPerAcquisition: +(day.adSpend / day.orders).toFixed(2),
}));

const chartConfig = {
  costPerCustomer: {
    label: "Cost per New Customer",
    color: "hsl(var(--chart-1))",
  },
  costPerOrder: {
    label: "Cost per Order",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

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

// Custom tooltip formatter
const renderTooltip = (
  <ChartTooltipContent
    className="w-[200px]"
    formatter={(value, name) => (
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
          style={{
            backgroundColor:
              chartConfig[name === "costPerNewCustomer" ? "costPerCustomer" : "costPerOrder"].color,
          }}
        />
        <span>
          {name === "costPerNewCustomer" ? "Cost per New Customer" : "Cost per Acquisition"}
        </span>
        <span className="ml-auto font-mono">${value}</span>
      </div>
    )}
    label={(label: string) =>
      new Date(label).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  />
);

export function CostPerAcquisition() {
  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 p-6">
          <CardTitle>Acquisition Metrics</CardTitle>
          <CardDescription>Customer acquisition cost analysis</CardDescription>
        </div>
        <div className="flex flex-wrap">
          <div className="flex h-full min-h-24 flex-1 flex-col justify-center gap-1 border-t px-6 text-left sm:border-l sm:border-t-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Cost per New Customer
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">$24.50</span>
          </div>
          <div className="flex h-full min-h-24 flex-1 flex-col justify-center gap-1 border-t border-l px-6 text-left sm:border-l sm:border-t-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Cost per Acquisition
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">$12.75</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={transformedData}
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
              interval={Math.ceil(transformedData.length / 10)}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
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
              stackId="a"
            />
            <Area
              name="costPerAcquisition"
              dataKey="costPerAcquisition"
              type="natural"
              fill="url(#orderGradient)"
              stroke={chartConfig.costPerOrder.color}
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
