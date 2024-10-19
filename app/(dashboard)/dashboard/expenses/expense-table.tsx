"use client";
import { useMemo, useState } from "react";
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

// Update the Order interface to match the new Expense structure
interface Order {
  name: string;
  type:
    | "Fixed Cost"
    | "Variable Cost"
    | "Staff"
    | "Software"
    | "Marketing"
    | "Operating Expenses"
    | "Taxes"
    | "Other";
  amount: number;
  amount_type: "dollar" | "percentage";
  dollar_amount: number;
  percentage_amount: number;
}

interface ExpenseTableProps {
  orders: Order[];
}

type SortOption = "most-expensive" | "least-expensive" | "alphabetical" | "reverse-alphabetical";

const sortOptionLabels: Record<SortOption, string> = {
  "most-expensive": "Most Expensive",
  "least-expensive": "Least Expensive",
  alphabetical: "A-Z",
  "reverse-alphabetical": "Z-A",
};

export function ExpenseTable({ orders }: ExpenseTableProps) {
  const { dateRange } = useDateRange();
  const { selectedType } = useExpenseFilter();
  const [sortOption, setSortOption] = useState<SortOption>("most-expensive");

  const adjustedOrders = useMemo(() => {
    if (!dateRange.endDate || !dateRange.startDate) return orders;

    const daysInRange = differenceInDays(dateRange.endDate, dateRange.startDate) + 1;
    const adjustmentFactor = daysInRange / 30; // Assuming original data is for 30 days

    return orders.map((order) => ({
      ...order,
      dollar_amount: order.dollar_amount * adjustmentFactor,
      percentage_amount: order.percentage_amount, // Percentage remains the same
    }));
  }, [orders, dateRange]);

  const sortedAndFilteredOrders = useMemo(() => {
    let result =
      selectedType === "All"
        ? adjustedOrders
        : adjustedOrders.filter((order) => order.type === selectedType);

    switch (sortOption) {
      case "most-expensive":
        return result.sort((a, b) => b.dollar_amount - a.dollar_amount);
      case "least-expensive":
        return result.sort((a, b) => a.dollar_amount - b.dollar_amount);
      case "alphabetical":
        return result.sort((a, b) => a.name.localeCompare(b.name));
      case "reverse-alphabetical":
        return result.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return result;
    }
  }, [adjustedOrders, selectedType, sortOption]);

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="text-right">Dollar Amount</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredOrders.map((order, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-accent/20" : ""}>
                  <TableCell>
                    <div className="font-normal">{order.name}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{order.type}</TableCell>
                  <TableCell className="text-right">${order.dollar_amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {order.percentage_amount.toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
