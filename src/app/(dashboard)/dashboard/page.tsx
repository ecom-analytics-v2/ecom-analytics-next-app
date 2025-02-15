/**
 * Dashboard Page Component
 *
 * This page displays various business metrics and charts for the user's store.
 * It includes profit over time, marketing efficiency, cost per acquisition,
 * and contribution margin visualizations.
 */

import { getAllTeamExpenses } from "@/actions/expenses";
import { getUser, getUserWithTeam } from "@/actions/user";
import { getTeamForUser } from "@/actions/team";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/server";

// Component Imports
import DatePickerWithRange from "@/components/dashboard/common/date-range-picker";
import { ProfitOverTime } from "@/components/dashboard/charts/profit-over-time";
import { MarketingEfficiencyRatio } from "@/components/dashboard/charts/marketing-efficiency-ratio";
import { CostPerAcquisition } from "@/components/dashboard/charts/cost-per-acquisition";
import { ContributionMargin } from "@/components/dashboard/charts/contribution-margin";

// Data Imports
import dummyOrders from "./dummy-orders.json";
import dummyAds from "./dummy-ads.json";
import { Expense } from "@/lib/db/schema/expenses";

// Types
interface ShopifyOrder {
  id: number;
  shopify_gid: string;
  created_at: Date;
  total_amount: number;
  total_price: number;
  shopify_account_id: number;
}

interface FacebookAd {
  id: string;
  impressions: number;
  spend: number;
  actions: {
    action_type: string;
    value: string;
  }[];
  cost_per_action_type: {
    action_type: string;
    value: string;
  }[];
  social_spend: number;
  reach: number;
  clicks: number;
  cost_per_ad_click: number | null;
  cost_per_conversion: number | null;
  cost_per_one_thousand_ad_impression: number | null;
  cost_per_outbound_click: number | null;
  cost_per_unique_outbound_click: number | null;
  cost_per_thruplay: {
    action_type: string;
    value: string;
  }[];
  cost_per_unique_action_type: number | null;
  cost_per_unique_conversion: number | null;
  cost_per_dda_countby_convs: number | null;
  cost_per_inline_link_click: number | null;
  cost_per_inline_post_engagement: number | null;
  cost_per_unique_click: number | null;
  cost_per_unique_inline_link_click: number | null;
  cpc: number | null;
  cpm: number;
  cpp: number;
  ctr: number;
  frequency: number;
  full_view_impressions: number;
  full_view_reach: number;
  objective: string;
  optimization_goal: string;
  buying_type: string;
  account_currency: string;
  date_start: string;
  date_stop: string;
  date_start_key: string;
  date_stop_key: string;
}

interface DailySummary {
  created_at: Date;
  total_price: number;
  ad_spend: number;
  expenses: number;
  cogs: number;
}

/**
 * Formats raw order data by converting date strings to Date objects
 */
const formatOrders = (orders: typeof dummyOrders): ShopifyOrder[] => {
  return orders.map((order) => ({
    ...order,
    created_at: new Date(order.created_at),
    total_price: order.total_amount,
    cogs: order.cogs,
  }));
};

/**
 * Formats ad data and halves the spend amount
 */
const formatAds = (ads: typeof dummyAds) => {
  return ads.map((ad) => ({
    ...ad,
    date_start: new Date(ad.date_start),
    date_stop: new Date(ad.date_stop),
    spend: Number(ad.spend) / 2,
  }));
};

/**
 * Calculates daily summary of orders, expenses, and ad spend
 */
