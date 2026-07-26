'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'

import { cn } from '@/lib/utils'

function Tabs({ className, orientation = 'horizontal', ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      data-horizontal={orientation !== 'vertical' ? '' : undefined}
      data-vertical={orientation === 'vertical' ? '' : undefined}
      orientation={orientation}
      className={cn('group/tabs flex gap-2 flex-col data-vertical:flex-row', className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  'relative group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none',
  {
    variants: {
      variant: {
        default: 'bg-muted',
        line: 'gap-1 bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function TabsIndicator({ className, ...props }: TabsPrimitive.Indicator.Props) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      className={cn(
        'absolute z-0 pointer-events-none transition-[left,width,top,height] duration-200',
        'group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:bg-background group-data-[variant=default]/tabs-list:shadow-sm dark:group-data-[variant=default]/tabs-list:bg-input/30 dark:group-data-[variant=default]/tabs-list:border dark:group-data-[variant=default]/tabs-list:border-input',
        'group-data-[variant=default]/tabs-list:group-data-horizontal/tabs:inset-y-[3px] group-data-[variant=default]/tabs-list:group-data-horizontal/tabs:left-[var(--active-tab-left)] group-data-[variant=default]/tabs-list:group-data-horizontal/tabs:w-[var(--active-tab-width)]',
        'group-data-[variant=default]/tabs-list:group-data-vertical/tabs:inset-x-[3px] group-data-[variant=default]/tabs-list:group-data-vertical/tabs:top-[var(--active-tab-top)] group-data-[variant=default]/tabs-list:group-data-vertical/tabs:h-[var(--active-tab-height)]',
        'group-data-[variant=line]/tabs-list:bg-foreground',
        'group-data-[variant=line]/tabs-list:group-data-horizontal/tabs:bottom-0 group-data-[variant=line]/tabs-list:group-data-horizontal/tabs:h-0.5 group-data-[variant=line]/tabs-list:group-data-horizontal/tabs:left-[var(--active-tab-left)] group-data-[variant=line]/tabs-list:group-data-horizontal/tabs:w-[var(--active-tab-width)]',
        'group-data-[variant=line]/tabs-list:group-data-vertical/tabs:right-0 group-data-[variant=line]/tabs-list:group-data-vertical/tabs:w-0.5 group-data-[variant=line]/tabs-list:group-data-vertical/tabs:top-[var(--active-tab-top)] group-data-[variant=line]/tabs-list:group-data-vertical/tabs:h-[var(--active-tab-height)]',
        className,
      )}
      {...props}
    />
  )
}

function TabsList({
  className,
  variant = 'default',
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      <TabsIndicator />
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        'relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all',
        'group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start',
        'hover:text-foreground',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring',
        'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
        'dark:text-muted-foreground dark:hover:text-foreground',
        'data-active:text-foreground dark:data-active:text-foreground',
        'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn('flex-1 text-sm outline-none', className)}
      {...props}
    />
  )
}

type tabItemT = {
  value: string
  trigger: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
  triggerCls?: string
  contentCls?: string
}

type tabItemsT = tabItemT[]

type tabsWrapperProps = {
  tabs: tabItemsT
  variant?: VariantProps<typeof tabsListVariants>['variant']
  listCls?: string
  triggerCls?: string
  contentCls?: string
  activateOnFocus?: boolean
  loopFocus?: boolean
}

function TabsWrapper({
  tabs,
  variant,
  listCls,
  triggerCls,
  contentCls,
  activateOnFocus,
  loopFocus,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & tabsWrapperProps) {
  return (
    <Tabs {...props}>
      <TabsList
        className={cn(listCls)}
        variant={variant}
        activateOnFocus={activateOnFocus}
        loopFocus={loopFocus}
      >
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(triggerCls, tab.triggerCls)}
          >
            {tab.trigger}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value} className={cn(contentCls, tab.contentCls)}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsIndicator,
  tabsListVariants,
  TabsWrapper,
  type tabItemT,
  type tabItemsT,
}
