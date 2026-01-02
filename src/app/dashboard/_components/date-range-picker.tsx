"use client"

import * as React from "react"
import { format, subDays, startOfMonth, startOfQuarter, startOfYear } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type DateRangePickerProps = {
    onUpdate: (range: DateRange) => void;
    className?: string;
    defaultRange?: DateRange;
    defaultPreset?: string;
}

const presetOptions = [
    { value: "last_7_days", label: "Last 7 days" },
    { value: "last_30_days", label: "Last 30 days" },
    { value: "this_month", label: "This month" },
    { value: "this_quarter", label: "This quarter" },
    { value: "this_year", label: "This year" },
    { value: "last_year", label: "Last year" },
    { value: "custom", label: "Custom" },
]

export function DateRangePicker({ onUpdate, className, defaultRange, defaultPreset = "this_month" }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(defaultRange);
  const [preset, setPreset] = React.useState<string>(defaultPreset);

  React.useEffect(() => {
    if (!date) {
        handlePresetChange(defaultPreset);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if(newDate?.from && newDate?.to) {
        onUpdate(newDate);
    }
  }

  const handlePresetChange = (value: string) => {
    setPreset(value);
    if (value === "custom") {
        return;
    }
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (value) {
        case "last_7_days":
            from = subDays(now, 6);
            break;
        case "last_30_days":
            from = subDays(now, 29);
            break;
        case "this_month":
            from = startOfMonth(now);
            break;
        case "this_quarter":
            from = startOfQuarter(now);
            break;
        case "this_year":
            from = startOfYear(now);
            break;
        case "last_year": {
          const lastYear = now.getFullYear() - 1;
          from = new Date(lastYear, 0, 1);
          to = new Date(lastYear, 11, 31);
          break;
        }
        default:
            return;
    }
    const newRange = { from, to };
    setDate(newRange);
    onUpdate(newRange);
  }

  const handleCustomDateChange = (field: 'from' | 'to', value: string) => {
    const newDate = value ? new Date(value) : undefined;
    const updatedRange = { ...date, [field]: newDate };
    
    // To avoid timezone issues, parse the date string as UTC
    if (newDate) {
        const [year, month, day] = value.split('-').map(Number);
        updatedRange[field] = new Date(Date.UTC(year, month - 1, day));
    }

    if (updatedRange.from && updatedRange.to && updatedRange.from > updatedRange.to) {
        if(field === 'from') updatedRange.to = updatedRange.from;
        else updatedRange.from = updatedRange.to;
    }

    setDate(updatedRange);
    if (updatedRange.from && updatedRange.to) {
        onUpdate(updatedRange);
    }
    setPreset("custom");
  }

  return (
    <div className={cn("grid gap-2", className)}>
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <Select onValueChange={handlePresetChange} value={preset}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                    {presetOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="flex w-full items-center gap-2">
                <div className="grid w-full gap-1.5">
                    <Label htmlFor="start-date" className="sr-only">Start Date</Label>
                    <Input 
                        type="date"
                        id="start-date"
                        value={date?.from ? format(date.from, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleCustomDateChange('from', e.target.value)}
                        className="w-full"
                    />
                </div>
                 <span className="text-muted-foreground">-</span>
                 <div className="grid w-full gap-1.5">
                    <Label htmlFor="end-date" className="sr-only">End Date</Label>
                    <Input 
                        type="date"
                        id="end-date"
                        value={date?.to ? format(date.to, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleCustomDateChange('to', e.target.value)}
                        className="w-full"
                    />
                 </div>
            </div>
        </div>
    </div>
  )
}
