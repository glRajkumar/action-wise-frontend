'use client'

import * as React from 'react'
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  Loader2Icon,
  XCircleIcon,
  XIcon,
} from 'lucide-react'
import type { ToastManagerAddOptions, ToastManagerPromiseOptions } from '@base-ui/react/toast'
import { Toast as ToastPrimitive } from '@base-ui/react/toast'

import { cn } from '@/lib/utils'

type toastTypeT = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'

type toastPositionT =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

type toastCustomDataT = {
  icon?: React.ReactNode | null
  titleCls?: string
  descriptionCls?: string
  actionCls?: string
  closeCls?: string
}

type toastOptsT = Omit<ToastManagerAddOptions<toastCustomDataT>, 'data'> &
  toastCustomDataT & {
    position?: toastPositionT
    data?: Record<string, unknown>
  }

type toastPromiseMessages<V> = {
  loading: string
  success: string | ((value: V) => string)
  error: string | ((err: unknown) => string)
}

type toastManagerT = ReturnType<typeof ToastPrimitive.createToastManager<toastCustomDataT>>

const typeStyles: Record<toastTypeT, string> = {
  default: '',
  success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30',
  error: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30',
  info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30',
  loading: '',
}

const typeIcons: Partial<Record<toastTypeT, React.ElementType>> = {
  success: CheckCircle2Icon,
  error: XCircleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
  loading: Loader2Icon,
}

const iconStyles: Record<toastTypeT, string> = {
  default: '',
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
  loading: 'text-muted-foreground animate-spin',
}

const positionStyles: Record<toastPositionT, string> = {
  'top-left': 'top-4 left-4 sm:top-8 sm:left-8',
  'top-center': 'top-4 left-1/2 -translate-x-1/2 sm:top-8',
  'top-right': 'top-4 right-4 sm:top-8 sm:right-8',
  'bottom-left': 'bottom-4 left-4 sm:bottom-8 sm:left-8',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 sm:bottom-8',
  'bottom-right': 'bottom-4 right-4 sm:bottom-8 sm:right-8',
}

const topPlacementCls = [
  '[--offset-y:calc(var(--toast-offset-y)+calc(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))]',
  'top-0 bottom-auto origin-top',
  'transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))]',
  'data-starting-style:transform-[translateY(-150%)]',
  '[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:transform-[translateY(-150%)]',
  'data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]',
  'data-expanded:data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]',
  'data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]',
  'data-expanded:data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]',
].join(' ')

const ALL_POSITIONS: toastPositionT[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]

type toastRouterCtxT = {
  defaultPosition: toastPositionT
  managers: Map<toastPositionT, toastManagerT>
}

const ToastRouterCtx = React.createContext<toastRouterCtxT | null>(null)

function extractCustomData(
  opts: Partial<Omit<toastOptsT, 'position'>>,
): ToastManagerAddOptions<toastCustomDataT> {
  const { icon, titleCls, descriptionCls, actionCls, closeCls, data, ...rest } = opts
  return { ...rest, data: { ...data, icon, titleCls, descriptionCls, actionCls, closeCls } }
}

function ToastProvider(props: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider data-slot="toast-provider" {...props} />
}

function ToastPortal(props: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal {...props} />
}

type toastViewportProps = ToastPrimitive.Viewport.Props & { position?: toastPositionT }

function ToastViewport({ className, position = 'bottom-right', ...props }: toastViewportProps) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        'fixed z-50 mx-auto flex w-75 outline-none sm:w-90',
        positionStyles[position],
        className,
      )}
      {...props}
    />
  )
}

