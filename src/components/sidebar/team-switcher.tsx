"use client";

import { updateActiveTeam } from "@//actions/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Team, User } from "@/lib/db/schema";
import { ChevronsUpDown } from "lucide-react";

interface TeamSwitcherProps {
  activeTeam: Team;
  teams: Team[];
  user: User;
}

export function TeamSwitcher({ activeTeam, teams, user }: TeamSwitcherProps) {
  const handleTeamChange = async (teamId: number) => {
    if (!user) return { error: "User not found" };

    await updateActiveTeam({ userId: user.id, teamId });
  };

  return (
    <DropdownMenu>
      {!activeTeam ? (
        <div className="flex w-full items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
      ) : (
        <DropdownMenuTrigger className="flex w-full items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              {activeTeam.name.charAt(0)}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{activeTeam.name}</span>
              <span className="truncate text-xs">{activeTeam.planName}</span>
            </div>
          </div>
          <ChevronsUpDown className="size-4" />
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent align="start" className="w-56">
        {teams.map((team) => (
          <DropdownMenuItem key={team.id} onSelect={() => handleTeamChange(team.id)}>
            <div className="flex items-center space-x-3">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {team.name.charAt(0)}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-semibold">{team.name}</span>
                <span className="text-xs">{team.planName}</span>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
