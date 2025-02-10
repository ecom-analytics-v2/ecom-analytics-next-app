import { BarChart2, CreditCard, DollarSign, FileText, ShoppingBag, TrendingUp } from "lucide-react";
import * as React from "react";

import { getActiveTeamForUser, getUserTeams } from "@//actions/team";
import { getUser } from "@//actions/user";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "@/components/sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = await getUser();

  if (!user) return null;

  const activeTeam = await getActiveTeamForUser(user.id);
  const teams = await getUserTeams(user.id);

  const mappedTeams = teams.map((t) => t.teams);

  return (
    <Sidebar variant="floating" {...props} className="">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <TeamSwitcher activeTeam={activeTeam} teams={mappedTeams} user={user} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
