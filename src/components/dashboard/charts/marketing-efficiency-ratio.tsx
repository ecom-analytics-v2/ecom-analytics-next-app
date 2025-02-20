"use client";

import { InfoIcon, TrendingUp } from "lucide-react";
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DailySummary {
  created_at: Date;
  total_price: number;
  ad_spend: number;
  expenses: number;
}

interface FormattedAd {
  date_start: Date;
  date_stop: Date;
  spend: number;
}

const getMerByDay = (shopifyData: DailySummary[], startDate: Date, endDate: Date) => {
  // Create a map to aggregate daily totals
  const dailyTotals = new Map<string, { revenue: number; adSpend: number }>();

  // Aggregate revenue and ad spend by day from dailySummary
  shopifyData.forEach((order) => {
    const orderDate = new Date(order.created_at);
    // Skip if outside date range
    if (orderDate < startDate || orderDate > endDate) return;

    const date = orderDate.toISOString().split("T")[0];
    if (!date) return;

    const existing = dailyTotals.get(date) || { revenue: 0, adSpend: 0 };
    dailyTotals.set(date, {
      revenue: existing.revenue + (order.total_price || 0),
      adSpend: existing.adSpend + (order.ad_spend || 0),
    });
  });

  // Calculate MER for each day
  return Array.from(dailyTotals.entries())
    .map(([date, { revenue, adSpend }]) => {
      if (!revenue || !adSpend) return null;
      return {
        date,
        mer: revenue / adSpend,
      };
    })
    .filter(Boolean);
};

interface MarketingEfficiencyRatioProps {
  dailySummary: DailySummary[];
  startDate: Date;
  endDate: Date;
}

export function MarketingEfficiencyRatio({
  dailySummary,
  startDate,
  endDate,
}: MarketingEfficiencyRatioProps) {
  // Ensure data is properly serialized for client-side rendering
  const normalizedShopifyData = dailySummary.map((item) => ({
    ...item,
    created_at: new Date(item.created_at),
  }));

  const averageMer = getAverageMer(normalizedShopifyData, startDate, endDate);
  const chartData = [{ mer: (averageMer / 10) * 100 }];
  const endAngle = getMerPercentage(averageMer);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-start pb-0">
        <div className="flex items-center gap-2">
          <CardTitle>Marketing Efficiency Ratio</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>MER`` = Revenue / Ad Spend</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Measures revenue generated per dollar spent on marketing.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 p-0">
        <ChartContainer
          config={chartConfig}
          className=" aspect-square min-h-fit min-w-fit w-full max-h-[350px] max-w-[350px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={endAngle}
            innerRadius={100}
            outerRadius={180}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background dark:last:fill-background/[0.9]"
              polarRadius={[116, 84]}
            />
            <RadialBar dataKey="mer" fill="var(--color-mer)" background cornerRadius={9999} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                          className="fill-foreground text-4xl font-bold"
                        >
                          {averageMer.toFixed(2)}x
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Average MER
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const getAverageMer = (shopifyData: DailySummary[], startDate: Date, endDate: Date) => {
  const merByDay = getMerByDay(shopifyData, startDate, endDate) as {
    date: string;
    mer: number;
  }[];
  if (!merByDay.length) return 0;

  const total = merByDay.reduce((sum, item) => sum + item.mer, 0);
  return total / merByDay.length;
};

const getMerPercentage = (mer: number) => {
  // Calculate percentage where 10 MER = 100%
  const percentage = (mer / 10) * 100;
  // Convert percentage to angle (360 degrees max)
  return (percentage / 100) * 360;
};

const chartConfig = {
  mer: {
    label: "MER",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;
