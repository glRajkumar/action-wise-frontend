'use client'

import { useState } from 'react'
import { cn, getKey, getLabel, getValue, isSeparator, parseAllowedPrimitive } from '@/lib/utils'
import { isSubMenu, isGroupMenu, isInputSubMenu, isInputGroupMenu } from '@/lib/menu'

import {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuGroup,
  MenuLabel,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
} from '@/components/ui/menu'

type commonCheckboxProps = {
  checked?: allowedPrimitiveT[]
  indicatorAt?: indicatorAtT
  onCheckedChange?: (value: allowedPrimitiveT, checked: boolean) => void
}

type commonRadioProps = {
  value?: allowedPrimitiveT
  indicatorAt?: indicatorAtT
  onValueChange?: (value: allowedPrimitiveT) => void
}

type commonSubMenuT = {
  itemCls?: string
  groupCls?: string
  groupLabelCls?: string
}

type commonPropsT = {
  trigger: React.ReactNode
  triggerCls?: string
  triggerProps?: Omit<React.ComponentProps<typeof MenuTrigger>, 'children' | 'className'>
  itemCls?: string
  groupCls?: string
  groupLabelCls?: string
  contentProps?: React.ComponentProps<typeof MenuContent>
  onSelect?: (value: allowedPrimitiveT) => void
} & React.ComponentProps<typeof Menu>

type itemProps = {
  item: menuItemT
  className?: string
  onSelect?: () => void
}
function Item({ item, className, onSelect }: itemProps) {
  const value = getValue(item)

  if (isSeparator(value)) return <MenuSeparator className={cn(className)} />

  const label = getLabel(item)
  const opt: any = typeof item === 'object' ? item : {}
  const shortcut = opt?.shortcut

  return (
    <MenuItem {...opt} onSelect={onSelect} className={cn(className, opt?.className)}>
      {label}
      {shortcut && <MenuShortcut>{shortcut}</MenuShortcut>}
    </MenuItem>
  )
}

type checkboxItemProps = {
  item: menuInputItemT
  checked?: boolean
  className?: string
  indicatorAt?: indicatorAtT
  onCheckedChange?: (checked: boolean) => void
}
function CheckboxItem({
  item,
  className,
  checked = false,
  indicatorAt,
  onCheckedChange = () => {},
}: checkboxItemProps) {
  const value = getValue(item)

  if (isSeparator(value)) return <MenuSeparator className={cn(className)} />

  const label = getLabel(item)
  const disabled = (item as any)?.disabled

  return (
    <MenuCheckboxItem
      checked={checked}
      disabled={disabled}
      className={cn(className)}
      indicatorAt={indicatorAt}
      onCheckedChange={onCheckedChange}
    >
      {label}
    </MenuCheckboxItem>
  )
}

type radioItemProps = {
  item: menuInputItemT
  className?: string
  indicatorAt?: indicatorAtT
}
function RadioItem({ item, className, indicatorAt }: radioItemProps) {
  const value = getValue(item)

  if (isSeparator(value)) return <MenuSeparator className={cn(className)} />

  const label = getLabel(item)
  const disabled = (item as any)?.disabled

  return (
    <MenuRadioItem
      value={`${value}`}
      disabled={disabled}
      className={cn(className)}
      indicatorAt={indicatorAt}
    >
      {label}
    </MenuRadioItem>
  )
}

