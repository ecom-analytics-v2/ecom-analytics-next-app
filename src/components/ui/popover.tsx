"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-xl p-4",
        "relative overflow-hidden",
        // Border that switches between light and dark modes
        "border border-black/[0.1] dark:border-white/[0.1]",
        // Chart colors glow effect
        "before:absolute before:-inset-[1px] before:rounded-[inherit]",
        "before:bg-gradient-to-br before:from-chart-1/[0.02] before:via-chart-2/[0.02] before:to-chart-1/[0.02]",
        "before:blur-xl before:opacity-100",
        "before:transition-all before:duration-500",
        "before:-z-10",
        "hover:before:opacity-60",
        // Light mode gradient background
        "bg-gradient-to-b from-background/95 via-background/50 to-background/90",
        "backdrop-blur-md",
        // Dark mode gradient background
        "dark:bg-gradient-to-b dark:from-background/30 dark:via-background/20 dark:to-background/30",
        "dark:backdrop-blur-md",
        // Light mode shadow
        "shadow-[0_0_15px_rgba(0,0,0,0.05)]",
        // Dark mode shadow
        "dark:shadow-[0_0_15px_rgba(0,0,0,0.2)]",
        // Light mode shine
        "after:absolute after:inset-0",
        "after:bg-gradient-to-br after:from-background/40 after:to-background/20",
        "dark:after:from-white/[0.01] dark:after:via-white/[0.07] dark:after:to-white/[0.01]",
        "after:-z-10",
        // Hover shine effect
        "hover:after:opacity-100",
        "after:transition-opacity after:duration-500",
        // Animation
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