function ToastRoot({ className, ...props }: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        '[--gap:0.75rem] [--peek:0.75rem]',
        '[--scale:calc(max(0,1-(var(--toast-index)*0.1)))]',
        '[--shrink:calc(1-var(--scale))]',
        '[--height:var(--toast-frontmost-height,var(--toast-height))]',
        '[--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]',
        'absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] w-full',
        'origin-bottom rounded-lg border bg-background bg-clip-padding p-4 shadow-lg select-none',
        'after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[""]',
        'h-(--height) transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]',
        '[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]',
        'data-starting-style:transform-[translateY(150%)]',
        'data-ending-style:opacity-0',
        '[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:transform-[translateY(150%)]',
        'data-expanded:h-(--toast-height)',
        'data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))]',
        'data-limited:opacity-0',
        'data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]',
        'data-expanded:data-ending-style:data-[swipe-direction=down]:transform-[translateY(calc(var(--toast-swipe-movement-y)+150%))]',
        'data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
        'data-expanded:data-ending-style:data-[swipe-direction=left]:transform-[translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
        'data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
        'data-expanded:data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
        'data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]',
        'data-expanded:data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]',
        className,
      )}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        'overflow-hidden transition-opacity duration-250',
        'data-behind:pointer-events-none data-behind:opacity-0',
        'data-expanded:pointer-events-auto data-expanded:opacity-100',
        className,
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn('text-sm leading-5 font-semibold', className)}
      {...props}
    />
  )
}

function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn('text-sm leading-5 text-muted-foreground', className)}
      {...props}
    />
  )
}

function ToastAction({ className, ...props }: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(
        'mt-2 inline-flex h-7 cursor-pointer items-center justify-center rounded-md border px-3 text-xs font-medium',
        'transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    />
  )
}

