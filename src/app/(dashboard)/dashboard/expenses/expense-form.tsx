"use client";

import { addExpense } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUser } from "@/lib/auth";
import { NewExpense } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { ExpenseType } from "@/types/expenseTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, DollarSign, Info } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

export function ExpenseForm() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const form = useForm<NewExpense>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.enum(expenseTypes as [string, ...string[]]),
        amount: z.number().min(0, "Amount must be a positive number"),
        frequency: z.enum(["monthly", "yearly", "per_order", "one_time"]),
        notes: z.string().optional(),
      })
    ),
  });

  async function onSubmit(data: NewExpense) {
    if (!user) {
      console.error("User not found");
      return;
    }
    addExpense(data, user.id);
    setOpen(false);
  }

  function formatAmount(value: string): string {
    const numericValue = parseFloat(value.replace(/[^\d.]/g, ""));
    return isNaN(numericValue) ? "0.00" : numericValue.toFixed(2);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>Add Expense</Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px]" side="left" align="start">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="text"
                        inputMode="decimal"
                        className="pl-9"
                        {...field}
                        defaultValue={field.value}
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d.]/g, "");
                          field.onChange(value === "" ? 0 : parseFloat(value) || 0);
                        }}
                        onBlur={(e) => {
                          const formatted = formatAmount(e.target.value);
                          field.onChange(parseFloat(formatted));
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="per_order">Per Order</SelectItem>
                      <SelectItem value="one_time">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <FormLabel>Date (Optional)</FormLabel>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="h-4 w-4 p-0">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">Date info</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>If you'd like the expense to come through on a certain date</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={form.watch("frequency") === "per_order"}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}
