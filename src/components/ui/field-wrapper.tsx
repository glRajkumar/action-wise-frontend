'use client'

import { cn, parseAllowedPrimitive } from '@/lib/utils'

import { Field, FieldLabel, FieldSet, FieldLegend, FieldError } from './field'
import { AutocompleteWrapper as Autocomplete } from './autocomplete'
import { InputGroupWrapper as InputGroup } from './input-group'
import { InputOTPWrapper as InputOTP } from './input-otp'
import { ComboboxWrapper as Combobox } from './combobox'
import { CheckboxWrapper as Checkbox } from './checkbox'
import { SelectWrapper as Select } from './select'
import { RadioWrapper as Radio } from './radio'
import { NumberFieldWrapper } from './number-field'
import { DatePicker } from './date-picker'
import { Textarea } from './textarea'
import { Slider } from './slider'
import { Switch } from './switch'
import { Input } from './input'

type BaseProps = {
  name: string
  label?: React.ReactNode
  error?: { message?: string }
  invalid?: boolean
  className?: string
}

function labelString(label: React.ReactNode): string | undefined {
  return typeof label === 'string' ? label : undefined
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>
export function InputWrapper({
  name,
  label,
  error,
  invalid,
  className,
  type = 'text',
  placeholder,
  ...props
}: InputProps) {
  const isInvalid = invalid || !!error

  return (
    <Field className={className} invalid={isInvalid}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder || (labelString(label) && `Enter ${labelString(label)}`)}
        aria-invalid={isInvalid}
        {...props}
      />
      <FieldError errors={[error]} />
    </Field>
  )
}

type TextareaProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
export function TextareaWrapper({
  name,
  label,
  error,
  invalid,
  className,
  placeholder,
  ...rest
}: TextareaProps) {
  const isInvalid = invalid || !!error

  return (
    <Field className={className} invalid={isInvalid}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Textarea
        id={name}
        name={name}
        placeholder={placeholder || (labelString(label) && `Enter ${labelString(label)}`)}
        aria-invalid={isInvalid}
        {...rest}
      />
      <FieldError errors={[error]} />
    </Field>
  )
}

type RadioProps = BaseProps &
  Omit<React.ComponentProps<typeof Radio>, 'value' | 'onValueChange' | 'as'> & {
    value?: allowedPrimitiveT
    onValueChange?: (value: allowedPrimitiveT) => void
  }
export function RadioWrapper({
  name,
  label,
  error,
  invalid,
  className,
  value,
  onValueChange,
  ...props
}: RadioProps) {
  const isInvalid = invalid || !!error

  return (
    <FieldSet className={cn(className)}>
      {label && <FieldLegend variant="label">{label}</FieldLegend>}
      <Radio
        {...props}
        value={value != null ? String(value) : undefined}
        onValueChange={val => onValueChange?.(parseAllowedPrimitive(val))}
        aria-invalid={isInvalid}
      />
      <FieldError errors={[error]} />
    </FieldSet>
  )
}

type CheckboxProps = BaseProps &
  Omit<React.ComponentProps<typeof Checkbox>, 'value' | 'onValueChange' | 'as'> & {
    value?: allowedPrimitiveT[]
    onValueChange?: (value: allowedPrimitiveT[]) => void
  }
export function CheckboxWrapper({
  name,
  label,
  error,
  invalid,
  className,
  value = [],
  onValueChange,
  ...props
}: CheckboxProps) {
  const isInvalid = invalid || !!error

  return (
    <FieldSet className={cn(className)}>
      {label && <FieldLegend variant="label">{label}</FieldLegend>}
      <Checkbox
        orientation="horizontal"
        {...props}
        value={value.map(String)}
        onValueChange={vals => onValueChange?.(vals.map(parseAllowedPrimitive))}
        aria-invalid={isInvalid}
      />
      <FieldError errors={[error]} />
    </FieldSet>
  )
}

type SwitchProps = BaseProps & {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}
export function SwitchWrapper({
  name,
  label,
  error,
  invalid,
  className,
  checked,
  onCheckedChange,
}: SwitchProps) {
  const isInvalid = invalid || !!error

  return (
    <Field className={className} invalid={isInvalid}>
      <div className="flex items-center justify-between gap-4">
        {label && (
          <FieldLabel htmlFor={name} className="font-normal">
            {label}
          </FieldLabel>
        )}
        <Switch
          id={name}
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label={typeof label === 'string' ? label : name}
          aria-invalid={isInvalid}
        />
      </div>
      <FieldError errors={[error]} />
    </Field>
  )
}

