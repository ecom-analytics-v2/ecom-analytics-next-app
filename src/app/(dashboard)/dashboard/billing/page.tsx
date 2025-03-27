import { getUser } from "@/actions/user";
import BillingInitial from "@/components/dashboard/billing/billing-initial";
import BillingManage from "@/components/dashboard/billing/billing-manage";
import { getUserWithTeamAndSub } from "@/lib/data-functions";
import { redirect } from "next/navigation";
const Page = async () => {
  const user = await getUser();
  if (!user) {
    redirect("/sign-in");
  }

  const userWithSub = await getUserWithTeamAndSub(user.id);

  return (
    <div className="flex-1 bg-muted/40 p-4">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col">
          <div className="text-xl">Billing</div>
          <div className="text-gray-400">Manage your team's subscription</div>
        </div>
        {!userWithSub.teamHasActiveSubscription && <BillingInitial />}
        {userWithSub.teamHasActiveSubscription && <BillingManage />}
      </div>
    </div>
  );
};

export default Page;
