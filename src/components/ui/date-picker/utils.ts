import { format } from 'date-fns'
import { type DateRange } from '@daypicker/react'

export type MinuteStep = 1 | 5 | 10 | 15 | 20 | 30
export type HourFormat = 12 | 24

export type Selected = Date | Date[] | DateRange | undefined

export function formatSelected(selected: Selected, fmt: string): string | null {
  if (!selected) return null
  if (selected instanceof Date) return format(selected, fmt)
  if (Array.isArray(selected)) {
    if (!selected.length) return null
    return selected.length === 1 ? format(selected[0]!, fmt) : `${selected.length} dates selected`
  }
  const range = selected as DateRange
  if (!range.from) return null
  if (!range.to) return format(range.from, fmt)
  return `${format(range.from, fmt)} - ${format(range.to, fmt)}`
}

export function getDefaultMonth(selected: Selected): Date | undefined {
  if (!selected) return undefined
  if (selected instanceof Date) return selected
  if (Array.isArray(selected)) return selected[0]
  return (selected as DateRange).from
}

export function snapToStep(minutes: number, step: number): number {
  const snapped = Math.round(minutes / step) * step
  return snapped >= 60 ? 0 : snapped
}

export function snapTimeForward(
  baseHour: number,
  minMinute: number,
  step: number,
): { hours: number; minutes: number } {
  const snapped = Math.ceil(minMinute / step) * step
  if (snapped >= 60) return { hours: baseHour + 1, minutes: 0 }
  return { hours: baseHour, minutes: snapped }
}

export function defaultNow(step: number): Date {
  const n = new Date()
  n.setMinutes(snapToStep(n.getMinutes(), step))
  n.setSeconds(0)
  n.setMilliseconds(0)
  return n
}

export function startOfDay(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
