"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExpenseType } from "@/types/expenseTypes";
import { useEffect, useState } from "react";
import { useExpenseFilter } from "./expense-filter";

export type SortOption =
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

interface AdjustedExpense {
  name: string;
  type: string;
  amount: string | number;
  frequency: string;
  createdAt: Date;
  adjusted_amount: number;
  percentage_amount: number;
}

interface ExpenseTableSortMenuProps {
  expenses: AdjustedExpense[];
  onSort: (sortedExpenses: AdjustedExpense[]) => void;
}

export function ExpenseTableSortMenu({ expenses, onSort }: ExpenseTableSortMenuProps) {
  const [sortOption, setSortOption] = useState<SortOption>("most-expensive");
  const { selectedTypes } = useExpenseFilter();

  // Filter and sort expenses whenever sort option or selected types change
  const handleSort = (newSortOption?: SortOption) => {
    const option = newSortOption || sortOption;
    if (newSortOption) {
      setSortOption(newSortOption);
    }

    let result =
      selectedTypes.length === 0
        ? expenses
        : expenses.filter((expense) => selectedTypes.includes(expense.type as ExpenseType));

    switch (option) {
      case "most-expensive":
        result = result.sort((a, b) => b.adjusted_amount - a.adjusted_amount);
        break;
      case "least-expensive":
        result = result.sort((a, b) => a.adjusted_amount - b.adjusted_amount);
        break;
      case "alphabetical":
        result = result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "reverse-alphabetical":
        result = result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        result = result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "oldest":
        result = result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
    }

    onSort(result);
  };

  // Re-sort when selected types change
  useEffect(() => {
    handleSort();
  }, [selectedTypes, expenses, sortOption]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Sort by: {sortOptionLabels[sortOption]} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleSort("most-expensive")}>
          Most Expensive
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSort("least-expensive")}>
          Least Expensive
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSort("alphabetical")}>A-Z</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSort("reverse-alphabetical")}>Z-A</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSort("newest")}>Newest First</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSort("oldest")}>Oldest First</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
