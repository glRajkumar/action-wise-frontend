'use client'

import * as React from 'react'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import { Radio as RadioPrimitive } from '@base-ui/react/radio'

import { cn, getKey, getLabel, getValue } from '@/lib/utils'

function RadioIndicator({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        'group/radio-group-item peer relative flex aspect-square size-4.5 shrink-0 rounded-full border border-input outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary',
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

type RadioProps = {
  as?: React.ElementType
  label: React.ReactNode
  wrapperCls?: string
  description?: React.ReactNode
} & RadioPrimitive.Root.Props

function Radio({
  label,
  description,
  wrapperCls,
  className,
  as: Comp = 'label',
  ...props
}: RadioProps) {
  return (
    <Comp
      className={cn(
        'flex cursor-pointer select-none items-start gap-2 has-[:disabled]:cursor-not-allowed',
        wrapperCls,
      )}
    >
      <RadioIndicator className={cn(className)} {...props} />
      <p className="grid">
        <span className="text-sm font-medium leading-none">{label}</span>
        {description && <span className="mt-0.5 text-xs text-muted-foreground">{description}</span>}
      </p>
    </Comp>
  )
}

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

type radioItemT = allowedPrimitiveT | (itemT & { description?: React.ReactNode })

type RadioWrapperProps = {
  as?: React.ElementType
  items: radioItemT[]
  itemCls?: string
  orientation?: 'horizontal' | 'vertical'
} & Omit<RadioGroupPrimitive.Props, 'children'>

function RadioWrapper({
  items,
  orientation = 'vertical',
  itemCls,
  className,
  as,
  ...props
}: RadioWrapperProps) {
  return (
    <RadioGroup
      className={cn(orientation === 'horizontal' && 'flex-row flex-wrap', className)}
      {...props}
    >
      {items.map((opt, i) => (
        <Radio
          key={getKey(opt, i)}
          value={String(getValue(opt))}
          label={getLabel(opt)}
          description={typeof opt === 'object' ? opt.description : undefined}
          disabled={typeof opt === 'object' ? opt.disabled : undefined}
          wrapperCls={itemCls}
          as={as}
        />
      ))}
    </RadioGroup>
  )
}

export {
  RadioIndicator,
  Radio,
  RadioGroup,
  RadioWrapper,
  type RadioProps,
  type radioItemT,
  type RadioWrapperProps,
}
