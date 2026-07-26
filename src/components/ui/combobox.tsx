'use client'

import * as React from 'react'
import { ChevronDownIcon, XIcon, CheckIcon, Loader2 } from 'lucide-react'
import { Combobox as ComboboxPrimitive } from '@base-ui/react'

import {
  cn,
  extractText,
  getKey,
  getLabel,
  getValue,
  isGroup,
  isOption,
  isSeparator,
} from '@/lib/utils'

const ComboboxRoot = ComboboxPrimitive.Root

function ComboboxValue(props: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

function ComboboxIcon({ className, ...props }: ComboboxPrimitive.Icon.Props) {
  return (
    <ComboboxPrimitive.Icon
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground',
        'transition-colors hover:bg-accent hover:text-foreground',
        '[&_svg]:pointer-events-none',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </ComboboxPrimitive.Icon>
  )
}

function ComboboxTrigger({ className, children, ...props }: ComboboxPrimitive.Trigger.Props) {
  return (
    <ComboboxPrimitive.Trigger data-slot="combobox-trigger" className={cn(className)} {...props}>
      {children}
    </ComboboxPrimitive.Trigger>
  )
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      className={cn(
        'flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground',
        'transition-colors hover:bg-accent hover:text-foreground',
        '[&_svg]:pointer-events-none',
        className,
      )}
      {...props}
    >
      <XIcon className="size-3.5" />
    </ComboboxPrimitive.Clear>
  )
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean
  showClear?: boolean
}) {
  return (
    <ComboboxPrimitive.InputGroup
      data-slot="combobox-input-group"
      className={cn(
        'relative flex h-9 w-full items-center gap-0.5 rounded-md border border-input bg-transparent pl-3 pr-1 text-sm shadow-xs',
        'transition-colors',
        'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        'has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20',
        'dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40',
        className,
      )}
    >
      <ComboboxPrimitive.Input
        disabled={disabled}
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        )}
        {...props}
      />
      <div className="flex shrink-0 items-center ml-auto">
        {showClear && <ComboboxClear disabled={disabled} />}
        {showTrigger && (
          <ComboboxTrigger disabled={disabled}>
            <ComboboxIcon />
          </ComboboxTrigger>
        )}
      </div>
      {children}
    </ComboboxPrimitive.InputGroup>
  )
}

function ComboboxContent({
  className,
  side = 'bottom',
  sideOffset = 4,
  align = 'start',
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    'side' | 'align' | 'sideOffset' | 'alignOffset' | 'anchor'
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          data-chips={!!anchor}
          className={cn(
            'group/combobox-content relative overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
            'max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin)',
            'min-w-[max(var(--anchor-width),10rem)] data-[chips=true]:min-w-(--anchor-width)',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
            'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        'max-h-(--available-height) overflow-y-auto overscroll-contain scroll-py-1 p-1',
        'data-empty:hidden',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxItem({
  children,
  className,
  indicatorAt,
  ...props
}: ComboboxPrimitive.Item.Props & { indicatorAt?: indicatorAtT }) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 text-sm outline-none',
        'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
        indicatorAt === '' ? 'px-2' : indicatorAt === 'right' ? 'pl-2 pr-8' : 'pl-8 pr-2',
      )}
      {...props}
    >
      {children}
      {indicatorAt !== '' && (
        <ComboboxPrimitive.ItemIndicator
          className={cn(
            'pointer-events-none absolute flex size-4 items-center justify-center text-foreground',
            indicatorAt === 'right' ? 'right-2' : 'left-2',
          )}
        >
          <CheckIcon className="size-3.5" />
        </ComboboxPrimitive.ItemIndicator>
      )}
    </ComboboxPrimitive.Item>
  )
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn('pb-1', className)}
      {...props}
    />
  )
}

function ComboboxLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  )
}

function ComboboxCollection(props: ComboboxPrimitive.Collection.Props) {
  return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn('text-center text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function ComboboxSeparator({ className, ...props }: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> & ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        'flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent pl-3 pr-1 py-1 text-sm shadow-xs',
        'transition-colors',
        'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
        'has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20',
        'dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxChip({
  children,
  className,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & { showRemove?: boolean }) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        'flex h-5.5 w-fit items-center gap-1 rounded-sm bg-secondary px-1.5 text-xs font-medium text-secondary-foreground whitespace-nowrap',
        'data-highlighted:bg-accent data-highlighted:text-accent-foreground',
        'has-disabled:pointer-events-none has-disabled:opacity-50',
        showRemove && 'pr-0.5',
        className,
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          data-slot="combobox-chip-remove"
          className={cn(
            'ml-0.5 flex size-4 items-center justify-center rounded-sm text-muted-foreground',
            'transition-colors hover:bg-accent hover:text-foreground',
            '[&_svg]:pointer-events-none',
          )}
          aria-label="Remove"
        >
          <XIcon className="size-3" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  )
}

function ComboboxChipsInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-chips-input"
      className={cn(
        'min-w-16 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxStatus({ className, ...props }: ComboboxPrimitive.Status.Props) {
  return (
    <ComboboxPrimitive.Status
      data-slot="combobox-status"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

type OptionItemProps = {
  item: allowedPrimitiveT | itemT
  className?: string
  indicatorAt?: indicatorAtT
}

function OptionItem({ item, className, indicatorAt }: OptionItemProps) {
  const value = getValue(item)
  const label = getLabel(item)
  const optCls = isOption(item) ? item.className : undefined
  const disabled = isOption(item) ? item.disabled : undefined

  return (
    <ComboboxItem
      value={value}
      className={cn(className, optCls)}
      indicatorAt={indicatorAt}
      disabled={disabled}
    >
      {label}
    </ComboboxItem>
  )
}

type OptionsBodyProps = {
  item: itemsT[number]
  index: number
  itemCls?: string
  groupCls?: string
  indicatorAt?: indicatorAtT
}

function OptionsBody({ item, index, itemCls, groupCls, indicatorAt }: OptionsBodyProps) {
  if (isGroup(item)) {
    return (
      <ComboboxGroup
        items={item.items as (allowedPrimitiveT | itemT)[]}
        className={cn(groupCls, item.className)}
      >
        <ComboboxLabel>{item.group}</ComboboxLabel>
        <ComboboxCollection>
          {(opt: allowedPrimitiveT | itemT, i) => (
            <OptionItem
              key={getKey(opt, i)}
              item={opt}
              className={cn(itemCls)}
              indicatorAt={indicatorAt}
            />
          )}
        </ComboboxCollection>
      </ComboboxGroup>
    )
  }

  if (isSeparator(item)) {
    return <ComboboxSeparator key={`sep-${index}`} />
  }

  return (
    <OptionItem
      key={getKey(item as allowedPrimitiveT | itemT, index)}
      item={item as allowedPrimitiveT | itemT}
      className={cn(itemCls)}
      indicatorAt={indicatorAt}
    />
  )
}

type ComboboxWrapperProps<
  Value = unknown,
  Multiple extends boolean | undefined = boolean | undefined,
> = Omit<ComboboxPrimitive.Root.Props<Value, Multiple>, 'items'> & {
  items?: itemsT
  isLoading?: boolean
  placeholder?: string
  emptyMessage?: string
  triggerCls?: string
  contentCls?: string
  groupCls?: string
  itemCls?: string
  indicatorAt?: indicatorAtT
  showTrigger?: boolean
  showClear?: boolean
  inputProps?: React.ComponentProps<'input'>
  hideList?: boolean
  renderValue?: (value: string, item: allowedPrimitiveT | itemT | undefined) => React.ReactNode
  getItemLabel?: (value: string) => string
  renderStatus?: React.ReactNode
  renderEmpty?: React.ReactNode
}

function ComboboxWrapper<Value, Multiple extends boolean | undefined = false>({
  isLoading,
  placeholder,
  emptyMessage,
  triggerCls,
  contentCls,
  groupCls,
  itemCls,
  indicatorAt = 'right',
  showTrigger = true,
  showClear = false,
  multiple,
  disabled,
  inputProps,
  hideList,
  renderValue,
  getItemLabel,
  renderStatus,
  renderEmpty,
  items,
  ...props
}: ComboboxWrapperProps<Value, Multiple>) {
  const multiAnchor = React.useRef<HTMLDivElement | null>(null)

  const { labelMap, labelStringMap, optionMap } = React.useMemo(() => {
    const labelMap: Record<string, React.ReactNode> = {}
    const labelStringMap: Record<string, string> = {}
    const optionMap: Record<string, allowedPrimitiveT | itemT> = {}
    if (!items) return { labelMap, labelStringMap, optionMap }
    const process = (opts: itemsT) => {
      for (const opt of opts) {
        if (isGroup(opt)) {
          process(opt.items as itemsT)
        } else {
          const o = opt as allowedPrimitiveT | itemT
          const val = getValue(o)
          if (!isSeparator(val)) {
            const key = String(val)
            const label = getLabel(o)
            labelMap[key] = label
            labelStringMap[key] =
              typeof label === 'string' ? label : extractText(label).trim() || key
            optionMap[key] = o
          }
        }
      }
    }
    process(items)
    return { labelMap, labelStringMap, optionMap }
  }, [items])

  const hasPopupInput = !multiple && !!renderValue

  return (
    <ComboboxRoot
      multiple={multiple}
      disabled={disabled}
      items={(items ?? []) as unknown[]}
      itemToStringLabel={item => {
        const key = String(getValue(item as allowedPrimitiveT | itemT))
        if (getItemLabel) return getItemLabel(key)
        return labelStringMap[key] ?? key
      }}
      {...props}
    >
      {multiple ? (
        <ComboboxChips ref={multiAnchor} className={cn('w-full', triggerCls)}>
          <ComboboxValue>
            {(values: allowedPrimitiveT[]) => (
              <>
                {values?.map(v => (
                  <ComboboxChip key={String(v)}>
                    {renderValue
                      ? renderValue(String(v), optionMap[String(v)])
                      : (labelMap[String(v)] ?? String(v))}
                  </ComboboxChip>
                ))}

                <ComboboxChipsInput placeholder={placeholder} disabled={disabled} {...inputProps} />

                {(showClear || showTrigger) && (
                  <div className="flex shrink-0 items-center ml-auto">
                    {showClear && <ComboboxClear disabled={disabled} />}
                    {showTrigger && (
                      <ComboboxTrigger disabled={disabled}>
                        <ComboboxIcon />
                      </ComboboxTrigger>
                    )}
                  </div>
                )}
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
      ) : hasPopupInput ? (
        <ComboboxTrigger
          className={cn(
            'flex h-9 w-full items-center gap-1.5 rounded-md border border-input bg-transparent pl-3 pr-1 text-sm shadow-xs',
            'transition-colors outline-none select-none',
            'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-input/30',
          )}
          render={<div />}
          nativeButton={false}
        >
          <ComboboxValue>
            {v => (
              <>
                {!v ? (
                  <span className=" text-muted-foreground">{placeholder}</span>
                ) : renderValue ? (
                  renderValue(String(v), optionMap[String(v)])
                ) : (
                  (labelMap[String(v)] ?? String(v))
                )}
              </>
            )}
          </ComboboxValue>

          <div className="flex shrink-0 items-center ml-auto">
            {showClear && <ComboboxClear disabled={disabled} />}
            {showTrigger && <ComboboxIcon />}
          </div>
        </ComboboxTrigger>
      ) : (
        <ComboboxInput
          disabled={disabled}
          showClear={showClear}
          showTrigger={showTrigger}
          placeholder={placeholder}
          className={cn('w-full', triggerCls)}
          {...inputProps}
        />
      )}

      <ComboboxContent
        anchor={multiple ? multiAnchor : undefined}
        className={cn(contentCls, hideList && 'hidden')}
      >
        {hasPopupInput && (
          <div className="px-2 pt-2">
            <ComboboxInput
              disabled={disabled}
              showTrigger={false}
              placeholder={placeholder}
              className={cn('w-full focus-within:ring-1', triggerCls)}
              {...inputProps}
            />
          </div>
        )}

        <ComboboxStatus>
          {renderStatus !== undefined
            ? renderStatus
            : isLoading && (
                <p className="flex items-center justify-center gap-2 py-6">
                  <Loader2 className="size-4 animate-spin" /> Loading...
                </p>
              )}
        </ComboboxStatus>

        <ComboboxEmpty>
          {renderEmpty !== undefined
            ? renderEmpty
            : !isLoading && <p className="py-6">{emptyMessage ?? 'No items found'}</p>}
        </ComboboxEmpty>

        <ComboboxList>
          {(item: itemT, i: number) => (
            <OptionsBody
              key={
                isGroup(item)
                  ? item.group
                  : isSeparator(item)
                    ? `sep-${i}`
                    : String(getValue(item as allowedPrimitiveT | itemT))
              }
              item={item as itemsT[number]}
              index={i}
              groupCls={groupCls}
              itemCls={itemCls}
              indicatorAt={indicatorAt}
            />
          )}
        </ComboboxList>
      </ComboboxContent>
    </ComboboxRoot>
  )
}

export {
  ComboboxRoot,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxIcon,
  ComboboxClear,
  ComboboxValue,
  ComboboxStatus,
  useComboboxAnchor,
  ComboboxWrapper,
  type ComboboxWrapperProps,
}
