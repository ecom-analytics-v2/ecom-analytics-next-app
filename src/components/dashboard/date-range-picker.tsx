"use client"

import * as React from "react"
import { CalendarIcon, ArrowRight } from "lucide-react"
import { addDays, subDays, startOfWeek, startOfMonth, startOfQuarter, startOfYear, format, subMonths, subYears, endOfMonth, endOfYear, setYear, parse } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { useDateRange } from "./date-range-context"

const presetOptions = [
  { label: "Today", getValue: () => ({ startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }) },
  { label: "Yesterday", getValue: () => { const yesterday = subDays(new Date(), 1).toISOString().split('T')[0]; return { startDate: yesterday, endDate: yesterday }; } },
  { label: "Last 7 days", getValue: () => ({ startDate: subDays(new Date(), 6).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }) },
  { label: "Last 30 days", getValue: () => ({ startDate: subDays(new Date(), 29).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }) },
  { label: "Last 90 days", getValue: () => ({ startDate: subDays(new Date(), 89).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }) },
  { label: "Last 365 days", getValue: () => ({ startDate: subDays(new Date(), 364).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }) },
  { label: "Last month", getValue: () => {
    const today = new Date();
    const lastMonth = subMonths(today, 1);
    return { startDate: startOfMonth(lastMonth).toISOString().split('T')[0], endDate: endOfMonth(lastMonth).toISOString().split('T')[0] };
  }},
  { label: "Last 12 months", getValue: () => ({ startDate: subMonths(new Date(), 12).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }) },
  { label: "Last year", getValue: () => {
    const today = new Date();
    const lastYear = subYears(today, 1);
    return { startDate: startOfYear(lastYear).toISOString().split('T')[0], endDate: endOfYear(lastYear).toISOString().split('T')[0] };
  }},
  { label: "Week to date", getValue: () => ({ startDate: startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }) },
  { label: "Month to date", getValue: () => ({ startDate: startOfMonth(new Date()).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }) },
  { label: "Quarter to date", getValue: () => ({ startDate: startOfQuarter(new Date()).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }) },
  { label: "Year to date", getValue: () => {
    const today = new Date();
    return { startDate: setYear(today, today.getFullYear() - 1).toISOString().split('T')[0], endDate: today.toISOString().split('T')[0] };
  }},
]

export default function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const { dateRange, setDateRange } = useDateRange();
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const handlePresetChange = (preset: typeof presetOptions[number]) => {
    const newDate = preset.getValue()
    setDateRange({ ...newDate, label: preset.label })
  }

  const handleCustomDateChange = (newDate: DateRange | undefined) => {
    if (newDate?.from && newDate?.to) {
      setDateRange({
        startDate: newDate.from.toISOString().split('T')[0],
        endDate: newDate.to ? newDate.to.toISOString().split('T')[0] : newDate.from.toISOString().split('T')[0],
        label: "Custom"
      })
    }
  }

  const dateRangeForCalendar: DateRange | undefined = dateRange.startDate
    ? {
        from: new Date(dateRange.startDate),
        to: dateRange.endDate ? new Date(dateRange.endDate) : undefined
      }
    : undefined

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              " justify-start text-left font-normal",
              !dateRange.startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.label === "Custom" ? (
              dateRange.endDate ? (
                <>
                  {format(new Date(dateRange.startDate), "LLL dd, y")} -{" "}
                  {format(new Date(dateRange.endDate), "LLL dd, y")}
                </>
              ) : (
                format(new Date(dateRange.startDate), "LLL dd, y")
              )
            ) : (
              dateRange.label || <span>Pick a date</span>
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
                  className={`w-full justify-start px-2 py-1.5 font-normal text-sm ${dateRange.label === preset.label ? 'bg-accent' : ''}`}
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
                defaultMonth={dateRange.startDate ? new Date(dateRange.startDate) : new Date()}
                selected={dateRangeForCalendar}
                onSelect={handleCustomDateChange}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
