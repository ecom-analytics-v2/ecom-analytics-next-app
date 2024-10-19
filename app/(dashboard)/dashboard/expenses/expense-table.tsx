"use client";

import { useState, useMemo } from "react";
import { differenceInDays } from "date-fns";
import {
  ListFilter,
  File,
  Check,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import DatePickerWithRange from "@/components/dashboard/date-range-picker";
import { useDateRange } from "@/components/dashboard/date-range-context";
import { useExpenseFilter } from './expense-filter';

// Update the Order interface to match the new Expense structure
interface Order {
  name: string;
  type: "Fixed Cost" | "Variable Cost" | "Staff" | "Software" | "Marketing" | "Operating Expenses" | "Taxes" | "Other";
  amount: number;
  amount_type: "dollar" | "percentage";
  dollar_amount: number;
  percentage_amount: number;
}

interface ExpenseTableProps {
  orders: Order[];
}

export function ExpenseTable({ orders }: ExpenseTableProps) {
    const { dateRange } = useDateRange();
  const { selectedType } = useExpenseFilter();

  const adjustedOrders = useMemo(() => {
    if (!dateRange.endDate || !dateRange.startDate) return orders;

    const daysInRange = differenceInDays(dateRange.endDate, dateRange.startDate) + 1;
    const adjustmentFactor = daysInRange / 30; // Assuming original data is for 30 days

    return orders.map(order => ({
      ...order,
      dollar_amount: order.dollar_amount * adjustmentFactor,
      percentage_amount: order.percentage_amount // Percentage remains the same
    }));
  }, [orders, dateRange]);

  const filteredOrders = selectedType === 'All' 
    ? adjustedOrders 
    : adjustedOrders.filter(order => order.type === selectedType);

  const expenseTypes: (Order['type'] | 'All')[] = [
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
    <div>
      <Card>
        <CardHeader className="px-7">
          <CardTitle>Expenses</CardTitle>
          <CardDescription>
            Breakdown of your business expenses for the selected period.
          </CardDescription>
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
              {filteredOrders.map((order, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-accent/20" : ""}>
                  <TableCell>
                    <div className="font-normal">{order.name}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.type}
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.dollar_amount.toFixed(2)}
                  </TableCell>
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
  )
}
