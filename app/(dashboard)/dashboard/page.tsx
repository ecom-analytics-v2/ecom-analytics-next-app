import { redirect } from "next/navigation";
import { Settings } from "./settings";
import { getTeamForUser, getUser } from "@/lib/db/queries";
import { Charts } from "./charts";

export default async function OverviewPage() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const teamData = await getTeamForUser(user.id);

  if (!teamData) {
    throw new Error("Team not found");
  }

  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
