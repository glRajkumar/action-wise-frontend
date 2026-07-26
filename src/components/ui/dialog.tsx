'use client'

import * as React from 'react'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { Loader, XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-background p-4 text-sm ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={<Button variant="ghost" className="absolute top-2 right-2" size="icon-sm" />}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="dialog-header" className={cn('flex flex-col gap-2', className)} {...props} />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        '-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 px-4 py-2.5 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-base leading-none font-medium', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

type DialogFooterWrapperProps = {
  cancel?: React.ReactNode
  action?: React.ReactNode
  loading?: boolean
  footerCls?: string
  actionCls?: string
  cancelCls?: string
  onAction?: () => void
  onCancel?: () => void
}

function DialogFooterWrapper({
  cancel,
  action,
  loading = false,
  footerCls,
  actionCls,
  cancelCls,
  onAction = () => {},
  onCancel = () => {},
}: DialogFooterWrapperProps) {
  return (
    <DialogFooter className={footerCls}>
      {cancel && (
        <DialogClose
          render={
            <Button
              variant="outline"
              onClick={onCancel}
              className={cn(cancelCls)}
              disabled={loading}
            />
          }
        >
          {cancel}
        </DialogClose>
      )}

      {action && (
        <Button onClick={onAction} className={cn(actionCls)} disabled={loading}>
          {loading && <Loader className="animate-spin" />}
          {action}
        </Button>
      )}
    </DialogFooter>
  )
}

type DialogWrapperProps = {
  title?: React.ReactNode
  trigger?: React.ReactNode
  triggerCls?: string
  triggerProps?: Omit<DialogPrimitive.Trigger.Props, 'children' | 'className'>
  children?: React.ReactNode
  description?: React.ReactNode
  descriptionCls?: string
  contentCls?: string
  headerCls?: string
  titleCls?: string
  showCloseButton?: boolean
} & DialogFooterWrapperProps

function DialogWrapper({
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
  showCloseButton,
  cancel = 'Cancel',
  action,
  loading = false,
  footerCls,
  actionCls,
  cancelCls,
  onAction,
  onCancel,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & DialogWrapperProps) {
  return (
    <Dialog
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
        <DialogTrigger className={cn(triggerCls)} {...triggerProps}>
          {trigger}
        </DialogTrigger>
      )}

      <DialogContent className={cn(contentCls)} showCloseButton={showCloseButton}>
        <DialogHeader className={cn(headerCls)}>
          <DialogTitle className={cn(titleCls)}>{title}</DialogTitle>
          {description && (
            <DialogDescription className={cn(descriptionCls)}>{description}</DialogDescription>
          )}
        </DialogHeader>

        {children}

        {(!!cancel || !!action) && (
          <DialogFooterWrapper
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
      </DialogContent>
    </Dialog>
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  DialogWrapper,
  DialogFooterWrapper,
}
