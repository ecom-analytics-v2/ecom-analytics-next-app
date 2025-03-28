"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { dateFormatter, formatCompactCurrency } from "@/lib/utils";
import { StandardLinechartData } from "@/types/chartTypes";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const StandardLinechartChart = ({
  cardTitle,
  cardDescription,
  dataKey,
  data,
  startDate,
  endDate,
  yAxisTickFormat = "dollar",
}: {
  cardTitle: string;
  cardDescription: string;
  dataKey: string;
  data: StandardLinechartData;
  startDate: Date;
  endDate: Date;
  yAxisTickFormat?: "dollar" | "number" | "number_2decimal" | "percentage";
}) => {
  let yAxisTickFormatter = (value: any) => formatCompactCurrency(Math.abs(value));
  if (yAxisTickFormat === "percentage") {
    yAxisTickFormatter = (value: any) => `${value.toFixed(3)}%`;
  } else if (yAxisTickFormat === "number_2decimal") {
    yAxisTickFormatter = (value: any) => value.toFixed(2);
  } else if (yAxisTickFormat === "number") {
    yAxisTickFormatter = (value: any) => value;
  }

  const chartConfig = {
    [dataKey]: { label: cardTitle, color: "hsl(var(--chart-1))" },
  };

  const rechartsData = Object.entries(data).map(([key, value]) => ({
    date: new Date(key),
    [dataKey]: value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
          <AreaChart accessibilityLayer data={rechartsData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => dateFormatter(value, startDate, endDate)}
            />
            <YAxis tickLine={false} axisLine={false} tickFormatter={yAxisTickFormatter} dx={-8} />
            <defs>
              <linearGradient id={`${dataKey}Gradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${dataKey})`} stopOpacity={1} />
                <stop offset="95%" stopColor={`var(--color-${dataKey})`} stopOpacity={1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={`var(--color-${dataKey})`}
              strokeWidth={2}
              fill={`url(#${dataKey}Gradient)`}
              dot={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  className="w-[200px]"
                  formatter={(value, name, item) => (
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{
                          backgroundColor: `var(--color-${name})`,
                        }}
                      />
                      <span>{cardTitle}</span>
                      <span className="ml-auto font-mono">{yAxisTickFormatter(value)}</span>
                    </div>
                  )}
                />
              }
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default StandardLinechartChart;
