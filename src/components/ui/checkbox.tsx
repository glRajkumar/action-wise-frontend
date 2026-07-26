'use client'

import * as React from 'react'
import { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui/react/checkbox-group'
import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { CheckIcon, MinusIcon } from 'lucide-react'

import { cn, getKey, getLabel, getValue } from '@/lib/utils'

function CheckboxIndicator({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer group/checkbox relative flex size-4.5 shrink-0 items-center justify-center rounded border border-input transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground dark:data-indeterminate:bg-primary',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>{state.indeterminate ? <MinusIcon /> : <CheckIcon />}</span>
        )}
      />
    </CheckboxPrimitive.Root>
  )
}

type CheckboxProps = {
  label: React.ReactNode
  description?: React.ReactNode
  wrapperCls?: string
  as?: React.ElementType
} & CheckboxPrimitive.Root.Props

function Checkbox({
  label,
  description,
  wrapperCls,
  className,
  as: Comp = 'label',
  ...props
}: CheckboxProps) {
  return (
    <Comp
      className={cn(
        'flex cursor-pointer select-none items-start gap-2 has-[:disabled]:cursor-not-allowed',
        wrapperCls,
      )}
    >
      <CheckboxIndicator className={cn(className)} {...props} />
      <p className="grid">
        <span className="text-sm font-medium leading-none">{label}</span>
        {description && <span className="mt-0.5 text-xs text-muted-foreground">{description}</span>}
      </p>
    </Comp>
  )
}

function CheckboxGroup({ className, ...props }: CheckboxGroupPrimitive.Props) {
  return (
    <CheckboxGroupPrimitive
      data-slot="checkbox-group"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

type checkboxItemT = allowedPrimitiveT | (itemT & { description?: React.ReactNode })

type CheckboxWrapperProps = {
  as?: React.ElementType
  items: checkboxItemT[]
  itemCls?: string
  parentLabel?: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
} & Omit<CheckboxGroupPrimitive.Props, 'children'>

function CheckboxWrapper({
  as,
  items,
  itemCls,
  className,
  parentLabel,
  orientation = 'vertical',
  ...props
}: CheckboxWrapperProps) {
  const allValues = items.map(opt => String(getValue(opt)))

  return (
    <CheckboxGroup
      allValues={parentLabel ? allValues : undefined}
      className={cn(orientation === 'horizontal' && 'flex-row flex-wrap', className)}
      {...props}
    >
      {parentLabel && <Checkbox label={parentLabel} wrapperCls={itemCls} data-parent />}
      {items.map((opt, i) => (
        <Checkbox
          key={getKey(opt, i)}
          value={String(getValue(opt))}
          label={getLabel(opt)}
          description={typeof opt === 'object' ? opt.description : undefined}
          disabled={typeof opt === 'object' ? opt.disabled : undefined}
          wrapperCls={itemCls}
          as={as}
        />
      ))}
    </CheckboxGroup>
  )
}

export {
  CheckboxIndicator,
  Checkbox,
  CheckboxGroup,
  CheckboxWrapper,
  type CheckboxProps,
  type checkboxItemT,
  type CheckboxWrapperProps,
}
