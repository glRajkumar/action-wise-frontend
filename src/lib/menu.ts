import { itemTypeChecker } from './utils'

export const isSubMenu = itemTypeChecker<subMenuT>('submenu')
export const isGroupMenu = itemTypeChecker<menuGroupT>('group')
export const isInputSubMenu = itemTypeChecker<inputSubMenuT>('submenu')
export const isInputGroupMenu = itemTypeChecker<menuInputGroupT>('group')
