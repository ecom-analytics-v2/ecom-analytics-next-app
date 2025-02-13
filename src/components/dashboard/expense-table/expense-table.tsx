"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Expense } from "@/lib/db/schema/expenses";
import { formatCurrency } from "@/lib/utils";
import { calculateAdjustedExpenses } from "@/lib/utils/expense-calculations";
import { ExpenseType } from "@/types/expenseTypes";
import { format } from "date-fns";
import { ChevronDown, InfoIcon } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useExpenseFilter } from "./expense-filter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getUser, getUserWithTeam } from "@/actions/user";
import { redirect } from "next/navigation";
import { getTeamForUser } from "@/actions/team";
import { api } from "@/trpc/server";
import { ExpenseTableFilters } from "./expense-table-filters";

interface ExpenseTableProps {
  expenses: Expense[];
  teamId: number;
  totalRevenue: number;
  adjustedExpenses: {
    name: string;
    type: string;
    amount: string | number;
    frequency: string;
    createdAt: Date;
    adjusted_amount: number;
    percentage_amount: number;
  }[];
  ordersCount: number;
}

type SortOption =
  | "most-expensive"
  | "least-expensive"
  | "alphabetical"
  | "reverse-alphabetical"
  | "newest"
  | "oldest";

const sortOptionLabels: Record<SortOption, string> = {
  "most-expensive": "Most Expensive",
  "least-expensive": "Least Expensive",
  alphabetical: "A-Z",
  "reverse-alphabetical": "Z-A",
  newest: "Newest First",
  oldest: "Oldest First",
};

// Add frequency display helper
const frequencyDisplayMap: Record<string, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  per_order: "Per Order",
  one_time: "One Time",
};

interface ShopifyOrder {
  id: number;
  shopify_gid: string;
  total_amount: number;
  shopify_account_id: number;
  created_at: string;
}

/**
 * ExpenseTable component displays a table of expenses with sorting and filtering capabilities.
 * @param totalRevenue - The total revenue for the selected period.
 * @param expenses - An array of Expense objects to be displayed.
 */
export function ExpenseTable({
  totalRevenue,
  expenses,
  adjustedExpenses: initialAdjustedExpenses,
  ordersCount,
}: ExpenseTableProps) {
  const [sortedExpenses, setSortedExpenses] = useState(initialAdjustedExpenses);
  const { selectedTypes } = useExpenseFilter();

  // Update sortedExpenses when initialAdjustedExpenses or selectedTypes change
  useEffect(() => {
    const filteredExpenses =
      selectedTypes.length === 0
        ? initialAdjustedExpenses
        : initialAdjustedExpenses.filter((expense) =>
            selectedTypes.includes(expense.type as ExpenseType)
          );
    setSortedExpenses(filteredExpenses);
  }, [initialAdjustedExpenses, selectedTypes]);

  return (
    <div>
      <Card>
        <CardHeader className="px-7">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>
                Breakdown of your business expenses for the selected period.
              </CardDescription>
            </div>
            {/* Client-side filters component */}
            <ExpenseTableFilters expenses={initialAdjustedExpenses} onSort={setSortedExpenses} />
          </div>
        </CardHeader>
        <CardContent>
          {sortedExpenses.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              You do not have any expenses for the selected period.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-right">Dollar Amount</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.map((expense, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? "bg-accent/20" : ""}>
                    <TableCell>
                      <div className="font-normal">{expense.name}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{expense.type}</TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-end gap-1 cursor-help">
                              {formatCurrency(expense.adjusted_amount)}
                              <InfoIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="space-y-2 p-4 max-w-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <span className="text-muted-foreground">Original:</span>
                              <span className="font-medium text-right">
                                {formatCurrency(parseFloat(expense.amount.toString()))}
                              </span>
                              <span className="text-muted-foreground">Frequency:</span>
                              <span className="font-medium text-right">
                                {frequencyDisplayMap[expense.frequency]}
                              </span>
                              <span className="text-muted-foreground">Adjusted:</span>
                              <span className="font-medium text-right">
                                {formatCurrency(expense.adjusted_amount)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {expense.frequency === "monthly" &&
                                "Monthly amount converted to daily rate and multiplied by days in period"}
                              {expense.frequency === "yearly" &&
                                "Yearly amount converted to daily rate and multiplied by days in period"}
                              {expense.frequency === "per_order" &&
                                `Amount multiplied by ${ordersCount} orders in period`}
                              {expense.frequency === "one_time" && "One-time expense, shown as is"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                      {expense.percentage_amount.toFixed(2)}%
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right">
                      {format(expense.createdAt, "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
