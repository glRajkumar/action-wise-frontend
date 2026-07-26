import * as React from 'react'
import { type DropdownProps } from '@daypicker/react'

import { cn } from '@/lib/utils'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function CalendarDropdown({ options = [], value, onChange, disabled, className }: DropdownProps) {
  const stringValue = value !== undefined ? String(value) : undefined
  const labelMap = React.useMemo(
    () => Object.fromEntries(options.map(o => [String(o.value), o.label])),
    [options],
  )

  function handleValueChange(val: string | null) {
    if (!onChange || val === null) return
    const event = { target: { value: val } } as React.ChangeEvent<HTMLSelectElement>
    onChange(event)
  }

  return (
    <Select
      value={stringValue}
      onValueChange={handleValueChange as (val: string | null) => void}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          'h-7 border-0 shadow-none bg-transparent hover:bg-accent px-2 pr-1 font-medium gap-0.5 text-sm',
          className,
        )}
      >
        <SelectValue>{() => labelMap[stringValue ?? ''] ?? stringValue}</SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-16">
        {options.map(({ value: val, label, disabled: optDisabled }) => (
          <SelectItem
            key={val}
            value={String(val)}
            disabled={optDisabled}
            className="px-2! [&_svg]:hidden"
          >
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { CalendarDropdown }
