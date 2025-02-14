export type ExpenseType =
  | "3PL"
  | "Bookkeeper / Accountant"
  | "Donations"
  | "Duties"
  | "Equipment & Leases"
  | "Insurance"
  | "Licensing"
  | "Marketing"
  | "Money Fees"
  | "Office Expenses"
  | "Other"
  | "Rent & Utilies"
  | "Software"
  | "Sub-contractor / Consultants"
  | "Taxes"
  | "Training"
  | "Travel"
  | "Wages";

export type AmountType = "dollar" | "percentage";

export interface Expense {
  name: string;
  category: ExpenseType;
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
