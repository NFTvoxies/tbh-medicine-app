'use client'

import { useState } from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/**
 * DatePicker — a Popover + Calendar date picker that hands back an
 * ISO date string ("YYYY-MM-DD") via onChange, compatible with
 * react-hook-form's setValue.
 *
 * Props:
 *   value       string | null   ISO date string ("YYYY-MM-DD")
 *   onChange    (value: string | null) => void
 *   placeholder string          shown when no date selected
 *   clearable   boolean         show ✕ to clear (default true)
 *   disabled    boolean
 *   className   string
 *   fromYear    number          for the year/month navigation (default 2000)
 *   toYear      number          (default current year + 10)
 */
export function DatePicker({
    value,
    onChange,
    placeholder = 'Pick a date',
    clearable = true,
    disabled = false,
    className,
    fromYear = 2000,
    toYear = new Date().getFullYear() + 10,
}) {
    const [open, setOpen] = useState(false)

    // Parse the ISO string into a Date object for the Calendar
    const parsedDate = value ? parseISO(value) : undefined
    const validDate = parsedDate && isValid(parsedDate) ? parsedDate : undefined

    function handleSelect(day) {
        if (!day) {
            onChange(null)
        } else {
            // Format to local YYYY-MM-DD (avoids UTC timezone shift)
            const y = day.getFullYear()
            const m = String(day.getMonth() + 1).padStart(2, '0')
            const d = String(day.getDate()).padStart(2, '0')
            onChange(`${y}-${m}-${d}`)
        }
        setOpen(false)
    }

    function handleClear(e) {
        e.stopPropagation()
        onChange(null)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'w-full justify-start text-left font-normal bg-secondary/50 border-border hover:bg-secondary/70',
                        !validDate && 'text-muted-foreground',
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">
                        {validDate ? format(validDate, 'PPP') : placeholder}
                    </span>
                    {clearable && validDate && (
                        <X
                            className="ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground hover:text-foreground"
                            onClick={handleClear}
                        />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={validDate}
                    onSelect={handleSelect}
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={fromYear}
                    toYear={toYear}
                />
            </PopoverContent>
        </Popover>
    )
}
