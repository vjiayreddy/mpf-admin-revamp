"use client"

import {
  GroupedMultiAutocomplete,
  type GroupedMultiOption,
} from "@/components/embroidery/ops-form/grouped-multi-autocomplete"

type WorkAreaGroupedAutocompleteProps = {
  options: GroupedMultiOption[]
  value: string[]
  onChange: (ids: string[]) => void
  loading?: boolean
  disabled?: boolean
  label?: string
  id?: string
  error?: string
  required?: boolean
}

export function WorkAreaGroupedAutocomplete({
  options,
  value,
  onChange,
  loading,
  disabled,
  label = "Work areas",
  id,
  error,
  required,
}: WorkAreaGroupedAutocompleteProps) {
  return (
    <GroupedMultiAutocomplete
      id={id}
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      loading={loading}
      disabled={disabled}
      error={error}
      required={required}
      searchPlaceholder="Search work areas…"
      emptyPlaceholder="No work areas for this product"
      noMatchPlaceholder="No work areas match"
      loadingPlaceholder="Loading work areas…"
    />
  )
}
