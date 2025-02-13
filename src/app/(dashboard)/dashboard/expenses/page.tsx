import { getAllTeamExpenses } from "@/actions/expenses";
import { getUser, getUserWithTeam } from "@/actions/user";
import { redirect } from "next/navigation";
import {
  ExpenseFilter,
  ExpenseFilterProvider,
} from "@/components/dashboard/expense-table/expense-filter";
import { ExpenseTableContainer } from "@/components/dashboard/expense-table/expense-table-container";
import { ExpenseTableSkeleton } from "../../../../components/dashboard/skeletons/expense-table-skeleton";
import { getTeamForUser } from "@/actions/team";
import { api } from "@/trpc/server";
import dummyOrders from "../dummy-orders.json";

interface ShopifyOrder {
  id: number;
  shopify_gid: string;
  total_amount: number;
  shopify_account_id: number;
  created_at: string;
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

  const expenses = await getAllTeamExpenses(user.id);

  // Fetch date filter data
  const dateData = await api.filterRouter.getDateFilter();

  // Get orders from dummy data that fall within the date range
  const startDate = new Date(dateData.startDate);
  const endDate = new Date(dateData.endDate);
  const orders = (dummyOrders as ShopifyOrder[]).filter((order) => {
    const orderDate = new Date(order.created_at);
    return orderDate >= startDate && orderDate <= endDate;
  });

  return (
    <ExpenseFilterProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40 relative overflow-y-auto">
        <div className="flex flex-col sm:gap-4 sm:py-4">
          <main className="relative flex-1 gap-4 px-4 sm:px-6 items-center md:gap-8 ">
            <ExpenseFilter />

            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
              {userWithTeam.teamId ? (
                <ExpenseTableContainer
                  totalRevenue={1000000}
                  expenses={expenses}
                  teamId={userWithTeam.teamId}
                  dateRange={{ startDate, endDate }}
                  orders={orders}
                />
              ) : (
                <ExpenseTableSkeleton />
              )}
            </div>
            <div></div>
          </main>
        </div>
      </div>
    </ExpenseFilterProvider>
  );
}
