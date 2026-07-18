"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import * as RPNInput from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void
  }

const PhoneInput = React.forwardRef<
  React.ElementRef<typeof RPNInput.default>,
  PhoneInputProps
>(({ className, onChange, value, ...props }, ref) => {
  return (
    <RPNInput.default
      ref={ref}
      className={cn("flex w-full", className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      smartCaret={false}
      value={value || undefined}
      onChange={(next) => onChange?.(next || ("" as RPNInput.Value))}
      {...props}
    />
  )
})
PhoneInput.displayName = "PhoneInput"

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <Input
    className={cn("rounded-s-none rounded-e-lg", className)}
    {...props}
    ref={ref}
  />
))
InputComponent.displayName = "InputComponent"

type CountryEntry = { label: string; value: RPNInput.Country | undefined }

type CountrySelectProps = {
  disabled?: boolean
  value: RPNInput.Country
  options: CountryEntry[]
  onChange: (country: RPNInput.Country) => void
}

function CountrySelect({
  disabled,
  value: selectedCountry,
  options: countryList,
  onChange,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return countryList
    return countryList.filter(({ label, value }) => {
      if (!value) return false
      return (
        label.toLowerCase().includes(q) ||
        value.toLowerCase().includes(q) ||
        `+${RPNInput.getCountryCallingCode(value)}`.includes(q)
      )
    })
  }, [countryList, search])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setSearch("")
      }}
    >
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "flex h-8 gap-1 rounded-s-lg rounded-e-none border-r-0 px-2 focus-visible:z-10"
        )}
      >
        <FlagComponent
          country={selectedCountry}
          countryName={selectedCountry}
        />
        <ChevronsUpDownIcon
          className={cn(
            "size-3.5 opacity-50",
            disabled ? "hidden" : "opacity-100"
          )}
        />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="border-b p-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country…"
            className="h-8"
            autoFocus
          />
        </div>
        <ScrollArea className="h-64">
          <div className="p-1">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground px-2 py-3 text-sm">
                No country found.
              </p>
            ) : (
              filtered.map(({ value, label }) =>
                value ? (
                  <button
                    key={value}
                    type="button"
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                      value === selectedCountry && "bg-accent"
                    )}
                    onClick={() => {
                      onChange(value)
                      setOpen(false)
                    }}
                  >
                    <FlagComponent country={value} countryName={label} />
                    <span className="min-w-0 flex-1 truncate text-left">
                      {label}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      +{RPNInput.getCountryCallingCode(value)}
                    </span>
                    <CheckIcon
                      className={cn(
                        "size-4",
                        value === selectedCountry ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </button>
                ) : null
              )
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

function FlagComponent({ country, countryName }: RPNInput.FlagProps) {
  const Flag = flags[country]
  return (
    <span className="bg-foreground/5 flex h-4 w-6 overflow-hidden rounded-sm [&_svg]:size-full">
      {Flag ? <Flag title={countryName} /> : null}
    </span>
  )
}

export { PhoneInput }
