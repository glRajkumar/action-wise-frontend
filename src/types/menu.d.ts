type menuItemT =
  | allowedPrimitiveT
  | itemT
  | (itemT & {
      variant?: 'default' | 'destructive'
      shortcut?: string
      disabled?: boolean
    })

type menuGroupT = {
  group: string
  items: menuItemT[]
  className?: string
  groupLabelCls?: string
}

type subMenuT = {
  submenu: string
  items: (menuItemT | menuGroupT)[]
  triggerCls?: string
  contentCls?: string
}

type menuItemsT = (menuItemT | menuGroupT | subMenuT)[]

type menuInputItemT =
  | allowedPrimitiveT
  | itemT
  | (itemT & {
      disabled?: boolean
    })

type menuInputGroupT = {
  group: string
  items: menuInputItemT[]
  className?: string
  groupLabelCls?: string
}

type inputSubMenuT = {
  submenu: string
  items: (menuInputItemT | menuInputGroupT)[]
  triggerCls?: string
  contentCls?: string
}

type menuInputItemsT = (menuInputItemT | menuInputGroupT | inputSubMenuT)[]
