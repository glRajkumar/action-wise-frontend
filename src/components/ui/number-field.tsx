'use client'

import { MinusIcon, PlusIcon } from 'lucide-react'
import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field'

import { cn } from '@/lib/utils'

const NumberFieldRoot = NumberFieldPrimitive.Root

function NumberFieldGroup({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Group>) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={cn(
        'flex h-9 w-full items-center rounded-md border border-input bg-transparent text-sm shadow-xs transition-colors',
        'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        'has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        'dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  )
}

function NumberFieldInput({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Input>) {
  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-input"
      className={cn(
        'h-full min-w-0 flex-1 bg-transparent px-2.5 text-center outline-none',
        'placeholder:text-muted-foreground',
        'disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}

function NumberFieldDecrement({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Decrement>) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-decrement"
      className={cn(
        'flex h-full w-8 shrink-0 items-center justify-center rounded-l-[calc(var(--radius)-2px)] text-muted-foreground',
        'transition-colors hover:bg-accent hover:text-foreground',
        'disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:size-3.5',
        className,
      )}
      {...props}
    >
      <MinusIcon />
    </NumberFieldPrimitive.Decrement>
  )
}

function NumberFieldIncrement({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Increment>) {
  return (
    <NumberFieldPrimitive.Increment
      data-slot="number-field-increment"
      className={cn(
        'flex h-full w-8 shrink-0 items-center justify-center rounded-r-[calc(var(--radius)-2px)] text-muted-foreground',
        'transition-colors hover:bg-accent hover:text-foreground',
        'disabled:pointer-events-none disabled:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:size-3.5',
        className,
      )}
      {...props}
    >
      <PlusIcon />
    </NumberFieldPrimitive.Increment>
  )
}

function NumberFieldScrubArea({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.ScrubArea>) {
  return (
    <NumberFieldPrimitive.ScrubArea
      data-slot="number-field-scrub-area"
      className={cn('cursor-ew-resize select-none', className)}
      {...props}
    />
  )
}

function NumberFieldScrubAreaCursor({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.ScrubAreaCursor>) {
  return (
    <NumberFieldPrimitive.ScrubAreaCursor
      data-slot="number-field-scrub-area-cursor"
      className={cn('flex items-center gap-1.5 text-foreground', className)}
      {...props}
    />
  )
}

type NumberFieldWrapperProps = React.ComponentProps<typeof NumberFieldPrimitive.Root> & {
  className?: string
  placeholder?: string
}

function NumberFieldWrapper({ className, placeholder, ...props }: NumberFieldWrapperProps) {
  return (
    <NumberFieldRoot {...props}>
      <NumberFieldGroup className={className}>
        <NumberFieldDecrement />
        <NumberFieldInput placeholder={placeholder} />
        <NumberFieldIncrement />
      </NumberFieldGroup>
    </NumberFieldRoot>
  )
}

export {
  NumberFieldRoot,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
  NumberFieldWrapper,
}
