"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Expense } from "@/lib/db/schema/expenses";
import { formatCurrency } from "@/lib/utils";
import { ExpenseType } from "@/types/expenseTypes";
import { format } from "date-fns";
import { InfoIcon, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useExpenseFilter } from "./expense-filter";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExpenseTableFilters } from "./expense-table-filters";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { deleteExpense, editExpense } from "@/actions/expenses";
import { useUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ExpenseTableRow, ExpenseFrequency } from "./expense-table-row";

interface ExpenseTableProps {
  expenses: Expense[];
  teamId: number;
  totalRevenue: number;
  adjustedExpenses: {
    id: number;
    name: string;
    category: string;
    amount: string | number;
    frequency: ExpenseFrequency;
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
  const { user } = useUser();
  const { toast } = useToast();

  // Update sortedExpenses when initialAdjustedExpenses or selectedTypes change
  useEffect(() => {
    const filteredExpenses =
      selectedTypes.length === 0
        ? initialAdjustedExpenses
        : initialAdjustedExpenses.filter((expense) =>
            selectedTypes.includes(expense.category as ExpenseType)
          );
    setSortedExpenses(filteredExpenses);
  }, [initialAdjustedExpenses, selectedTypes]);

  const handleDelete = async (expenseId: number) => {
    if (!user?.id) return;

    try {
      const result = await deleteExpense(expenseId, user.id);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Expense deleted successfully",
          variant: "default",
        });
        // Refresh the expenses list
        setSortedExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = () => {
    // Trigger a refresh of the expenses list
    // This will be handled by the parent component through the useEffect
  };

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
            <ExpenseTableFilters expenses={initialAdjustedExpenses} onSort={setSortedExpenses} />
          </div>
        </CardHeader>
        <CardContent>
          {sortedExpenses.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              You do not have any expenses for the selected period.
            </p>
          ) : (
            <div className="relative">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead className="hidden md:table-cell">Frequency</TableHead>
                    <TableHead className="text-right">Dollar Amount</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedExpenses.map((expense, index) => (
                    <ExpenseTableRow
                      key={expense.id}
                      expense={expense}
                      index={index}
                      onDelete={handleDelete}
                      ordersCount={ordersCount}
                      userId={user?.id || 0}
                      onUpdate={handleUpdate}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