type SubMenuProps = commonSubMenuT & {
  submenu: subMenuT
  onSelect?: (value: allowedPrimitiveT) => void
}
function SubMenu({ submenu, itemCls, groupCls, groupLabelCls, onSelect }: SubMenuProps) {
  return (
    <MenuSub>
      <MenuSubTrigger className={cn(submenu.triggerCls)}>{submenu.submenu}</MenuSubTrigger>

      <MenuSubContent className={cn(submenu.contentCls)}>
        {submenu.items.map((item, i) => {
          if (isGroupMenu(item)) {
            return (
              <MenuGroup key={item.group} className={cn(groupCls, item.className)}>
                <MenuLabel
                  className={cn(
                    'pb-0.5 text-xs text-muted-foreground font-normal',
                    groupLabelCls,
                    item.groupLabelCls,
                  )}
                >
                  {item.group}
                </MenuLabel>

                {item.items.map((grOpt, j) => (
                  <Item
                    key={getKey(grOpt, j)}
                    item={grOpt}
                    className={itemCls}
                    onSelect={() => onSelect?.(getValue(grOpt))}
                  />
                ))}
              </MenuGroup>
            )
          }

          if (isSubMenu(item)) {
            return (
              <SubMenu
                key={getKey(item, i)}
                submenu={item}
                itemCls={itemCls}
                groupCls={groupCls}
                onSelect={onSelect}
              />
            )
          }

          return (
            <Item
              key={getKey(item, i)}
              item={item}
              className={itemCls}
              onSelect={() => onSelect?.(getValue(item))}
            />
          )
        })}
      </MenuSubContent>
    </MenuSub>
  )
}

type CheckboxSubMenuProps = commonSubMenuT &
  commonCheckboxProps & {
    submenu: inputSubMenuT
  }
function CheckboxSubMenu({
  submenu,
  itemCls,
  groupCls,
  groupLabelCls,
  checked = [],
  indicatorAt,
  onCheckedChange = () => {},
}: CheckboxSubMenuProps) {
  return (
    <MenuSub>
      <MenuSubTrigger className={cn(submenu.triggerCls)}>{submenu.submenu}</MenuSubTrigger>

      <MenuSubContent className={cn(submenu.contentCls)}>
        {submenu.items.map((item, i) => {
          if (isInputGroupMenu(item)) {
            return (
              <MenuGroup key={item.group} className={cn(groupCls, item.className)}>
                <MenuLabel
                  className={cn(
                    'pb-0.5 text-xs text-muted-foreground font-normal',
                    groupLabelCls,
                    item.groupLabelCls,
                  )}
                >
                  {item.group}
                </MenuLabel>

                {item.items.map((grOpt, j) => {
                  const v = getValue(grOpt)
                  return (
                    <CheckboxItem
                      key={getKey(grOpt, j)}
                      item={grOpt}
                      checked={checked.includes(v)}
                      className={itemCls}
                      indicatorAt={indicatorAt}
                      onCheckedChange={checked => onCheckedChange?.(v, checked)}
                    />
                  )
                })}
              </MenuGroup>
            )
          }

          if (isInputSubMenu(item)) {
            return (
              <CheckboxSubMenu
                key={item.submenu}
                submenu={item}
                checked={checked}
                itemCls={itemCls}
                groupCls={groupCls}
                indicatorAt={indicatorAt}
                groupLabelCls={groupLabelCls}
                onCheckedChange={onCheckedChange}
              />
            )
          }

          const v = getValue(item)
          return (
            <CheckboxItem
              key={getKey(item, i)}
              item={item}
              checked={checked.includes(v)}
              className={itemCls}
              indicatorAt={indicatorAt}
              onCheckedChange={checked => onCheckedChange?.(v, checked)}
            />
          )
        })}
      </MenuSubContent>
    </MenuSub>
  )
}

type RadioSubMenuProps = commonSubMenuT &
  commonRadioProps & {
    submenu: inputSubMenuT
  }
