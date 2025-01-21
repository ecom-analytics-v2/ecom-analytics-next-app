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

const nav = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart2,
  },
  {
    title: "Revenue",
    url: "/dashboard/revenue",
    icon: DollarSign,
  },
  {
    title: "Expenses",
    url: "/dashboard/expenses",
    icon: CreditCard,
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: ShoppingBag,
  },
  {
    title: "Trajectories",
    url: "/dashboard/trajectories",
    icon: TrendingUp,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: FileText,
  },
];

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = await getUser();

  if (!user) return null;

  const activeTeam = await getActiveTeamForUser(user.id);
  const teams = await getUserTeams(user.id);

  return (
    <Sidebar variant="inset" {...props} className="border-r border-sidebar-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <TeamSwitcher activeTeam={activeTeam} teams={teams} user={user} />
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
