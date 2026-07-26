'use client'

import * as React from 'react'
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from 'lucide-react'
import { Select as SelectPrimitive } from '@base-ui/react/select'

import { cn, getKey, getLabel, getValue, isGroup, isOption, isSeparator } from '@/lib/utils'

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn('scroll-my-1 p-1', className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('flex flex-1 text-left', className)}
      {...props}
    />
  )
}

function SelectTrigger({ className, children, ...props }: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-md border border-input bg-transparent pl-3 pr-1 h-9 text-sm shadow-xs whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <span className="flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" />
        }
      >
        <ChevronDownIcon className="size-4" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectBackdrop({ className, ...props }: SelectPrimitive.Backdrop.Props) {
  return (
    <SelectPrimitive.Backdrop
      data-slot="select-backdrop"
      className={cn('fixed inset-0', className)}
      {...props}
    />
  )
}

function SelectContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  alignItemWithTrigger = false,
  backdrop = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
  > & { backdrop?: boolean }) {
  return (
    <SelectPrimitive.Portal>
      {backdrop && <SelectBackdrop />}
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            'relative p-1 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  indicatorAt = 'right',
  ...props
}: SelectPrimitive.Item.Props & { indicatorAt?: indicatorAtT }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
        indicatorAt === '' ? 'px-2' : indicatorAt === 'right' ? 'pr-8 pl-2' : 'pr-2 pl-8',
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>

      {indicatorAt !== '' && (
        <SelectPrimitive.ItemIndicator
          className={cn(
            'pointer-events-none absolute flex size-4 items-center justify-center',
            indicatorAt === 'right' ? 'right-2' : 'left-2',
          )}
        >
          <CheckIcon className="pointer-events-none" />
        </SelectPrimitive.ItemIndicator>
      )}
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-1 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-1 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

type itemProps = {
  item: allowedPrimitiveT | itemT
  className?: string
  indicatorAt?: indicatorAtT
}

function Item({ item, className, indicatorAt }: itemProps) {
  const value = getValue(item)
  const label = getLabel(item)
  const optCls = isOption(item) ? item.className : undefined
  const disabled = isOption(item) ? item.disabled : undefined

  if (isSeparator(value)) return <SelectSeparator className={className} />

  return (
    <SelectItem
      value={`${value}`}
      className={cn(className, optCls)}
      indicatorAt={indicatorAt}
      disabled={disabled}
    >
      {label}
    </SelectItem>
  )
}

type selectProps = {
  id?: string
  items: itemsT
  placeholder?: string
  indicatorAt?: indicatorAtT
  backdrop?: boolean
  triggerCls?: string
  contentCls?: string
  groupCls?: string
  groupLabelCls?: string
  itemCls?: string
  renderValue?: (value: string, option: allowedPrimitiveT | itemT | undefined) => React.ReactNode
} & Omit<React.ComponentProps<typeof SelectPrimitive.Root>, 'items'>
function SelectWrapper({
  id,
  items,
  placeholder,
  indicatorAt,
  backdrop,
  triggerCls,
  contentCls,
  groupCls,
  itemCls,
  groupLabelCls,
  renderValue,
  ...props
}: selectProps) {
  const { labelMap, optionMap } = React.useMemo(() => {
    const labelMap: Record<string, React.ReactNode> = {}
    const optionMap: Record<string, allowedPrimitiveT | itemT> = {}
    const process = (opts: itemsT) => {
      for (const opt of opts) {
        if (isGroup(opt)) {
          process(opt.items as itemsT)
        } else {
          const o = opt as allowedPrimitiveT | itemT
          const val = getValue(o)
          if (!isSeparator(val)) {
            const key = String(val)
            labelMap[key] = getLabel(o)
            optionMap[key] = o
          }
        }
      }
    }
    process(items)
    return { labelMap, optionMap }
  }, [items])

  return (
    <Select {...props}>
      <SelectTrigger
        id={id}
        className={cn(
          'w-full',
          props.multiple && 'h-auto min-h-9 py-1 *:data-[slot=select-value]:flex-wrap',
          triggerCls,
        )}
      >
        <SelectValue placeholder={placeholder}>
          {(value: string | string[] | null) => {
            if (!value || (Array.isArray(value) && !value.length)) return placeholder
            if (Array.isArray(value)) {
              return value.map(v => (
                <span
                  key={v}
                  className="inline-flex items-center rounded-sm bg-secondary px-1.5 py-1 text-xs font-medium text-secondary-foreground whitespace-nowrap"
                >
                  {renderValue ? renderValue(v, optionMap[v]) : (labelMap[v] ?? v)}
                </span>
              ))
            }
            if (renderValue) return renderValue(value, optionMap[value])
            return labelMap[value] ?? value
          }}
        </SelectValue>
      </SelectTrigger>

      <SelectContent backdrop={backdrop} className={cn(contentCls)}>
        {items.map((item, i) => {
          if (isGroup(item)) {
            return (
              <SelectGroup key={item.group} className={cn(groupCls, item.className)}>
                <SelectLabel className={cn('pb-0.5', groupLabelCls)}>{item.group}</SelectLabel>

                {item.items.map((grOpts, j) => (
                  <Item
                    key={getKey(grOpts, j)}
                    item={grOpts}
                    className={cn('pl-4', itemCls)}
                    indicatorAt={indicatorAt}
                  />
                ))}
              </SelectGroup>
            )
          }

          return (
            <Item key={getKey(item, i)} item={item} className={itemCls} indicatorAt={indicatorAt} />
          )
        })}
      </SelectContent>
    </Select>
  )
}

export {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectWrapper,
  type selectProps,
}