function RadioSubMenu({
  submenu,
  itemCls,
  groupCls,
  groupLabelCls,
  value = '',
  indicatorAt,
  onValueChange = () => {},
}: RadioSubMenuProps) {
  return (
    <MenuSub>
      <MenuSubTrigger className={cn(submenu.triggerCls)}>{submenu.submenu}</MenuSubTrigger>

      <MenuSubContent className={cn(submenu.contentCls)}>
        <MenuRadioGroup value={`${value}`} onValueChange={onValueChange}>
          {submenu.items.map((item, i) => {
            if (isInputGroupMenu(item)) {
              return (
                <MenuGroup key={item.group} className={cn(groupCls, item.className)}>
                  <MenuLabel
                    className={cn(
                      'pb-0.5 text-xs text-muted-foreground font-normal',
                      groupLabelCls,
                      item.groupLabelCls,
                    )}
                  >
                    {item.group}
                  </MenuLabel>

                  {item.items.map((grOpt, j) => (
                    <RadioItem
                      key={getKey(grOpt, j)}
                      item={grOpt}
                      className={itemCls}
                      indicatorAt={indicatorAt}
                    />
                  ))}
                </MenuGroup>
              )
            }

            if (isInputSubMenu(item)) {
              return (
                <RadioSubMenu
                  key={item.submenu}
                  value={value}
                  submenu={item}
                  itemCls={itemCls}
                  groupCls={groupCls}
                  indicatorAt={indicatorAt}
                  groupLabelCls={groupLabelCls}
                  onValueChange={onValueChange}
                />
              )
            }

            return (
              <RadioItem
                key={getKey(item, i)}
                item={item}
                className={itemCls}
                indicatorAt={indicatorAt}
              />
            )
          })}
        </MenuRadioGroup>
      </MenuSubContent>
    </MenuSub>
  )
}

type MenuWrapperProps = commonPropsT & {
  items: menuItemsT
}
function MenuWrapper({
  trigger,
  items,
  triggerCls,
  triggerProps,
  itemCls,
  groupCls,
  groupLabelCls,
  contentProps,
  onSelect,
  ...props
}: MenuWrapperProps) {
  return (
    <Menu {...props}>
      <MenuTrigger className={cn(triggerCls)} {...triggerProps}>
        {trigger}
      </MenuTrigger>

      <MenuContent {...contentProps}>
        {items.map((item, i) => {
          if (isGroupMenu(item)) {
            return (
              <MenuGroup key={item.group} className={cn(groupCls, item.className)}>
                <MenuLabel
                  className={cn(
                    'pb-0.5 text-xs text-muted-foreground font-normal',
                    groupLabelCls,
                    item.groupLabelCls,
                  )}
                >
                  {item.group}
                </MenuLabel>

                {item.items.map((grOpt, j) => (
                  <Item
                    key={getKey(grOpt, j)}
                    item={grOpt}
                    className={itemCls}
                    onSelect={() => onSelect?.(getValue(grOpt))}
                  />
                ))}
              </MenuGroup>
            )
          }

          if (isSubMenu(item)) {
            return (
              <SubMenu
                key={item.submenu}
                submenu={item}
                itemCls={itemCls}
                groupCls={groupCls}
                groupLabelCls={groupLabelCls}
                onSelect={onSelect}
              />
            )
          }

          return (
            <Item
              key={getKey(item, i)}
              item={item}
              className={itemCls}
              onSelect={() => onSelect?.(getValue(item))}
            />
          )
        })}
      </MenuContent>
    </Menu>
  )
}

type MenuCheckboxWrapperProps = commonPropsT &
  commonCheckboxProps & {
    items: menuInputItemsT
  }
