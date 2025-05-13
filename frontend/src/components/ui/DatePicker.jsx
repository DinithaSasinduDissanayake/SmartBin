// frontend/src/components/ui/DatePicker.jsx
"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * DatePicker component - A custom date picker using shadcn/ui components
 * Uses the Calendar and Popover components to create a dropdown date picker
 */
export function DatePicker({ value, onChange }) {
  const [date, setDate] = React.useState(value || new Date())

  // Update the parent component when date changes
  React.useEffect(() => {
    if (onChange && date) {
      onChange(date)
    }
  }, [date, onChange])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker