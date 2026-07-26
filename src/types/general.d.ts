type allowedPrimitiveT = string | number | boolean

type itemT = {
  label: React.ReactNode
  value: allowedPrimitiveT
  className?: string
  disabled?: boolean
}

type groupT = {
  group: string
  items: (allowedPrimitiveT | itemT)[]
  className?: string
}

type itemsT = (allowedPrimitiveT | itemT | groupT)[]

type indicatorAtT = 'right' | 'left' | ''
