import { getTeamForUser } from "@/actions/team";
import { getUser, getUserWithTeam } from "@/actions/user";
import DatePickerWithRange from "@/components/dashboard/common/date-range-picker";
import HealthMetrics from "@/components/dashboard/revenue-charts/health-metrics";
import StandardLinechartChart from "@/components/dashboard/revenue-charts/standard-linechat";
import { fetchRevenueCharts } from "@/lib/integrations/backend-client";
import { redirect } from "next/navigation";
import { ChartWrapper } from "../page";

export default async function Dashboard() {
  const user = await getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam) {
    redirect("/sign-in");
  }

  const teamData = await getTeamForUser(user.id);
  if (!teamData) {
    throw new Error("Team not found");
  }

  const startDate = teamData.dateFilterStart ?? new Date();
  const endDate = teamData.dateFilterEnd ?? new Date();

  const revenueChartData = await fetchRevenueCharts(
    teamData,
    teamData.dateFilterStart ?? undefined,
    teamData.dateFilterEnd ?? undefined
  );

  return (
    <div className="flex-1 bg-muted/40 p-4">
      <h1 className="text-xl font-semibold">Revenue</h1>

      <div className="flex justify-between items-center py-6">
        <div className="flex items-center gap-x-2">
          <DatePickerWithRange />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1">
          <ChartWrapper className="col-span-12">
            <HealthMetrics
              data={{
                rpvData: revenueChartData.RevenuePerVisitor,
                profitLineData: revenueChartData.ProfitLine,
              }}
              startDate={startDate}
              endDate={endDate}
            />
          </ChartWrapper>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartWrapper className="">
            <StandardLinechartChart
              cardTitle="Average Order Value"
              dataKey="aov"
              data={revenueChartData.AverageOrderValue}
              startDate={startDate}
              endDate={endDate}
            />
          </ChartWrapper>

          <ChartWrapper className="">
            <StandardLinechartChart
              cardTitle="First Purchase Conversion Rate"
              dataKey="fpcr"
              data={revenueChartData.FirstPurchaseConversionRate}
              startDate={startDate}
              endDate={endDate}
              yAxisTickFormat="percentage"
            />
          </ChartWrapper>
        </div>
      </div>
    </div>
  );
}
