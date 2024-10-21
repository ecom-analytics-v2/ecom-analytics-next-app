"use client";
import { useMemo, useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDateRange } from "@/components/dashboard/date-range-context";
import { useExpenseFilter } from "./expense-filter";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Expense } from "@/lib/db/schema/expenses";
import { formatCurrency } from "@/lib/utils";
import { ExpenseType } from "@/types/expenseTypes";

// Update the Order interface to match the new Expense structure

interface ExpenseTableProps {
  expenses: Expense[];
  teamId: number;
  totalRevenue: number;
}

type SortOption = "most-expensive" | "least-expensive" | "alphabetical" | "reverse-alphabetical";

const sortOptionLabels: Record<SortOption, string> = {
  "most-expensive": "Most Expensive",
  "least-expensive": "Least Expensive",
  alphabetical: "A-Z",
  "reverse-alphabetical": "Z-A",
};

/**
 * Adjusts and formats an expense amount based on a given adjustment factor.
 * @param amount - The original expense amount as a string.
 * @param adjustmentFactor - The factor to adjust the amount by.
 * @returns A formatted string representing the adjusted amount.
 */
function adjustAndFormatExpense(amount: string, adjustmentFactor: number): string {
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) return "0.00";
  const adjustedAmount = numericAmount * adjustmentFactor;
  return formatCurrency(adjustedAmount);
}

// Create a new type for adjusted expenses
type AdjustedExpense = Expense & {
  dollar_amount: string;
  percentage_amount: number;
};

/**
 * ExpenseTable component displays a table of expenses with sorting and filtering capabilities.
 * @param totalRevenue - The total revenue for the selected period.
 * @param expenses - An array of Expense objects to be displayed.
 */
export function ExpenseTable({ totalRevenue, expenses }: ExpenseTableProps) {
  const { dateRange } = useDateRange();
  const { selectedTypes } = useExpenseFilter();
  const [sortOption, setSortOption] = useState<SortOption>("most-expensive");
  const [adjustedExpenses, setAdjustedExpenses] = useState<AdjustedExpense[]>([]);

  // Effect to adjust expenses based on the selected date range
  useEffect(() => {
    if (!dateRange.endDate || !dateRange.startDate) return;

    const daysInRange = differenceInDays(dateRange.endDate, dateRange.startDate) + 1;
    const adjustmentFactor = daysInRange / 30; // Assuming original data is for 30 days

    const adjusted = expenses.map((expense): AdjustedExpense => {
      const adjustedAmount = adjustAndFormatExpense(expense.amount, adjustmentFactor);
      const numericAmount = parseFloat(adjustedAmount.replace(/[^0-9.-]+/g, ""));
      return {
        ...expense,
        dollar_amount: adjustedAmount,
        percentage_amount: (numericAmount / totalRevenue) * 100,
      };
    });

    setAdjustedExpenses(adjusted);
  }, [expenses, dateRange, totalRevenue]);

  // Memoized and sorted expenses based on selected filters and sort option
  const sortedAndFilteredExpenses = useMemo(() => {
    let result =
      selectedTypes.length === 0
        ? adjustedExpenses
        : adjustedExpenses.filter((expense) => selectedTypes.includes(expense.type as ExpenseType));

    switch (sortOption) {
      case "most-expensive":
        return result.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
      case "least-expensive":
        return result.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
      case "alphabetical":
        return result.sort((a, b) => a.name.localeCompare(b.name));
      case "reverse-alphabetical":
        return result.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return result;
    }
  }, [adjustedExpenses, selectedTypes, sortOption]);

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
            {/* Dropdown menu for sorting options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Sort by: {sortOptionLabels[sortOption]} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortOption("most-expensive")}>
                  Most Expensive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("least-expensive")}>
                  Least Expensive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("alphabetical")}>
                  A-Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOption("reverse-alphabetical")}>
                  Z-A
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {sortedAndFilteredExpenses.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              You do not have any expenses for the selected period.
            </p>
          ) : (
            // Table displaying the sorted and filtered expenses
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-right">Dollar Amount</TableHead>
                  <TableHead className="text-right">Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredExpenses.map((expense, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? "bg-accent/20" : ""}>
                    <TableCell>
                      <div className="font-normal">{expense.name}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{expense.type}</TableCell>
                    <TableCell className="text-right">{expense.dollar_amount}</TableCell>
                    <TableCell className="text-right">
                      {expense.percentage_amount.toFixed(2)}%
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
