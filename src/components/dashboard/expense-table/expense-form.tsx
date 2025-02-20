"use client";

import { addExpense } from "@/actions/expenses";
import { getUserWithTeam } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { insertExpenseSchema, NewExpense } from "@/lib/db/schema/expenses";
import { cn } from "@/lib/utils";
import { ExpenseType } from "@/types/expenseTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, DollarSign, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

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

export function ExpenseForm() {
  const { user } = useUser();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const form = useForm<NewExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      name: "",
      amount: 0,
      amount_type: "dollar",
      notes: "",
      frequency: "monthly",
      category: "",
      transaction_date: undefined,
      teamId: user?.activeTeamId || 0,
      createdBy: user?.id || 0,
    },
  });

  async function onSubmit(data: NewExpense) {
    if (!user?.id || !user?.activeTeamId) {
      console.error("User or team not found");
      return;
    }

    const expenseData = {
      ...data,
      teamId: user.activeTeamId,
      createdBy: user.id,
    };

    try {
      await addExpense(expenseData, user.id);
      toast({
        title: "Expense added successfully",
        variant: "default",
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to add expense:", error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
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
              name="transaction_date"
              render={({ field }) => (
                <FormItem
                  className={cn(form.watch("frequency") === "one_time" ? "block" : "hidden")}
                >
                  <FormLabel>Transaction Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value as Date}
                        onSelect={(date: Date | undefined) => field.onChange(date)}
                        disabled={(date: Date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-l-md border-r",
                              form.watch("frequency") === "per_order"
                                ? "cursor-pointer hover:bg-muted hover:text-primary group transition-colors"
                                : "cursor-default"
                            )}
                            disabled={form.watch("frequency") !== "per_order"}
                          >
                            <div className="flex items-center justify-center w-full">
                              {form.watch("amount_type") === "percentage" ? (
                                <span className="text-sm font-semibold">%</span>
                              ) : (
                                <DollarSign className="h-4 w-4" />
                              )}
                            </div>
                          </Button>
                        </PopoverTrigger>
                        {form.watch("frequency") === "per_order" && (
                          <PopoverContent side="bottom" align="start" className="w-[200px] p-0">
                            <Command>
                              <CommandList>
                                <CommandGroup>
                                  <CommandItem
                                    onSelect={() => form.setValue("amount_type", "dollar")}
                                    className="flex items-center gap-2"
                                  >
                                    <DollarSign className="h-4 w-4" />
                                    <span>Dollar Amount</span>
                                    {form.watch("amount_type") === "dollar" && (
                                      <Check className="ml-auto h-4 w-4" />
                                    )}
                                  </CommandItem>
                                  <CommandItem
                                    onSelect={() => form.setValue("amount_type", "percentage")}
                                    className="flex items-center gap-2"
                                  >
                                    <span className="text-sm font-semibold">%</span>
                                    <span>Percentage</span>
                                    {form.watch("amount_type") === "percentage" && (
                                      <Check className="ml-auto h-4 w-4" />
                                    )}
                                  </CommandItem>
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        )}
                      </Popover>
                      <Input
                        type="number"
                        inputMode="decimal"
                        className="pl-10"
                        placeholder="0"
                        step="0.01"
                        min="0"
                        {...field}
                        value={field.value === 0 ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.valueAsNumber;
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                        onBlur={(e) => {
                          const value = e.target.valueAsNumber;
                          field.onChange(isNaN(value) ? 0 : value);
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? expenseTypes.find((type) => type === field.value)
                            : "Choose category"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search category..." className="w-full" />
                        <CommandList>
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup>
                            {expenseTypes.map((type) => (
                              <CommandItem
                                key={type}
                                value={type}
                                onSelect={(currentValue) => {
                                  field.onChange(currentValue);
                                  setCategoryOpen(false);
                                }}
                                className="flex items-center gap-2"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 flex-shrink-0",
                                    field.value === type ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {type}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
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
