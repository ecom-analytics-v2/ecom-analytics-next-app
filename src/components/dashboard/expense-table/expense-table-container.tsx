import { calculateAdjustedExpenses } from "@/lib/utils/expense-calculations";
import { ExpenseTable } from "./expense-table";
import { Expense } from "@/lib/db/schema/expenses";

interface ShopifyOrder {
  id: number;
  shopify_gid: string;
  total_amount: number;
  shopify_account_id: number;
  created_at: string;
}

interface ExpenseTableContainerProps {
  expenses: Expense[];
  teamId: number;
  totalRevenue: number;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  orders: ShopifyOrder[];
}

export function ExpenseTableContainer({
  expenses,
  teamId,
  totalRevenue,
  dateRange,
  orders,
}: ExpenseTableContainerProps) {
  // Calculate adjusted expenses with the actual orders count
  const adjustedExpenses = calculateAdjustedExpenses(
    expenses,
    dateRange.startDate,
    dateRange.endDate,
    orders.length
  );

  // Convert createdAt strings to Date objects
  const formattedAdjustedExpenses = adjustedExpenses.map((expense) => ({
    ...expense,
    createdAt: new Date(expense.createdAt),
  }));

  return (
    <ExpenseTable
      expenses={expenses}
      teamId={teamId}
      totalRevenue={totalRevenue}
      adjustedExpenses={formattedAdjustedExpenses}
      ordersCount={orders.length}
    />
  );
}
