"use client";

import {
  BarChart2,
  Cog,
  CreditCard,
  DollarSign,
  FileText,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
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
  {
    title: "Team Settings",
    url: "/dashboard/settings",
    icon: Cog,
  },
];

export function NavMain() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {navItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={isActive ? "bg-sidebar-accent" : ""}
              >
                <Link href={item.url}>
                  <item.icon className={isActive ? "text-primary" : ""} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