function getDailySummary(
  orders: ShopifyOrder[],
  ads: FacebookAd[],
  expenses: Expense[],
  startDate: Date,
  endDate: Date
): DailySummary[] {
  // Create array of dates in range
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  });

  // Initialize summary data
  const summary = dates.reduce<
    Record<
      string,
      {
        date: Date;
        total: number;
        expenses: number;
        count: number;
        cogs: number;
        ad_spend: number;
      }
    >
  >((acc, date) => {
    acc[date.getTime()] = { date, total: 0, expenses: 0, count: 0, cogs: 0, ad_spend: 0 };
    return acc;
  }, {});

  // Add order data
  orders.forEach((order) => {
    const date = new Date(order.created_at);
    date.setUTCHours(0, 0, 0, 0);
    const key = date.getTime();

    if (summary[key]) {
      summary[key].total += order.total_price;
      summary[key].cogs += order.total_price;
      summary[key].count++;
    }
  });

  // Add expenses
  expenses.forEach((expense: Expense) => {
    dates.forEach((date) => {
      const key = date.getTime();
      if (!summary[key]) return;

      const dailyAmount = calculateDailyExpense(expense, summary[key].count, date);
      summary[key].expenses += dailyAmount;
    });
  });

  // Add ad spend to expenses
  ads.forEach((ad: FacebookAd) => {
    const date = new Date(ad.date_start);
    date.setUTCHours(0, 0, 0, 0);
    const key = date.getTime();

    if (summary[key]) {
      summary[key].ad_spend += ad.spend;
    }
  });

  return Object.values(summary)
    .map(({ date, total, expenses, ad_spend, cogs }) => ({
      created_at: date,
      total_price: Number(total.toFixed(2)),
      expenses: Number(expenses.toFixed(2)),
      ad_spend: Number(ad_spend.toFixed(2)),
      cogs: Number(cogs.toFixed(2)),
    }))
    .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
}

/**
 * Calculates daily expense amount based on expense frequency
 */
function calculateDailyExpense(expense: any, orderCount: number, currentDate: Date): number {
  switch (expense.frequency) {
    case "monthly":
      return Number(expense.amount) / 30;
    case "yearly":
      return Number(expense.amount) / 365;
    case "per_order":
      return Number(expense.amount) * orderCount;
    case "one_time": {
      const expenseDate = new Date(expense.transaction_date || expense.created_at);
      expenseDate.setUTCHours(0, 0, 0, 0);
      return expenseDate.getTime() === currentDate.getTime() ? Number(expense.amount) : 0;
    }
    default:
      return 0;
  }
}

/**
 * Chart wrapper component with loading skeleton
 */
function ChartWrapper({
  children,
  className = "col-span-3 md:col-span-6 lg:col-span-9",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Suspense fallback={<ChartSkeleton className={className} />}>
      <div className={className}>{children}</div>
    </Suspense>
  );
}

/**
 * Loading skeleton for charts
 */
function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Card className="w-full h-[300px] animate-pulse">
        <CardContent className="p-6">
          <div className="w-full h-full bg-muted rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Main Dashboard Component
 *
 * Displays business metrics and charts for the authenticated user's store.
 * Handles authentication, data fetching, and layout of visualization components.
 */
export default async function Dashboard() {
  // Authentication checks
  const user = await getUser();
  if (!user?.id) redirect("/sign-in");

  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam) redirect("/sign-in");

  const teamData = await getTeamForUser(user.id);
  if (!teamData?.shopifyAccount?.id) {
    throw new Error("Team or Shopify account not found");
  }

  // Fetch and prepare data
  const dateData = await api.filterRouter.getDateFilter();
  const startDate = new Date(dateData.startDate);
  const endDate = new Date(dateData.endDate);

  const orderData = await api.shopifyRouter.getOrders({
    startDate,
    endDate,
    shop: teamData.shopifyAccount.shop,
  });

  const expenses = await getAllTeamExpenses(teamData.id);
  const formattedOrders = formatOrders(dummyOrders);
  const formattedAds = formatAds(dummyAds) as unknown as FacebookAd[];

  const dailySummary = getDailySummary(formattedOrders, formattedAds, expenses, startDate, endDate);

  return (
    <div className="flex-1 bg-muted/40">
      <div className="p-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        <div className="flex justify-between items-center py-6">
          <DatePickerWithRange />
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 xl:grid-cols-12 gap-4">
          <ChartWrapper className="col-span-3 md:col-span-6 lg:col-span-9">
            <ProfitOverTime
              orders={dailySummary}
              startDate={dateData.startDate}
              endDate={dateData.endDate}
            />
          </ChartWrapper>

          <ChartWrapper className="col-span-3">
            <MarketingEfficiencyRatio
              dailySummary={dailySummary}
              startDate={dateData.startDate}
              endDate={dateData.endDate}
            />
          </ChartWrapper>
          {/* 
          <ChartWrapper className="col-span-6">
            <CostPerAcquisition />
          </ChartWrapper> */}

          <ChartWrapper className="col-span-6">
            <ContributionMargin />
          </ChartWrapper>
        </div>
      </div>
    </div>
  );
}
