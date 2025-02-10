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

const shopifyData = [
  { date: "2024-04-01", revenue: 1200 },
  { date: "2024-04-02", revenue: 1500 },
  { date: "2024-04-03", revenue: 1100 },
  { date: "2024-04-04", revenue: 1800 },
  { date: "2024-04-05", revenue: 2000 },
  { date: "2024-04-06", revenue: 1600 },
  { date: "2024-04-07", revenue: 1400 },
  { date: "2024-04-08", revenue: 2200 },
  { date: "2024-04-09", revenue: 1300 },
  { date: "2024-04-10", revenue: 1700 },
  { date: "2024-04-11", revenue: 1900 },
  { date: "2024-04-12", revenue: 1500 },
  { date: "2024-04-13", revenue: 2100 },
  { date: "2024-04-14", revenue: 1400 },
  { date: "2024-04-15", revenue: 1600 },
  { date: "2024-04-16", revenue: 1800 },
  { date: "2024-04-17", revenue: 2400 },
  { date: "2024-04-18", revenue: 2200 },
  { date: "2024-04-19", revenue: 1700 },
  { date: "2024-04-20", revenue: 1300 },
  { date: "2024-04-21", revenue: 1500 },
  { date: "2024-04-22", revenue: 1800 },
  { date: "2024-04-23", revenue: 1600 },
  { date: "2024-04-24", revenue: 2000 },
  { date: "2024-04-25", revenue: 1700 },
  { date: "2024-04-26", revenue: 1200 },
  { date: "2024-04-27", revenue: 2300 },
  { date: "2024-04-28", revenue: 1400 },
  { date: "2024-04-29", revenue: 1900 },
  { date: "2024-04-30", revenue: 2500 },
];

const facebookData = [
  { date: "2024-04-01", adSpend: 200 },
  { date: "2024-04-02", adSpend: 250 },
  { date: "2024-04-03", adSpend: 180 },
  { date: "2024-04-04", adSpend: 300 },
  { date: "2024-04-05", adSpend: 350 },
  { date: "2024-04-06", adSpend: 220 },
  { date: "2024-04-07", adSpend: 190 },
  { date: "2024-04-08", adSpend: 400 },
  { date: "2024-04-09", adSpend: 180 },
  { date: "2024-04-10", adSpend: 250 },
  { date: "2024-04-11", adSpend: 320 },
  { date: "2024-04-12", adSpend: 200 },
  { date: "2024-04-13", adSpend: 350 },
  { date: "2024-04-14", adSpend: 180 },
  { date: "2024-04-15", adSpend: 220 },
  { date: "2024-04-16", adSpend: 280 },
  { date: "2024-04-17", adSpend: 400 },
  { date: "2024-04-18", adSpend: 350 },
  { date: "2024-04-19", adSpend: 250 },
  { date: "2024-04-20", adSpend: 180 },
  { date: "2024-04-21", adSpend: 200 },
  { date: "2024-04-22", adSpend: 280 },
  { date: "2024-04-23", adSpend: 220 },
  { date: "2024-04-24", adSpend: 350 },
  { date: "2024-04-25", adSpend: 250 },
  { date: "2024-04-26", adSpend: 150 },
  { date: "2024-04-27", adSpend: 380 },
  { date: "2024-04-28", adSpend: 180 },
  { date: "2024-04-29", adSpend: 320 },
  { date: "2024-04-30", adSpend: 450 },
];

const getMerByDay = () => {
  return shopifyData
    .map((revenueItem) => {
      const matchingAdSpend = facebookData.find(
        (adSpendItem) => adSpendItem.date === revenueItem.date
      );
      if (!matchingAdSpend) return null;

      return {
        date: revenueItem.date,
        mer: revenueItem.revenue / matchingAdSpend.adSpend,
      };
    })
    .filter(Boolean);
};

const getAverageMer = () => {
  const merByDay = getMerByDay() as { date: string; mer: number }[];
  if (!merByDay.length) return 0;

  const total = merByDay.reduce((sum, item) => sum + item.mer, 0);
  return total / merByDay.length;
};

const chartConfig = {
  mer: {
    label: "MER",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function MarketingEfficiencyRatio() {
  const averageMer = getAverageMer();
  const chartData = [{ mer: (averageMer / 10) * 100 }]; // Convert to percentage where 10 MER = 100%

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
          className=" aspect-square min-h-fit min-w-fit max-h-[350px] max-w-[350px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-card"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="mer" background cornerRadius={10} />
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
