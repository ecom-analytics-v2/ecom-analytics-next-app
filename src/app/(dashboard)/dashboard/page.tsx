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
import { CostPerAcquisition } from "@/components/dashboard/charts/cost-per-acquisition";
import { api } from "@/trpc/server";
import dummyOrders from "./dummy-orders.json";

// Add these types near the top of the file
type ShopifyOrder = {
  id: number;
  shopify_gid: string;
  created_at: Date;
  total_amount: number;
  total_price: number;
  shopify_account_id: number;
};

// Convert the JSON dates to Date objects
const formattedOrders: ShopifyOrder[] = dummyOrders.map((order) => ({
  ...order,
  created_at: new Date(order.created_at),
  total_price: order.total_amount,
}));
// Define DailySummary type
type DailySummary = {
  created_at: Date;
  total_price: number;
};

// Add this function before the Dashboard component
function getDailySummary(orders: ShopifyOrder[]): DailySummary[] {
  const dailySummary = orders.reduce<Record<number, { date: Date; total: number; count: number }>>(
    (acc, order) => {
      // Use UTC methods to ensure consistent dates across server/client
      const date = new Date(order.created_at);
      date.setUTCHours(0, 0, 0, 0);
      const dateKey = date.getTime();

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date,
          total: 0,
          count: 0,
        };
      }

      // Ensure consistent decimal places
      acc[dateKey].total = Number((acc[dateKey].total + order.total_price).toFixed(2));
      acc[dateKey].count += 1;

      return acc;
    },
    {}
  );

  return Object.values(dailySummary)
    .map(({ date, total }) => ({
      created_at: new Date(date),
      // Ensure consistent decimal places
      total_price: Number(total.toFixed(2)),
    }))
    .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
}

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

  if (!teamData.shopifyAccount?.id) {
    throw new Error("Shopify account not found");
  }

  // Fetch date filter data server-side
  const dateData = await api.filterRouter.getDateFilter();

  // Ensure dates are properly formatted for the Shopify API
  // const orderData = await api.shopifyRouter.getOrders({
  //   startDate: new Date(dateData.startDate),
  //   endDate: new Date(dateData.endDate),
  //   shopId: teamData.shopifyAccount.id,
  // });

  // console.log(orderData);

  // Get the daily summary
  const dailySummary = getDailySummary(formattedOrders);
  console.log("Daily Order Summaries:", dailySummary);

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
            <ProfitOverTime
              orders={dailySummary}
              startDate={dateData.startDate}
              endDate={dateData.endDate}
            />
          </ChartWrapper>

          <ChartWrapper className="col-span-3 ">
            <MarketingEfficiencyRatio />
          </ChartWrapper>

          <ChartWrapper className="col-span-6">
            <CostPerAcquisition />
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
