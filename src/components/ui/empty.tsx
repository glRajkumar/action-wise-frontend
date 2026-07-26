import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        'flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center text-balance',
        className,
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-header"
      className={cn('flex max-w-sm flex-col items-center gap-2', className)}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-title"
      className={cn('text-sm font-medium tracking-tight', className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        'text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
        className,
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        'flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm text-balance',
        className,
      )}
      {...props}
    />
  )
}

type EmptyWrapperProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  media?: React.ReactNode
  content?: React.ReactNode
  wrapperCls?: string
  headerCls?: string
  titleCls?: string
  mediaCls?: string
  descriptionCls?: string
  contentCls?: string
  mediaVariant?: VariantProps<typeof emptyMediaVariants>['variant']
}

function EmptyWrapper({
  title,
  description,
  media,
  content,
  wrapperCls,
  headerCls,
  titleCls,
  mediaCls,
  descriptionCls,
  contentCls,
  mediaVariant = 'default',
}: EmptyWrapperProps) {
  return (
    <Empty className={cn(wrapperCls)}>
      <EmptyHeader className={cn(headerCls)}>
        {media && (
          <EmptyMedia className={cn(mediaCls)} variant={mediaVariant}>
            {media}
          </EmptyMedia>
        )}
        {title && <EmptyTitle className={cn(titleCls)}>{title}</EmptyTitle>}
        {description && (
          <EmptyDescription className={cn(descriptionCls)}>{description}</EmptyDescription>
        )}
      </EmptyHeader>

      {content && <EmptyContent className={cn(contentCls)}>{content}</EmptyContent>}
    </Empty>
  )
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia, EmptyWrapper }
