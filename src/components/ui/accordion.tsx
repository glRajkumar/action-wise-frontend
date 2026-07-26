'use client'

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col', className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('not-last:border-b', className)}
      {...props}
    />
  )
}

function AccordionHeader({ className, ...props }: AccordionPrimitive.Header.Props) {
  return (
    <AccordionPrimitive.Header
      data-slot="accordion-header"
      className={cn('flex', className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  indicatorAt = 'right',
  headerProps,
  ...props
}: AccordionPrimitive.Trigger.Props & {
  indicatorAt?: indicatorAtT
  headerProps?: AccordionPrimitive.Header.Props
}) {
  const icon = indicatorAt !== '' && (
    <ChevronDownIcon
      data-slot="accordion-trigger-icon"
      className={cn(
        'pointer-events-none shrink-0 transition-transform duration-300 group-aria-expanded/accordion-trigger:rotate-180',
        indicatorAt === 'right' && 'ml-auto',
      )}
    />
  )

  return (
    <AccordionHeader {...headerProps}>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground cursor-pointer',
          className,
        )}
        {...props}
      >
        {indicatorAt === 'left' && icon}
        {children}
        {indicatorAt === 'right' && icon}
      </AccordionPrimitive.Trigger>
    </AccordionHeader>
  )
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden text-sm h-(--accordion-panel-height) transition-[height] ease-out data-ending-style:h-0 data-starting-style:h-0"
      {...props}
    >
      <div
        className={cn(
          'pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

type accordionSharedT = {
  triggerCls?: string
  contentCls?: string
  indicatorAt?: indicatorAtT
  itemProps?: Omit<AccordionPrimitive.Item.Props, 'value' | 'className'>
  triggerProps?: Omit<AccordionPrimitive.Trigger.Props, 'className' | 'children'> & {
    headerProps?: AccordionPrimitive.Header.Props
  }
  contentProps?: Omit<AccordionPrimitive.Panel.Props, 'className' | 'children'>
}

type accordionItemT = {
  value: string
  trigger: React.ReactNode
  content: React.ReactNode
  className?: string
} & accordionSharedT

type accordionItemsT = accordionItemT[]

type accordionWrapperProps = {
  items: accordionItemsT
  itemCls?: string
} & accordionSharedT &
  React.ComponentProps<typeof AccordionPrimitive.Root>

function AccordionWrapper({
  items,
  itemCls,
  triggerCls,
  contentCls,
  indicatorAt = 'right',
  itemProps: globalItemProps,
  triggerProps: globalTriggerProps,
  contentProps: globalContentProps,
  ...props
}: accordionWrapperProps) {
  return (
    <Accordion {...props}>
      {items.map(({ triggerProps, contentProps, itemProps, ...item }) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className={cn(itemCls, item.className)}
          {...globalItemProps}
          {...itemProps}
        >
          <AccordionTrigger
            className={cn('items-center justify-start gap-2', triggerCls, item.triggerCls)}
            indicatorAt={item.indicatorAt ?? indicatorAt}
            {...globalTriggerProps}
            {...triggerProps}
          >
            {item.trigger}
          </AccordionTrigger>

          <AccordionContent
            className={cn(contentCls, item.contentCls)}
            {...globalContentProps}
            {...contentProps}
          >
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

export {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
  AccordionWrapper,
  type accordionItemT,
  type accordionItemsT,
}
