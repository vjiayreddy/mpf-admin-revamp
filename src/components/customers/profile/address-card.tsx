"use client"

import { MapPinIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { CustomerAddress } from "@/lib/apollo/queries/customer-addresses"

type AddressCardProps = {
  address: CustomerAddress
  onEdit: (address: CustomerAddress) => void
  onDelete: (address: CustomerAddress) => void
  deleting?: boolean
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  deleting,
}: AddressCardProps) {
  const name =
    `${address.firstName ?? ""} ${address.lastName ?? ""}`.trim() || "—"
  const lines = [
    address.address1,
    address.address2,
    address.landmark ? `Near ${address.landmark}` : null,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ].filter(Boolean)

  const phone =
    address.phone != null
      ? `${address.countryCode ? `+${address.countryCode} ` : ""}${address.phone}`
      : null

  return (
    <Card size="sm" className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-2 border-b">
        <div className="min-w-0 space-y-1">
          <CardTitle className="truncate">{name}</CardTitle>
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <MapPinIcon className="size-3.5 shrink-0" />
            <span className="truncate">
              {[address.city, address.state].filter(Boolean).join(", ") ||
                "Address"}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={() => onEdit(address)}
            aria-label="Edit address"
          >
            <PencilIcon className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={() => onDelete(address)}
            disabled={deleting}
            aria-label="Delete address"
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {lines.map((line) => (
          <p key={String(line)} className="text-muted-foreground">
            {line}
          </p>
        ))}
        {address.email ? <p>{address.email}</p> : null}
        {phone ? <p>{phone}</p> : null}
      </CardContent>
    </Card>
  )
}
