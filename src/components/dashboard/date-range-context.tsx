"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { subDays } from "date-fns"

interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    label: "Last 30 days"
  });

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
}
