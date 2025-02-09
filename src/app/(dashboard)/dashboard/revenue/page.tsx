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

  const shopifyOrderAmountTotal = await getShopifyOrderAmountTotal(teamData.id);

  const shopifyOrdersByDateRange = await getShopifyOrdersForDateRange(teamData.id);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 relative overflow-y-auto">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <main className="relative flex-1 gap-4 px-4 sm:px-6 items-center md:gap-8 ">
          <h1 className="text-xl font-semibold">Revenue</h1>
          <div className="flex justify-between w-full items-center py-6">
            <div className="flex items-center gap-x-2">
              <DatePickerWithRange />
            </div>
          </div>

          <div className="grid grid-rows-12 items-start gap-4 md:gap-8 grid-cols-3 lg:grid-cols-12 md:grid-cols-6 h-screen">
            <div className="gap-4 items-end row-span-6 col-span-6">
              <TotalSales
                totalShopifySales={shopifyOrderAmountTotal}
                shopifyOrdersByDateRange={shopifyOrdersByDateRange}
              />

              <div className="sm:col-span-1 w-full h-full"></div>
            </div>
          </div>
          <div></div>
        </main>
      </div>
    </div>
  );
}
