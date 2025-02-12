"use client";

import {
  endOfMonth,
  endOfYear,
  format,
  setYear,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

/**
 * List of preset date ranges (Today, Yesterday, Last 7 days, etc.)
 * Each preset has a label and a function to calculate its date range
 */
const presetOptions = [
  {
    label: "Today",
    getValue: () => ({
      startDate: new Date(),
      endDate: new Date(),
    }),
  },
  {
    label: "Yesterday",
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return { startDate: yesterday, endDate: yesterday };
    },
  },
  {
    label: "Last 7 days",
    getValue: () => ({
      startDate: subDays(new Date(), 6),
      endDate: new Date(),
    }),
  },
  {
    label: "Last 30 days",
    getValue: () => ({
      startDate: subDays(new Date(), 29),
      endDate: new Date(),
    }),
  },
  {
    label: "Last 90 days",
    getValue: () => ({
      startDate: subDays(new Date(), 89),
      endDate: new Date(),
    }),
  },
  {
    label: "Last 365 days",
    getValue: () => ({
      startDate: subDays(new Date(), 364),
      endDate: new Date(),
    }),
  },
  {
    label: "Last month",
    getValue: () => {
      const today = new Date();
      const lastMonth = subMonths(today, 1);
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth),
      };
    },
  },
  {
    label: "Last 12 months",
    getValue: () => ({
      startDate: subMonths(new Date(), 12),
      endDate: new Date(),
    }),
  },
  {
    label: "Last year",
    getValue: () => {
      const today = new Date();
      const lastYear = subYears(today, 1);
      return {
        startDate: startOfYear(lastYear),
        endDate: endOfYear(lastYear),
      };
    },
  },
  {
    label: "Week to date",
    getValue: () => ({
      startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
      endDate: new Date(),
    }),
  },
  {
    label: "Month to date",
    getValue: () => ({
      startDate: startOfMonth(new Date()),
      endDate: new Date(),
    }),
  },
  {
    label: "Quarter to date",
    getValue: () => ({
      startDate: startOfQuarter(new Date()),
      endDate: new Date(),
    }),
  },
  {
    label: "Year to date",
    getValue: () => {
      const today = new Date();
      return {
        startDate: setYear(today, today.getFullYear() - 1),
        endDate: today,
      };
    },
  },
];

/**
 * Checks if given dates match any preset date range
 * Returns the preset name or "Custom" if no match found
 */
function findMatchingPreset(startDate: Date, endDate: Date) {
  // Helper to compare dates without time
  const isSameDate = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  for (const preset of presetOptions) {
    const presetDates = preset.getValue();
    if (!presetDates.startDate || !presetDates.endDate) continue;

    if (isSameDate(startDate, presetDates.startDate) && isSameDate(endDate, presetDates.endDate)) {
      return preset.label;
    }
  }

  return "Custom";
}

/**
 * Date range picker component with presets and calendar selection
 * Shows a button that opens a popover with:
 * - List of preset ranges on the left
 * - Calendar picker on the right
 * Selected dates are saved to the database via TRPC
 */
export default function DatePickerWithRange({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <React.Suspense fallback={<DatePickerSkeleton />}>
      <DatePickerContent className={className} />
    </React.Suspense>
  );
}

// Move the main component logic into a new component
function DatePickerContent({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [label, setLabel] = React.useState<string>();

  const {
    data: dateFilter,
    isLoading,
    refetch: refetchDateFilter,
  } = api.filterRouter.getDateFilter.useQuery();
  const { mutate: updateDateFilter } = api.filterRouter.updateDateFilter.useMutation({
    onSuccess: () => {
      refetchDateFilter();
    },
  });

  React.useEffect(() => {
    if (dateFilter?.startDate && dateFilter?.endDate) {
      const matchedLabel = findMatchingPreset(
        new Date(dateFilter.startDate),
        new Date(dateFilter.endDate)
      );
      setLabel(matchedLabel);
    }
  }, [dateFilter]);

  // Show skeleton while loading
  if (isLoading) {
    return <DatePickerSkeleton />;
  }

  // Updates dates when a preset is clicked
  const handlePresetChange = (preset: (typeof presetOptions)[number]) => {
    const newDate = preset.getValue();
    if (!newDate.startDate || !newDate.endDate) return;

    updateDateFilter({
      startDate: newDate.startDate.toISOString(),
      endDate: newDate.endDate.toISOString(),
    });
    setLabel(preset.label);
  };

  // Updates dates when calendar selection changes
  const handleCustomDateChange = (newDate: DateRange | undefined) => {
    if (newDate?.from && newDate?.to) {
      updateDateFilter({
        startDate: newDate.from.toISOString(),
        endDate: newDate.to.toISOString(),
      });
      setLabel("Custom");
    }
  };

  const dateRangeForCalendar: DateRange | undefined = dateFilter
    ? {
        from: dateFilter.startDate ? dateFilter.startDate : undefined,
        to: dateFilter.endDate ? dateFilter.endDate : undefined,
      }
    : undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button id="date" variant="card" className={cn("justify-start text-left font-normal")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label === "Custom" ? (
              dateFilter?.endDate ? (
                <>
                  {format(new Date(dateFilter.startDate), "LLL dd, y")} -{" "}
                  {format(new Date(dateFilter.endDate), "LLL dd, y")}
                </>
              ) : (
                dateFilter?.startDate && format(new Date(dateFilter.startDate), "LLL dd, y")
              )
            ) : (
              label || <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex h-[380px]">
            <div className="w-[200px] border-r overflow-y-auto p-2 space-y-1">
              {presetOptions.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  className={`w-full justify-start px-2 py-1.5 font-normal text-sm ${
                    label === preset.label ? "bg-accent" : ""
                  }`}
                  onClick={() => handlePresetChange(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="p-3 flex-1">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateFilter?.startDate ? new Date(dateFilter.startDate) : new Date()}
                selected={dateRangeForCalendar}
                onSelect={handleCustomDateChange}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DatePickerSkeleton() {
  return (
    <div className="w-[200px] ">
      <div className="flex w-full items-center justify-start rounded-md border bg-card px-3 py-2 text-sm font-medium ring-offset-background">
        <div className="mr-2 h-4 w-4 rounded-sm bg-muted animate-pulse" />
        <div className="h-4 w-[120px] rounded-sm bg-muted animate-pulse" />
      </div>
    </div>
  );
}
