"use client"

import { useId, type ReactNode } from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const selectClassName = cn(
  "border-input bg-transparent h-8 w-full min-w-0 rounded-lg border px-2.5 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

type FilterSelectProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: ReadonlyArray<{ value: string; label: string }>
  className?: string
  allowEmpty?: boolean
  emptyLabel?: string
  disabled?: boolean
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
  allowEmpty = false,
  emptyLabel = "Any",
  disabled,
}: FilterSelectProps) {
  const id = useId()
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="text-muted-foreground text-xs font-normal">
        {label}
      </Label>
      <select
        id={id}
        className={selectClassName}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {allowEmpty ? <option value="">{emptyLabel}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

type FilterDateFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function FilterDateField({
  label,
  value,
  onChange,
  className,
}: FilterDateFieldProps) {
  const id = useId()
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="text-muted-foreground text-xs font-normal">
        {label}
      </Label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClassName}
      />
    </div>
  )
}

type FilterFieldsetProps = {
  legend: string
  children: ReactNode
}

export function FilterFieldset({ legend, children }: FilterFieldsetProps) {
  return (
    <fieldset className="space-y-3 rounded-lg border p-3">
      <legend className="px-1 text-sm font-medium">{legend}</legend>
      {children}
    </fieldset>
  )
}