function MenuCheckboxWrapper({
  trigger,
  items,
  triggerCls,
  triggerProps,
  contentProps,
  itemCls,
  groupCls,
  groupLabelCls,
  checked: o_checked,
  onCheckedChange: o_onCheckedChange,
  indicatorAt,
  ...props
}: MenuCheckboxWrapperProps) {
  const [i_checked, setIChecked] = useState<allowedPrimitiveT[]>([])

  function i_Checked(v: allowedPrimitiveT, c: boolean) {
    setIChecked(prev => (!c ? prev.filter(p => p !== v) : [...prev, v]))
  }

  const checked = o_checked ?? i_checked
  const onCheckedChange = o_onCheckedChange ?? i_Checked

  return (
    <Menu {...props}>
      <MenuTrigger className={cn(triggerCls)} {...triggerProps}>
        {trigger}
      </MenuTrigger>

      <MenuContent {...contentProps}>
        {items.map((item, i) => {
          if (isInputGroupMenu(item)) {
            return (
              <MenuGroup key={item.group} className={cn(groupCls, item.className)}>
                <MenuLabel
                  className={cn(
                    'pb-0.5 text-xs text-muted-foreground font-normal',
                    groupLabelCls,
                    item.groupLabelCls,
                  )}
                >
                  {item.group}
                </MenuLabel>

                {item.items.map((grOpt, j) => {
                  const v = getValue(grOpt)
                  return (
                    <CheckboxItem
                      key={getKey(grOpt, j)}
                      item={grOpt}
                      checked={checked.includes(v)}
                      className={itemCls}
                      indicatorAt={indicatorAt}
                      onCheckedChange={checked => onCheckedChange?.(v, checked)}
                    />
                  )
                })}
              </MenuGroup>
            )
          }

          if (isInputSubMenu(item)) {
            return (
              <CheckboxSubMenu
                key={item.submenu}
                submenu={item}
                checked={checked}
                itemCls={itemCls}
                groupCls={groupCls}
                indicatorAt={indicatorAt}
                groupLabelCls={groupLabelCls}
                onCheckedChange={onCheckedChange}
              />
            )
          }

          const v = getValue(item)
          return (
            <CheckboxItem
              key={getKey(item, i)}
              item={item}
              checked={checked.includes(v)}
              className={itemCls}
              indicatorAt={indicatorAt}
              onCheckedChange={checked => onCheckedChange?.(v, checked)}
            />
          )
        })}
      </MenuContent>
    </Menu>
  )
}

type MenuRadioWrapperProps = commonPropsT &
  commonRadioProps & {
    items: menuInputItemsT
  }
function MenuRadioWrapper({
  trigger,
  items,
  triggerCls,
  triggerProps,
  itemCls,
  groupCls,
  groupLabelCls,
  contentProps,
  value: o_value,
  onValueChange: o_onValueChange,
  indicatorAt,
  ...props
}: MenuRadioWrapperProps) {
  const [i_value, setIValue] = useState<allowedPrimitiveT>('')

  const value = o_value ?? i_value
  const onValueChange = o_onValueChange ?? setIValue

  return (
    <Menu {...props}>
      <MenuTrigger className={cn(triggerCls)} {...triggerProps}>
        {trigger}
      </MenuTrigger>

      <MenuContent {...contentProps}>
        <MenuRadioGroup
          value={`${value}`}
          onValueChange={v => onValueChange(parseAllowedPrimitive(v))}
        >
          {items.map((item, i) => {
            if (isInputGroupMenu(item)) {
              return (
                <MenuGroup key={item.group} className={cn(groupCls, item.className)}>
                  <MenuLabel
                    className={cn(
                      'pb-0.5 text-xs text-muted-foreground font-normal',
                      groupLabelCls,
                      item.groupLabelCls,
                    )}
                  >
                    {item.group}
                  </MenuLabel>

                  {item.items.map((grOpt, j) => (
                    <RadioItem
                      key={getKey(grOpt, j)}
                      item={grOpt}
                      className={itemCls}
                      indicatorAt={indicatorAt}
                    />
                  ))}
                </MenuGroup>
              )
            }

            if (isInputSubMenu(item)) {
              return (
                <RadioSubMenu
                  key={item.submenu}
                  value={value}
                  submenu={item}
                  itemCls={itemCls}
                  groupCls={groupCls}
                  indicatorAt={indicatorAt}
                  groupLabelCls={groupLabelCls}
                  onValueChange={v => onValueChange(parseAllowedPrimitive(v))}
                />
              )
            }

            return (
              <RadioItem
                key={getKey(item, i)}
                item={item}
                className={itemCls}
                indicatorAt={indicatorAt}
              />
            )
          })}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  )
}

export { MenuWrapper, MenuCheckboxWrapper, MenuRadioWrapper }
