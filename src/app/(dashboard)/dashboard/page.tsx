import { getAllTeamExpenses } from "@/actions/expenses";
import { getUser, getUserWithTeam } from "@/actions/user";
import { redirect } from "next/navigation";
import { getShopifyOrderAmountTotal, getShopifyOrdersForDateRange } from "@/actions/shopifyOrders";
import { getTeamForUser } from "@/actions/team";
import { TotalSales } from "../../../components/dashboard/charts/total-sales";
import DatePickerWithRange from "@/components/dashboard/date-range-picker";
import { ExpenseFilter } from "./expenses/expense-filter";
import { ProfitOverTime } from "@/components/dashboard/charts/profit-over-time";
import { MarketingEfficiencyRatio } from "@/components/dashboard/charts/marketing-efficiency-ratio";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";

function ChartWrapper({
  children,
  className = "col-span-3 md:col-span-6 lg:col-span-9",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Suspense
      fallback={
        <div className={className}>
          <ChartSkeleton />
        </div>
      }
    >
      <div className={className}>{children}</div>
    </Suspense>
  );
}

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

  return (
    <div className="flex-1 bg-muted/40">
      <div className="p-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        <div className="flex justify-between items-center py-6">
          <div className="flex items-center gap-x-2">
            <DatePickerWithRange />
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 xl:grid-cols-12 gap-4">
          <ChartWrapper className="col-span-3 md:col-span-6 lg:col-span-9">
            <ProfitOverTime />
          </ChartWrapper>

          <ChartWrapper className="col-span-3 ">
            <MarketingEfficiencyRatio />
          </ChartWrapper>
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card className="w-full h-[300px] animate-pulse">
      <CardContent className="p-6">
        <div className="w-full h-full bg-muted rounded-md" />
      </CardContent>
    </Card>
  );
}
