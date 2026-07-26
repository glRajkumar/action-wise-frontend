'use client'

import * as React from 'react'
import { type DateRange } from '@daypicker/react'
import { CalendarIcon } from 'lucide-react'

import { type Selected, formatSelected, getDefaultMonth } from './utils'
import { cn } from '@/lib/utils'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

import { Calendar } from './calendar'

type DatePickerProps = Omit<
  React.ComponentProps<typeof Calendar>,
  'mode' | 'selected' | 'onSelect'
> & {
  open?: boolean
  mode?: 'single' | 'multiple' | 'range'
  align?: React.ComponentProps<typeof PopoverContent>['align']
  selected?: Selected
  dateFormat?: string
  placeholder?: string
  triggerProps?: Omit<React.ComponentProps<typeof Button>, 'children'>
  onOpenChange?: (open: boolean) => void
  onSelect?: (...args: any[]) => void
}

function DatePicker({
  mode,
  open,
  selected,
  triggerProps,
  align = 'start',
  dateFormat = 'dd/MM/yyyy',
  placeholder = 'Pick a date',
  onSelect,
  onOpenChange,
  ...calendarProps
}: DatePickerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const open_ = isControlled ? open : internalOpen

  function handleOpenChange(next: boolean) {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  function handleSelect(...args: any[]) {
    onSelect?.(...args)
    const effectiveMode = mode ?? 'single'
    if (effectiveMode === 'single') {
      handleOpenChange(false)
    } else if (effectiveMode === 'range') {
      const val = args[0] as DateRange | undefined
      if (val?.from && val?.to) handleOpenChange(false)
    }
  }

  const { className: triggerClassName, ...restTriggerProps } = triggerProps ?? {}
  const label = formatSelected(selected, dateFormat)

  return (
    <Popover open={open_} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            {...restTriggerProps}
            className={cn(
              'w-full pl-3 text-left font-normal shadow-xs',
              !label && 'text-muted-foreground',
              triggerClassName,
            )}
          >
            {label ?? <span>{placeholder}</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" aria-hidden="true" />
          </Button>
        }
      />

      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          {...({
            autoFocus: true,
            captionLayout: 'dropdown',
            defaultMonth: getDefaultMonth(selected),
            mode: mode ?? 'single',
            selected,
            onSelect: handleSelect,
            ...calendarProps,
          } as React.ComponentProps<typeof Calendar>)}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
export type { DatePickerProps }
