export type ExpenseType =
  | "Fixed Cost"
  | "Variable Cost"
  | "Staff"
  | "Software"
  | "Marketing"
  | "Operating Expenses"
  | "Taxes"
  | "Other";

export type AmountType = "dollar" | "percentage";

export interface Expense {
  name: string;
  type: ExpenseType;
  amount: number;
  amount_type: AmountType;
}

export interface ExpenseFilterContextType {
  selectedTypes: ExpenseType[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<ExpenseType[]>>;
}

export type ChartDataPoint = {
  [key in ExpenseType]: number;
} & {
  date: string;
};
