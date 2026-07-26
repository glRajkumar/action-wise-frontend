'use client'

import * as React from 'react'
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer'
import { Loader } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button, buttonVariants } from '@/components/ui/button'

type DrawerSide = 'bottom' | 'top' | 'left' | 'right'

const sideClasses: Record<DrawerSide, string> = {
  bottom: 'inset-x-0 bottom-0 mt-24 max-h-[80vh] rounded-t-xl border-t',
  top: 'inset-x-0 top-0 mb-24 max-h-[80vh] rounded-b-xl border-b',
  left: 'inset-y-0 left-0 w-3/4 rounded-r-xl border-r sm:max-w-sm',
  right: 'inset-y-0 right-0 w-3/4 rounded-l-xl border-l sm:max-w-sm',
}

function Drawer(props: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger(props: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal(props: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose(props: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Backdrop>) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        'fixed inset-0 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  side = 'bottom',
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & { side?: DrawerSide }) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Viewport>
        <DrawerPrimitive.Popup>
          <DrawerPrimitive.Content
            data-slot="drawer-content"
            className={cn(
              'group/drawer-content fixed flex h-auto flex-col bg-background text-sm',
              sideClasses[side],
              className,
            )}
            {...props}
          >
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn('flex flex-col gap-0.5 p-4', className)}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('text-base font-medium text-foreground', className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

type DrawerFooterWrapperProps = {
  cancel?: React.ReactNode
  action?: React.ReactNode
  loading?: boolean
  footerCls?: string
  actionCls?: string
  cancelCls?: string
  onAction?: () => void
  onCancel?: () => void
}

function DrawerFooterWrapper({
  cancel,
  action,
  loading = false,
  footerCls,
  actionCls,
  cancelCls,
  onAction = () => {},
  onCancel = () => {},
}: DrawerFooterWrapperProps) {
  return (
    <DrawerFooter className={cn(footerCls)}>
      {cancel && (
        <DrawerClose
          className={cn(buttonVariants({ variant: 'outline' }), cancelCls)}
          onClick={onCancel}
          disabled={loading}
        >
          {cancel}
        </DrawerClose>
      )}

      {action && (
        <Button onClick={onAction} className={cn(actionCls)} disabled={loading}>
          {loading && <Loader className="animate-spin" />}
          {action}
        </Button>
      )}
    </DrawerFooter>
  )
}

type DrawerWrapperProps = {
  title?: React.ReactNode
  trigger?: React.ReactNode
  triggerCls?: string
  triggerProps?: Omit<
    React.ComponentProps<typeof DrawerPrimitive.Trigger>,
    'children' | 'className'
  >
  children?: React.ReactNode
  description?: React.ReactNode
  descriptionCls?: string
  contentCls?: string
  headerCls?: string
  titleCls?: string
  side?: DrawerSide
} & DrawerFooterWrapperProps

function DrawerWrapper({
  trigger,
  title,
  description,
  children,
  triggerCls,
  triggerProps,
  contentCls,
  headerCls,
  titleCls,
  descriptionCls,
  cancel = 'Cancel',
  action,
  loading = false,
  footerCls,
  actionCls,
  cancelCls,
  onAction,
  onCancel,
  onOpenChange,
  side,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & DrawerWrapperProps) {
  return (
    <Drawer
      {...props}
      onOpenChange={(open, eventDetails) => {
        if (!open && loading) {
          eventDetails.cancel()
          return
        }
        onOpenChange?.(open, eventDetails)
      }}
    >
      {trigger && (
        <DrawerTrigger className={cn(triggerCls)} {...triggerProps}>
          {trigger}
        </DrawerTrigger>
      )}

      <DrawerContent side={side} className={cn(contentCls)}>
        <DrawerHeader className={cn(headerCls)}>
          <DrawerTitle className={cn(titleCls)}>{title}</DrawerTitle>
          {description && (
            <DrawerDescription className={cn(descriptionCls)}>{description}</DrawerDescription>
          )}
        </DrawerHeader>

        {children}

        {(!!cancel || !!action) && (
          <DrawerFooterWrapper
            cancel={cancel}
            action={action}
            loading={loading}
            footerCls={footerCls}
            actionCls={actionCls}
            cancelCls={cancelCls}
            onAction={onAction}
            onCancel={onCancel}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerWrapper,
  DrawerFooterWrapper,
}
