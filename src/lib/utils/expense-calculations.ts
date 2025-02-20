import { Expense } from "@/lib/db/schema/expenses";
import { differenceInDays } from "date-fns";

interface AdjustedExpense extends Expense {
  adjusted_amount: number;
  percentage_amount: number;
}

interface CalculateAdjustedAmountParams {
  expense: Expense;
  startDate: Date;
  endDate: Date;
  ordersInPeriod: number;
}

/**
 * Calculates the adjusted amount for an expense based on its frequency and the selected date range
 */
export function calculateAdjustedAmount({
  expense,
  startDate,
  endDate,
  ordersInPeriod,
}: CalculateAdjustedAmountParams): number {
  // Ensure amount is a valid number
  const numericAmount = Number(expense.amount) || 0;
  const daysInPeriod = differenceInDays(endDate, startDate) + 1; // +1 to include both start and end dates

  try {
    switch (expense.frequency) {
      case "monthly": {
        // Convert monthly amount to daily rate and multiply by days in period
        const dailyRate = (numericAmount * 12) / 365;
        return dailyRate * daysInPeriod;
      }
      case "yearly": {
        // Convert yearly amount to daily rate and multiply by days in period
        const dailyRate = numericAmount / 365;
        return dailyRate * daysInPeriod;
      }
      case "per_order":
        // Multiply by actual number of orders in the period
        return numericAmount * ordersInPeriod;
      case "one_time":
        // One-time expenses remain as is if they fall within the period
        return numericAmount;
      default:
        return numericAmount;
    }
  } catch (error) {
    console.error("Error calculating adjusted amount:", error);
    return numericAmount;
  }
}

/**
 * Calculates adjusted expenses with their percentage of total
 */
export function calculateAdjustedExpenses(
  expenses: Expense[],
  startDate: Date,
  endDate: Date,
  ordersInPeriod: number
): AdjustedExpense[] {
  // Calculate adjusted amounts for all expenses
  const expensesWithAdjustedAmounts = expenses.map((expense) => ({
    ...expense,
    adjusted_amount: calculateAdjustedAmount({
      expense,
      startDate,
      endDate,
      ordersInPeriod,
    }),
  }));

  // Calculate total adjusted expenses (ensure it's not zero to avoid division by zero)
  const totalAdjustedExpenses = Math.max(
    0.01,
    expensesWithAdjustedAmounts.reduce((sum, expense) => sum + expense.adjusted_amount, 0)
  );

  // Calculate percentage for each expense
  return expensesWithAdjustedAmounts.map((expense) => ({
    ...expense,
    percentage_amount: (expense.adjusted_amount / totalAdjustedExpenses) * 100,
  }));
}
