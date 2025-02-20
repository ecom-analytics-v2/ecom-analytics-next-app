"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { InfoIcon, Pencil, Save, Trash2, X, Check } from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ExpenseType } from "@/types/expenseTypes";
import { editExpense } from "@/actions/expenses";
import { useToast } from "@/hooks/use-toast";

export type ExpenseFrequency = "monthly" | "yearly" | "per_order" | "one_time";

interface ExpenseTableRowProps {
  expense: {
    id: number;
    name: string;
    category: string;
    amount: string | number;
    frequency: ExpenseFrequency;
    createdAt: Date;
    adjusted_amount: number;
    percentage_amount: number;
  };
  index: number;
  onDelete: (id: number) => Promise<void>;
  ordersCount: number;
  userId: number;
  onUpdate: () => void;
}

const frequencyDisplayMap: Record<ExpenseFrequency, string> = {
  monthly: "Monthly",
  yearly: "Yearly",
  per_order: "Per Order",
  one_time: "One Time",
};

const expenseTypes: ExpenseType[] = [
  "3PL",
  "Bookkeeper / Accountant",
  "Donations",
  "Duties",
  "Equipment & Leases",
  "Insurance",
  "Licensing",
  "Marketing",
  "Money Fees",
  "Office Expenses",
  "Other",
  "Rent & Utilities",
  "Software",
  "Sub-contractor / Consultants",
  "Taxes",
  "Training",
  "Travel",
  "Wages",
];

export function ExpenseTableRow({
  expense,
  index,
  onDelete,
  ordersCount,
  userId,
  onUpdate,
}: ExpenseTableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExpense, setEditedExpense] = useState(expense);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedExpense(expense);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const result = await editExpense(expense.id, userId, {
        name: editedExpense.name,
        category: editedExpense.category,
        amount: Number(editedExpense.amount),
        frequency: editedExpense.frequency,
      });

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Expense updated successfully",
          variant: "default",
        });
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const rowContent = (
    <TableRow className={index % 2 === 0 ? "bg-accent/20" : ""} data-expense-id={expense.id}>
      <TableCell>
        {isEditing ? (
          <Input
            value={editedExpense.name}
            onChange={(e) => setEditedExpense({ ...editedExpense, name: e.target.value })}
            className="w-full"
          />
        ) : (
          <div className="font-normal">{expense.name}</div>
        )}
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        {isEditing ? (
          <Select
            value={editedExpense.category}
            onValueChange={(value) => setEditedExpense({ ...editedExpense, category: value })}
          >
            <SelectTrigger>
              <SelectValue>{editedExpense.category}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {expenseTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          expense.category
        )}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {isEditing ? (
          <Select
            value={editedExpense.frequency}
            onValueChange={(value: ExpenseFrequency) =>
              setEditedExpense({ ...editedExpense, frequency: value })
            }
          >
            <SelectTrigger>
              <SelectValue>{frequencyDisplayMap[editedExpense.frequency]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(frequencyDisplayMap).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          frequencyDisplayMap[expense.frequency]
        )}
      </TableCell>
      <TableCell className="text-right">
        {isEditing ? (
          <Input
            type="number"
            value={editedExpense.amount}
            onChange={(e) =>
              setEditedExpense({ ...editedExpense, amount: parseFloat(e.target.value) || 0 })
            }
            className="w-full text-right"
          />
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-end gap-1">
                  {formatCurrency(expense.adjusted_amount)}
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="space-y-2 p-4 max-w-xs">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Original:</span>
                  <span className="font-medium text-right">
                    {formatCurrency(parseFloat(expense.amount.toString()))}
                  </span>
                  <span className="text-muted-foreground">Frequency:</span>
                  <span className="font-medium text-right">
                    {frequencyDisplayMap[expense.frequency]}
                  </span>
                  <span className="text-muted-foreground">Adjusted:</span>
                  <span className="font-medium text-right">
                    {formatCurrency(expense.adjusted_amount)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {expense.frequency === "monthly" &&
                    "Monthly amount converted to daily rate and multiplied by days in period"}
                  {expense.frequency === "yearly" &&
                    "Yearly amount converted to daily rate and multiplied by days in period"}
                  {expense.frequency === "per_order" &&
                    `Amount multiplied by ${ordersCount} orders in period`}
                  {expense.frequency === "one_time" && "One-time expense, shown as is"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>
      <TableCell className="text-right">{expense.percentage_amount.toFixed(2)}%</TableCell>
      <TableCell className="hidden md:table-cell text-right">
        {format(expense.createdAt, "MMM d, yyyy")}
      </TableCell>
      {isEditing && (
        <TableCell className="w-24">
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={isSaving}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{rowContent}</ContextMenuTrigger>
      <ContextMenuContent>
        {!isEditing && (
          <>
            <ContextMenuItem onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onDelete(expense.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