type SelectProps = BaseProps &
  Omit<React.ComponentProps<typeof Select>, 'value' | 'onValueChange'> & {
    value?: allowedPrimitiveT
    onValueChange?: (value: allowedPrimitiveT) => void
  }
export function SelectWrapper({
  name,
  label,
  error,
  invalid,
  className,
  items,
  placeholder,
  value,
  onValueChange,
  ...props
}: SelectProps) {
  const isInvalid = invalid || !!error

  return (
    <Field className={className} invalid={isInvalid}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Select
        {...props}
        id={name}
        items={items}
        value={value != null ? String(value) : undefined}
        placeholder={placeholder ?? (labelString(label) && `Select ${labelString(label)}`)}
        onValueChange={val => onValueChange?.(parseAllowedPrimitive(val as any))}
        aria-invalid={isInvalid}
      />
      <FieldError errors={[error]} />
    </Field>
  )
}

type DatePickerFieldProps = BaseProps &
  Omit<React.ComponentProps<typeof DatePicker>, 'selected' | 'onSelect'> & {
    value?: Date
    onSelect?: (date: Date | undefined) => void
  }
export function DatePickerWrapper({
  name,
  label,
  error,
  invalid,
  className,
  value,
  onSelect,
  ...pickerProps
}: DatePickerFieldProps) {
  const isInvalid = invalid || !!error

  return (
    <Field className={className} invalid={isInvalid}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <DatePicker
        selected={value}
        onSelect={onSelect}
        triggerProps={{ id: name, 'aria-invalid': isInvalid }}
        {...pickerProps}
      />
      <FieldError errors={[error]} />
    </Field>
  )
}

type ComboboxProps = BaseProps & React.ComponentProps<typeof Combobox>
export function ComboboxWrapper({
  name,
  label,
  error,
  invalid,
  className,
  placeholder,
  value,
  onValueChange,
  ...rest
}: ComboboxProps) {
  const isInvalid = invalid || !!error

  return (
    <Field className={className} invalid={isInvalid}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Combobox
        {...rest}
        id={name}
        value={value}
        placeholder={placeholder || (labelString(label) && `Select ${labelString(label)}`)}
        onValueChange={onValueChange}
        aria-invalid={isInvalid}
      />
      <FieldError errors={[error]} />
    </Field>
  )
}

type NumberProps = BaseProps &
  Omit<React.ComponentProps<typeof NumberFieldWrapper>, 'name' | 'id' | 'className'>
export function NumberWrapper({ name, label, error, invalid, className, ...props }: NumberProps) {
  const isInvalid = invalid || !!error

  return (
    <Field className={className} invalid={isInvalid}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <NumberFieldWrapper id={name} name={name} aria-invalid={isInvalid} {...props} />
      <FieldError errors={[error]} />
    </Field>
  )
}

type SliderProps = BaseProps & Omit<React.ComponentProps<typeof Slider>, 'name'>
export function SliderWrapper({ name, label, error, invalid, className, ...props }: SliderProps) {
  const isInvalid = invalid || !!error

  return (
    <Field className={className} invalid={isInvalid}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Slider name={name} aria-invalid={isInvalid} {...props} />
      <FieldError errors={[error]} />
    </Field>
  )
}

type AutocompleteProps = BaseProps & Omit<React.ComponentProps<typeof Autocomplete>, 'className'>
export function AutocompleteWrapper({
  name,
  label,
  error,
  invalid,
  className,
  ...props
}: AutocompleteProps) {
  const isInvalid = invalid || !!error

  return (
    <Field className={className} invalid={isInvalid}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <Autocomplete aria-invalid={isInvalid} {...props} />
      <FieldError errors={[error]} />
    </Field>
  )
}

type OTPProps = BaseProps & Omit<React.ComponentProps<typeof InputOTP>, 'className'>
export function OTPWrapper({ name, label, error, invalid, className, ...props }: OTPProps) {
  const isInvalid = invalid || !!error

  return (
    <Field className={className} invalid={isInvalid}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <InputOTP name={name} aria-invalid={isInvalid} {...props} />
      <FieldError errors={[error]} />
    </Field>
  )
}

type InputGroupFieldProps = BaseProps &
  Omit<React.ComponentProps<typeof InputGroup>, 'wrapperClassName'>
export function InputGroupWrapper({
  name,
  label,
  error,
  invalid,
  className,
  ...props
}: InputGroupFieldProps) {
  const isInvalid = invalid || !!error

  return (
    <Field className={className} invalid={isInvalid}>
      {label && <FieldLabel htmlFor={name}>{label}</FieldLabel>}
      <InputGroup id={name} name={name} aria-invalid={isInvalid} {...props} />
      <FieldError errors={[error]} />
    </Field>
  )
}
