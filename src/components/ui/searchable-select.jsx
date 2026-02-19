'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/**
 * SearchableSelect — a combobox with type-to-filter search.
 *
 * Props:
 *   options     { value: string, label: string }[]
 *   value       string | null  — controlled value
 *   onChange    (value: string | null) => void
 *   placeholder string         — trigger button placeholder text
 *   searchPlaceholder string   — input placeholder inside the dropdown
 *   emptyMessage string        — shown when no results match
 *   clearable   boolean        — show ✕ button to clear selection
 *   disabled    boolean
 *   className   string         — class on the trigger button
 */
export function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    emptyMessage = 'No results found.',
    clearable = true,
    disabled = false,
    className,
}) {
    const [open, setOpen] = useState(false)

    const selected = options.find((o) => o.value === value)

    function handleSelect(optionValue) {
        onChange(optionValue === value ? null : optionValue)
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
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'w-full justify-between bg-secondary/50 border-border font-normal hover:bg-secondary/70 text-left',
                        !selected && 'text-muted-foreground',
                        className
                    )}
                >
                    <span className="truncate">
                        {selected ? selected.label : placeholder}
                    </span>
                    <span className="flex items-center gap-1 shrink-0 ml-2">
                        {clearable && selected && (
                            <X
                                className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground"
                                onClick={handleClear}
                            />
                        )}
                        <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="p-0 w-[var(--radix-popover-trigger-width)] max-w-sm"
                align="start"
                sideOffset={4}
            >
                <Command>
                    <CommandInput placeholder={searchPlaceholder} className="h-9" />
                    <CommandList className="max-h-[220px]">
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}   // Command filters on this
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4 shrink-0',
                                            value === option.value ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
