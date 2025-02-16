import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ExpenseAreaChartSkeleton() {
  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expense Area Chart</CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-64 my-4" />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 ">
        <div className="h-full w-full flex items-center justify-center bg-accent/10 rounded-xl">
          <Skeleton className="h-4/5 w-11/12" />
        </div>
      </CardContent>
    </Card>
  );
}
