"use client";
import { useState, createContext, useContext, ReactNode } from "react";
import { ListFilter, Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DatePickerWithRange from "@/components/dashboard/date-range-picker";

// Define the order data structure
interface Expense {
  name: string;
  type: "Fixed Cost" | "Variable Cost" | "Staff" | "Software" | "Marketing" | "Operating Expenses" | "Taxes" | "Other";
  amount: number;
  amount_type: "dollar" | "percentage";
}

// Define the context type
type ExpenseFilterContextType = {
  selectedType: Expense['type'] | 'All';
  setSelectedType: (type: Expense['type'] | 'All') => void;
};

// Create the context
const ExpenseFilterContext = createContext<ExpenseFilterContextType | undefined>(undefined);

// Create a provider component
export function ExpenseFilterProvider({ children }: { children: ReactNode }) {
  const [selectedType, setSelectedType] = useState<Expense['type'] | 'All'>('All');

  return (
    <ExpenseFilterContext.Provider value={{ selectedType, setSelectedType }}>
      {children}
    </ExpenseFilterContext.Provider>
  );
}

// Create a custom hook to use the context
export function useExpenseFilter() {
  const context = useContext(ExpenseFilterContext);
  if (context === undefined) {
    throw new Error('useExpenseFilter must be used within an ExpenseFilterProvider');
  }
  return context;
}

export function ExpenseFilter() {
  const { selectedType, setSelectedType } = useExpenseFilter();

  const expenseTypes: (Expense['type'] | 'All')[] = [
    "All",
    "Fixed Cost",
    "Variable Cost",
    "Staff",
    "Software",
    "Marketing",
    "Operating Expenses",
    "Taxes",
    "Other"
  ];


    return (
        <div className="flex justify-between w-full items-center py-6">
          <div className="flex items-center gap-x-2">
            <DatePickerWithRange />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ListFilter className="mr-2 h-4 w-4" />
                  {selectedType === 'All' ? 'Filter' : `Filter: ${selectedType}`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {expenseTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onSelect={() => setSelectedType(type)}
                  >
                    {type}
                    {selectedType === type && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="ml-auto">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Driver
            </Button>
          </div>
        </div>
  
    )
}
