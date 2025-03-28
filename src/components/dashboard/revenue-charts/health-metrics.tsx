"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { dateFormatter, formatCompactCurrency } from "@/lib/utils";
import { StandardLinechartData } from "@/types/chartTypes";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

type ChartType = "combined" | "rpv" | "profitLine";

const chartConfig = {
  rpv: { label: "Revenue Per Visitor", color: "hsl(var(--chart-1))" },
  profitLine: { label: "Profit Line", color: "hsl(var(--chart-2))" },
};

const HealthMetrics = ({
  data,
  startDate,
  endDate,
}: {
  data: {
    rpvData: StandardLinechartData;
    profitLineData: StandardLinechartData;
  };
  startDate: Date;
  endDate: Date;
}) => {
  const [activeChart, setActiveChart] = useState<ChartType>("combined");

  const allDates = Array.from(
    new Set([...Object.keys(data.rpvData), ...Object.keys(data.profitLineData)])
  );
  const combinedData = allDates
    .map((dateStr) => ({
      date: new Date(dateStr),
      rpv: data.rpvData[dateStr],
      profitLine: data.profitLineData[dateStr] ?? 0,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const rpvData = Object.entries(data.rpvData).map(([key, value]) => ({
    date: new Date(key),
    rpv: value,
  }));
  const totalRpv = rpvData.reduce((sum, entry) => sum + entry.rpv, 0);
  const avgRpv = totalRpv / rpvData.length;

  const profitLineData = Object.entries(data.profitLineData).map(([key, value]) => ({
    date: new Date(key),
    profitLine: value,
  }));
  const totalProfit = profitLineData.reduce((sum, entry) => sum + entry.profitLine, 0);

  const headerValues = {
    rpv: avgRpv,
    profitLine: totalProfit,
  };

  const renderChart = () => {
    switch (activeChart) {
      case "combined": {
        return (
          <AreaChart accessibilityLayer data={combinedData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => dateFormatter(value, startDate, endDate)}
            />
            <YAxis
              dataKey="rpv"
              yAxisId="left"
              orientation="left"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactCurrency(Math.abs(value))}
              dx={-8}
            />
            <YAxis
              dataKey="profitLine"
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactCurrency(Math.abs(value))}
              dx={-8}
            />
            <defs>
              <linearGradient id="combinedRpvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-rpv)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--color-rpv)" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="combinedProfitLineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-profitLine)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--color-profitLine)" stopOpacity={1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="rpv"
              stroke="var(--color-rpv)"
              strokeWidth={2}
              fill="url(#combinedRpvGradient)"
              dot={false}
              yAxisId="left"
            />
            <Area
              type="monotone"
              dataKey="profitLine"
              stroke="var(--color-profitLine)"
              strokeWidth={2}
              fill="url(#combinedProfitLineGradient)"
              dot={false}
              yAxisId="right"
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
                      <span>{name === "rpv" ? "Revenue Per Visitor" : "Profit"}</span>
                      <span className="ml-auto font-mono">
                        {formatCompactCurrency(value as number)}
                      </span>
                    </div>
                  )}
                />
              }
            />
          </AreaChart>
        );
        break;
      }
      case "rpv": {
        return (
          <AreaChart accessibilityLayer data={rpvData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => dateFormatter(value, startDate, endDate)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactCurrency(Math.abs(value))}
              dx={-8}
            />
            <defs>
              <linearGradient id="rpvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-rpv)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--color-rpv)" stopOpacity={1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="rpv"
              stroke="var(--color-rpv)"
              strokeWidth={2}
              fill="url(#rpvGradient)"
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
                      <span>RPV</span>
                      <span className="ml-auto font-mono">
                        {formatCompactCurrency(value as number)}
                      </span>
                    </div>
                  )}
                />
              }
            />
          </AreaChart>
        );
        break;
      }
      case "profitLine": {
        return (
          <AreaChart accessibilityLayer data={profitLineData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => dateFormatter(value, startDate, endDate)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactCurrency(Math.abs(value))}
              dx={-8}
            />
            <defs>
              <linearGradient id="profitLineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-profitLine)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--color-profitLine)" stopOpacity={1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="profitLine"
              stroke="var(--color-profitLine)"
              strokeWidth={2}
              fill="url(#profitLineGradient)"
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
                      <span>Profit Line</span>
                      <span className="ml-auto font-mono">
                        {formatCompactCurrency(value as number)}
                      </span>
                    </div>
                  )}
                />
              }
            />
          </AreaChart>
        );
        break;
      }
      default: {
        return <></>;
        break;
      }
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0  p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Health Metrics</CardTitle>
          <CardDescription>Amet aute consequat ad sit commodo qui</CardDescription>
        </div>
        <div className="flex flex-wrap">
          <button
            data-active={activeChart === "combined"}
            className="relative z-30 flex flex-1 flex-col justify-center gap-1
                     px-6 py-4 text-left data-[active=true]:bg-muted/50 sm:px-8 sm:py-6"
            onClick={() => setActiveChart("combined")}
          >
            <span className="text-xs text-muted-foreground whitespace-nowrap">RPV v Profit</span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {/* {formatCompactCurrency(Number(0))} */}
              -.----
            </span>
          </button>

          {(["rpv", "profitLine"] as const).map((type) => (
            <button
              key={type}
              data-active={activeChart === type}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 px-6 py-4 text-left  data-[active=true]:bg-muted/50 sm:px-8 sm:py-6"
              onClick={() => setActiveChart(type)}
            >
              <span className="text-xs text-muted-foreground">
                {type === "profitLine" ? "Total" : "Avg"} {type === "profitLine" ? "Profit" : "RPV"}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {formatCompactCurrency(headerValues[type])}
                {/* {type === "profit_line"
                  ? formatCompactCurrency(totals[type])
                  : formatCompactCurrency(Math.abs(totals[type]))} */}
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
};

export default HealthMetrics;
