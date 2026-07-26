import { isValidElement, type ReactNode } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isAllowedPrimitive(value: unknown): value is allowedPrimitiveT {
  return ['string', 'number', 'boolean'].includes(typeof value)
}

export function parseAllowedPrimitive(value: allowedPrimitiveT): allowedPrimitiveT {
  if (typeof value !== 'string') return value

  const trimmed = value.trim()

  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed)

  return trimmed
}

export function itemTypeChecker<T>(key: keyof T) {
  return (option: any): option is T => !!option && typeof option === 'object' && key in option
}

export const isSeparator = (item: any) => item === '---'
export const isOption = itemTypeChecker<itemT>('value')
export const isGroup = itemTypeChecker<groupT>('group')

export const getValue = (item: allowedPrimitiveT | itemT) =>
  typeof item === 'object' ? item.value : item
export const getLabel = (item: allowedPrimitiveT | itemT) =>
  typeof item === 'object' ? item.label : `${item}`

export function getKey(item: allowedPrimitiveT | itemT, i: number): string {
  const val = getValue(item)
  if (typeof val === 'boolean') return `key-${val}`
  if (val === '---') return `---${i}`
  return `${val}`
}

export function extractText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (isValidElement(node)) return extractText((node.props as { children?: ReactNode }).children)
  if (Array.isArray(node)) return node.map(extractText).join('')
  return ''
}
