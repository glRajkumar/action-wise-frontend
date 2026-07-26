'use client'

import * as React from 'react'
import { OTPField as OTPFieldPrimitive } from '@base-ui/react/otp-field'
import { MinusIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function InputOTP({ className, ...props }: React.ComponentProps<typeof OTPFieldPrimitive.Root>) {
  return (
    <OTPFieldPrimitive.Root
      data-slot="input-otp"
      className={cn('flex items-center data-disabled:opacity-50', className)}
      {...props}
    />
  )
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="input-otp-group" className={cn('flex items-center', className)} {...props} />
  )
}

function InputOTPSlot({
  className,
  ...props
}: React.ComponentProps<typeof OTPFieldPrimitive.Input>) {
  return (
    <OTPFieldPrimitive.Input
      data-slot="input-otp-slot"
      className={cn(
        'size-9 border-y border-r border-input bg-transparent text-center text-sm transition-all outline-none',
        'first:rounded-l-md first:border-l last:rounded-r-md',
        'focus:border-ring focus:ring-3 focus:ring-ring/50',
        'data-invalid:border-destructive data-focused:data-invalid:ring-destructive/20',
        'dark:bg-input/30 dark:data-focused:data-invalid:ring-destructive/40',
        'disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}

function InputOTPSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<typeof OTPFieldPrimitive.Separator>) {
  return (
    <OTPFieldPrimitive.Separator
      data-slot="input-otp-separator"
      className={cn('flex items-center [&_svg:not([class*="size-"])]:size-4', className)}
      {...props}
    >
      {children ?? <MinusIcon />}
    </OTPFieldPrimitive.Separator>
  )
}

type InputOTPWrapperProps = Omit<React.ComponentProps<typeof OTPFieldPrimitive.Root>, 'length'> & {
  length?: number
  separator?: boolean | number
  slotClassName?: string
}

function InputOTPWrapper({
  length = 6,
  separator = false,
  slotClassName,
  className,
  ...props
}: InputOTPWrapperProps) {
  const splitAt =
    separator === false ? null : separator === true ? Math.floor(length / 2) : separator

  if (splitAt === null) {
    return (
      <InputOTP length={length} className={className} {...props}>
        <InputOTPGroup>
          {Array.from({ length }, (_, i) => (
            <InputOTPSlot key={i} className={slotClassName} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    )
  }

  return (
    <InputOTP length={length} className={className} {...props}>
      <InputOTPGroup>
        {Array.from({ length: splitAt }, (_, i) => (
          <InputOTPSlot key={i} className={slotClassName} />
        ))}
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        {Array.from({ length: length - splitAt }, (_, i) => (
          <InputOTPSlot key={i} className={slotClassName} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
}

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  InputOTPWrapper,
  type InputOTPWrapperProps,
}
