import type { Expense, ExpenseFilterContextType } from "@//types/expenseTypes";
import { createContext, ReactNode, useContext, useState } from "react";

// Create the context

const ExpenseFilterContext = createContext<ExpenseFilterContextType | undefined>(undefined);

// Create a provider component
export function ExpenseFilterProvider({ children }: { children: ReactNode }) {
  const [selectedTypes, setSelectedTypes] = useState<Expense["type"][]>([]);

  return (
    <ExpenseFilterContext.Provider value={{ selectedTypes, setSelectedTypes }}>
      {children}
    </ExpenseFilterContext.Provider>
  );
}
// Create a custom hook to use the context
export function useExpenseFilter() {
  const context = useContext(ExpenseFilterContext);
  if (context === undefined) {
    throw new Error("useExpenseFilter must be used within an ExpenseFilterProvider");
  }
  return context;
}
