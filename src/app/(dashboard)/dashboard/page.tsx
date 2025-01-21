import { getTeamForUser } from "@/actions/team";
import { getUser } from "@/actions/user";
import { redirect } from "next/navigation";

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