function ToastClose({ className, ...props }: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close"
      className={cn(
        'absolute top-2 right-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm',
        'text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    >
      <XIcon className="h-4 w-4" />
    </ToastPrimitive.Close>
  )
}

type toastListProps = {
  isTop: boolean
  toastCls?: string
  contentCls?: string
  titleCls?: string
  descriptionCls?: string
  actionCls?: string
  closeCls?: string
  showClose?: boolean
  swipeDirection?: ToastPrimitive.Root.Props['swipeDirection']
}

function ToastList({
  isTop,
  toastCls,
  contentCls,
  titleCls,
  descriptionCls,
  actionCls,
  closeCls,
  showClose = true,
  swipeDirection,
}: toastListProps) {
  const { toasts } = ToastPrimitive.useToastManager<toastCustomDataT>()

  return toasts.map(toast => {
    const type = (toast.type as toastTypeT | undefined) ?? 'default'
    const custom = toast.data
    const hasCustomIcon = custom && 'icon' in custom
    const DefaultIcon = typeIcons[type]

    const iconNode = hasCustomIcon ? (
      custom.icon !== null && custom.icon !== undefined ? (
        <span className="mt-0.5 shrink-0 *:h-4 *:w-4">{custom.icon as React.ReactNode}</span>
      ) : null
    ) : DefaultIcon ? (
      <DefaultIcon className={cn('mt-0.5 h-4 w-4 shrink-0', iconStyles[type])} />
    ) : null

    return (
      <ToastRoot
        key={toast.id}
        toast={toast}
        swipeDirection={swipeDirection}
        className={cn(type !== 'default' && typeStyles[type], isTop && topPlacementCls, toastCls)}
      >
        <ToastContent className={contentCls}>
          <div className="flex items-start gap-3">
            {iconNode}
            <div className="flex-1 space-y-0.5 pr-5">
              <ToastTitle className={cn(titleCls, custom?.titleCls)} />
              <ToastDescription className={cn(descriptionCls, custom?.descriptionCls)} />
              {toast.actionProps && <ToastAction className={cn(actionCls, custom?.actionCls)} />}
            </div>
          </div>
          {showClose && <ToastClose className={cn(closeCls, custom?.closeCls)} />}
        </ToastContent>
      </ToastRoot>
    )
  })
}

type positionPortalProps = toastListProps & {
  position: toastPositionT
  viewportCls?: string
}

function PositionPortal({ position, viewportCls, ...listProps }: positionPortalProps) {
  const { toasts } = ToastPrimitive.useToastManager<toastCustomDataT>()
  if (toasts.length === 0) return null
  return (
    <ToastPortal>
      <ToastViewport position={position} className={viewportCls}>
        <ToastList {...listProps} />
      </ToastViewport>
    </ToastPortal>
  )
}

type toasterProps = {
  position?: toastPositionT
  timeout?: number
  limit?: number
  viewportCls?: string
  toastCls?: string
  contentCls?: string
  titleCls?: string
  descriptionCls?: string
  actionCls?: string
  closeCls?: string
  showClose?: boolean
  swipeDirection?: ToastPrimitive.Root.Props['swipeDirection']
  children?: React.ReactNode
}

function Toaster({
  position = 'bottom-right',
  timeout,
  limit,
  viewportCls,
  toastCls,
  contentCls,
  titleCls,
  descriptionCls,
  actionCls,
  closeCls,
  showClose = true,
  swipeDirection,
  children,
}: toasterProps) {
  const [managers] = React.useState<Map<toastPositionT, toastManagerT>>(
    () =>
      new Map(ALL_POSITIONS.map(p => [p, ToastPrimitive.createToastManager<toastCustomDataT>()])),
  )

  const listProps: Omit<positionPortalProps, 'position'> = {
    viewportCls,
    toastCls,
    contentCls,
    titleCls,
    descriptionCls,
    actionCls,
    closeCls,
    showClose,
    swipeDirection,
    isTop: false,
  }

  return (
    <ToastRouterCtx.Provider value={{ defaultPosition: position, managers }}>
      {children}
      {ALL_POSITIONS.map(pos => (
        <ToastPrimitive.Provider
          key={pos}
          toastManager={managers.get(pos)!}
          timeout={timeout}
          limit={limit}
        >
          <PositionPortal {...listProps} position={pos} isTop={pos.startsWith('top')} />
        </ToastPrimitive.Provider>
      ))}
    </ToastRouterCtx.Provider>
  )
}

function useToast() {
  const ctx = React.useContext(ToastRouterCtx)

  function getManager(position?: toastPositionT): toastManagerT | undefined {
    const pos = position ?? ctx?.defaultPosition ?? 'bottom-right'
    return ctx?.managers.get(pos)
  }

  function add(opts: toastOptsT) {
    const { position, ...rest } = opts
    return getManager(position)?.add(extractCustomData(rest)) ?? ''
  }

  function success(description: string, opts?: Partial<toastOptsT>) {
    const { position, ...rest } = opts ?? {}
    return (
      getManager(position)?.add(extractCustomData({ description, type: 'success', ...rest })) ?? ''
    )
  }

  function error(description: string, opts?: Partial<toastOptsT>) {
    const { position, ...rest } = opts ?? {}
    return (
      getManager(position)?.add(extractCustomData({ description, type: 'error', ...rest })) ?? ''
    )
  }

  function warning(description: string, opts?: Partial<toastOptsT>) {
    const { position, ...rest } = opts ?? {}
    return (
      getManager(position)?.add(extractCustomData({ description, type: 'warning', ...rest })) ?? ''
    )
  }

  function info(description: string, opts?: Partial<toastOptsT>) {
    const { position, ...rest } = opts ?? {}
    return (
      getManager(position)?.add(extractCustomData({ description, type: 'info', ...rest })) ?? ''
    )
  }

  function promise<V>(
    p: Promise<V>,
    messages: toastPromiseMessages<V>,
    opts?: { position?: toastPositionT },
  ) {
    const manager = getManager(opts?.position)
    return (
      manager?.promise<V>(p, {
        loading: { description: messages.loading, type: 'loading', timeout: 0 },
        success:
          typeof messages.success === 'function'
            ? (v: V) => ({
                description: (messages.success as (v: V) => string)(v),
                type: 'success',
              })
            : { description: messages.success as string, type: 'success' },
        error:
          typeof messages.error === 'function'
            ? (e: unknown) => ({
                description: (messages.error as (e: unknown) => string)(e),
                type: 'error',
              })
            : { description: messages.error as string, type: 'error' },
      } as ToastManagerPromiseOptions<V, toastCustomDataT>) ?? p
    )
  }

  function update(id: string, opts: Partial<toastOptsT>) {
    const { position, ...rest } = opts
    const extracted = extractCustomData(rest)
    if (position) {
      getManager(position)?.update(id, extracted)
    } else {
      ctx?.managers.forEach(m => m.update(id, extracted))
    }
  }

  function close(id?: string, position?: toastPositionT) {
    if (position) {
      getManager(position)?.close(id)
    } else {
      ctx?.managers.forEach(m => m.close(id))
    }
  }

  return { add, success, error, warning, info, promise, update, close }
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  ToastProvider,
  ToastPortal,
  ToastViewport,
  ToastRoot,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  Toaster,
  useToast,
  createToastManager,
  useToastManager,
  type toastTypeT,
  type toastPositionT,
}
