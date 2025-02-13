"use client";
import { Check, ListFilter } from "lucide-react";
import { createContext, ReactNode, useContext, useState } from "react";

import DatePickerWithRange from "@/components/dashboard/common/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExpenseFilterContextType, ExpenseType } from "@/types/expenseTypes";
import { ExpenseForm } from "./expense-form";

/**
 * Context for managing expense filter state.
 */
const ExpenseFilterContext = createContext<ExpenseFilterContextType>({
  selectedTypes: [],
  setSelectedTypes: () => {},
});

/**
 * Provider component for the ExpenseFilterContext.
 * @param {Object} props - The component props.
 * @param {ReactNode} props.children - The child components.
 */
export function ExpenseFilterProvider({ children }: { children: ReactNode }) {
  const [selectedTypes, setSelectedTypes] = useState<ExpenseType[]>([]);

  return (
    <ExpenseFilterContext.Provider value={{ selectedTypes, setSelectedTypes }}>
      {children}
    </ExpenseFilterContext.Provider>
  );
}

/**
 * Custom hook to access the ExpenseFilterContext.
 * @returns {ExpenseFilterContextType} The expense filter context value.
 */
export function useExpenseFilter() {
  return useContext(ExpenseFilterContext);
}

/**
 * ExpenseFilter component for filtering expenses by type and date range.
 */
export function ExpenseFilter() {
  const { selectedTypes, setSelectedTypes } = useExpenseFilter();

  const expenseTypes: ExpenseType[] = [
    "Fixed Cost",
    "Variable Cost",
    "Staff",
    "Software",
    "Marketing",
    "Operating Expenses",
    "Taxes",
    "Other",
  ];

  /**
   * Toggles the selection state of an expense type.
   * @param {ExpenseType} type - The expense type to toggle.
   */
  const toggleType = (type: ExpenseType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  /**
   * Toggles the selection of all expense types.
   */
  const toggleAll = () => {
    setSelectedTypes((prev) => (prev.length === expenseTypes.length ? [] : [...expenseTypes]));
  };

  /**
   * Generates the text for the filter button based on selected types.
   * @returns {string} The filter button text.
   */
  const getFilterButtonText = () => {
    if (selectedTypes.length === 0 || selectedTypes.length === expenseTypes.length)
      return "Filter: All";
    if (selectedTypes.length === 1) return `Filter: ${selectedTypes[0]}`;
    return "Filter: Custom";
  };

  return (
    <div className="flex justify-between w-full items-center py-6">
      <div className="flex items-center gap-x-2">
        <DatePickerWithRange />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="mr-2 h-4 w-4" />
              {getFilterButtonText()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={toggleAll}>
              All
              {(selectedTypes.length === 0 || selectedTypes.length === expenseTypes.length) && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {expenseTypes.map((type) => (
              <DropdownMenuItem key={type} onSelect={() => toggleType(type)}>
                {type}
                {selectedTypes.includes(type) && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="ml-auto">
        <ExpenseForm />
      </div>
    </div>
  );
}
