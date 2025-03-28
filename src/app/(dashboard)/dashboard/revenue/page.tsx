import { getTeamForUser } from "@/actions/team";
import { getUser, getUserWithTeam } from "@/actions/user";
import DatePickerWithRange from "@/components/dashboard/common/date-range-picker";
import HealthMetrics from "@/components/dashboard/revenue-charts/health-metrics";
import StandardLinechartChart from "@/components/dashboard/revenue-charts/standard-linechat";
import { db } from "@/lib/db/drizzle";
import { googleAccounts, shopifyAccounts } from "@/lib/db/schema";
import { fetchRevenueCharts } from "@/lib/integrations/backend-client";
import { eq } from "drizzle-orm";
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
    redirect("/dashboard/setup");
  }

  const teamHasShopifyAccount = await db.query.shopifyAccounts.findFirst({
    where: eq(shopifyAccounts.teamId, teamData.id),
  });

  if (!teamHasShopifyAccount) {
    redirect("/dashboard/setup");
  }

  const teamHasGoogleAccount = await db.query.googleAccounts.findFirst({
    where: eq(googleAccounts.teamId, teamData.id),
  });

  if (!teamHasGoogleAccount) {
    redirect("/dashboard/setup");
  }

  const startDate = teamData.dateFilterStart ?? new Date();
  const endDate = teamData.dateFilterEnd ?? new Date();

  let revenueChartData;

  try {
    revenueChartData = await fetchRevenueCharts(
      teamData,
      teamData.dateFilterStart ?? undefined,
      teamData.dateFilterEnd ?? undefined
    );
  } catch (e) {
    return redirect("/error");
  }

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
              cardDescription="The average order value"
              dataKey="aov"
              data={revenueChartData.AverageOrderValue}
              startDate={startDate}
              endDate={endDate}
            />
          </ChartWrapper>

          <ChartWrapper className="">
            <StandardLinechartChart
              cardTitle="First Purchase Conversion Rate"
              cardDescription="The percentage of visitors who make their first purchase"
              dataKey="fpcr"
              data={revenueChartData.FirstPurchaseConversionRate}
              startDate={startDate}
              endDate={endDate}
              yAxisTickFormat="percentage"
            />
          </ChartWrapper>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartWrapper className="">
            <StandardLinechartChart
              cardTitle="Average Customer Purchase Frequency"
              cardDescription="The average of customer purchase frequency"
              dataKey="acpf"
              data={revenueChartData.AverageCustomerPurchaseFrequency}
              startDate={startDate}
              endDate={endDate}
              yAxisTickFormat="number"
            />
          </ChartWrapper>

          <ChartWrapper className="">
            <StandardLinechartChart
              cardTitle="Customer Lifetime Value"
              cardDescription="The average amount of money a customer spends on a product or service"
              dataKey="clv"
              data={revenueChartData.CustomerLifetimeValue}
              startDate={startDate}
              endDate={endDate}
              yAxisTickFormat="dollar"
            />
          </ChartWrapper>
        </div>
      </div>
    </div>
  );
}
