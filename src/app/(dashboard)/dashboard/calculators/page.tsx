import { getTeamForUser } from "@/actions/team";

import { getUser } from "@/actions/user";
import RevenueFromAdsCalculator from "@/components/dashboard/calculators/revenue-from-ads";
import ShippingCostCalculator from "@/components/dashboard/calculators/shipping-cost";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const teamData = await getTeamForUser(user.id);
  if (!teamData) {
    redirect("/dashboard/setup");
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex-1 bg-muted/40 p-4">
        <h1 className="text-xl font-semibold">Calculators</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <ShippingCostCalculator />
        <RevenueFromAdsCalculator />
      </div>
    </div>
  );
};

export default Page;
