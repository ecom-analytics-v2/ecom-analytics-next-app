import { getAllTeamExpenses } from "@/actions/expenses";
import { getUser, getUserWithTeam } from "@/actions/user";
import { redirect } from "next/navigation";
import { getShopifyOrderAmountTotal, getShopifyOrdersForDateRange } from "@/actions/shopifyOrders";
import { getTeamForUser } from "@/actions/team";
import { TotalSales } from "@/components/dashboard/charts/total-sales";
import DatePickerWithRange from "@/components/dashboard/date-range-picker";

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
      </div>
    </div>
  );
}
