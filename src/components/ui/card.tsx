import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl shadow",
        "relative overflow-hidden",
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
        "before:absolute before:inset-0",
        "before:bg-gradient-to-br before:from-background/40 before:to-background/0",
        "dark:before:from-white/5 dark:before:to-transparent",
        // Hover shine effect
        "after:absolute after:inset-0",
        "after:bg-gradient-to-b after:from-background/20 after:via-background/10 after:to-background/20",
        "dark:after:from-white/[0.03] dark:after:via-white/[0.01] dark:after:to-white/[0.03]",
        "after:opacity-0 hover:after:opacity-100",
        "after:transition-opacity after:duration-500",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6 relative z-10", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight text-xl", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0 relative z-10", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0 relative z-10", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
