'use client'

import * as React from 'react'
import { Popover as PopoverPrimitive } from '@base-ui/react/popover'

import { cn } from '@/lib/utils'

function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

function PopoverClose({ className, ...props }: PopoverPrimitive.Close.Props) {
  return <PopoverPrimitive.Close data-slot="popover-close" className={cn(className)} {...props} />
}

function PopoverArrow({ className, ...props }: PopoverPrimitive.Arrow.Props) {
  return (
    <PopoverPrimitive.Arrow
      data-slot="popover-arrow"
      className={cn(
        'flex data-[side=bottom]:top-[-10px] data-[side=left]:right-[-14px] data-[side=left]:rotate-90 data-[side=right]:left-[-14px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-10px] data-[side=top]:rotate-180',
        className,
      )}
      {...props}
    >
      <svg width="20" height="10" viewBox="0 0 20 10" className="block">
        <path d="M 0 10 L 10 0 L 20 10 Z" className="fill-popover" />
        <path
          d="M 0 10 L 10 0 L 20 10"
          className="fill-none stroke-foreground/10"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </PopoverPrimitive.Arrow>
  )
}

type popoverContentType = PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    | 'align'
    | 'alignOffset'
    | 'side'
    | 'sideOffset'
    | 'arrowPadding'
    | 'collisionAvoidance'
    | 'collisionBoundary'
    | 'collisionPadding'
  > & {
    showArrow?: boolean
    arrowClassName?: string
  }

function PopoverContent({
  className,
  align = 'center',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  arrowPadding,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding,
  showArrow,
  arrowClassName,
  children,
  ...props
}: popoverContentType) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        arrowPadding={arrowPadding}
        collisionPadding={collisionPadding}
        collisionBoundary={collisionBoundary}
        collisionAvoidance={collisionAvoidance}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            'flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className,
          )}
          {...props}
        >
          {children}
          {showArrow && <PopoverArrow className={arrowClassName} />}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="popover-header"
      className={cn('flex flex-col gap-0.5 text-sm', className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn('font-medium', className)}
      {...props}
    />
  )
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  )
}

type PopoverWrapperProps = {
  trigger?: React.ReactNode
  content?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  triggerCls?: string
  triggerProps?: Omit<PopoverPrimitive.Trigger.Props, 'className' | 'children'>
  contentCls?: string
  contentProps?: Omit<popoverContentType, 'className'>
} & Omit<React.ComponentProps<typeof PopoverPrimitive.Root>, 'children'>

function PopoverWrapper({
  trigger,
  content,
  title,
  description,
  triggerCls,
  triggerProps,
  contentCls,
  contentProps,
  ...props
}: PopoverWrapperProps) {
  return (
    <Popover {...props}>
      <PopoverTrigger className={cn(triggerCls)} {...triggerProps}>
        {trigger}
      </PopoverTrigger>

      <PopoverContent {...contentProps} className={cn(contentCls)}>
        {(title || description) && (
          <PopoverHeader>
            {title && <PopoverTitle>{title}</PopoverTitle>}
            {description && <PopoverDescription>{description}</PopoverDescription>}
          </PopoverHeader>
        )}
        {content}
      </PopoverContent>
    </Popover>
  )
}

export {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  PopoverWrapper,
}
