import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ExpensePieChartSkeleton() {
  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Expense Categories</CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-64" />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="relative mx-auto aspect-square h-full">
          <Skeleton className="absolute inset-0 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Skeleton className="h-8 w-24 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
