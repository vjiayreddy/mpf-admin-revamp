"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@apollo/client/react"
import { PlusIcon } from "lucide-react"

import { AddressCard } from "@/components/customers/profile/address-card"
import { AddressFormDialog } from "@/components/customers/profile/address-form-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DELETE_ADDRESS,
  GET_USER_ADDRESSES,
  type CustomerAddress,
  type DeleteAddressData,
  type DeleteAddressVars,
  type GetUserAddressesData,
  type GetUserAddressesVars,
} from "@/lib/apollo/queries/customer-addresses"

type AddressesPanelProps = {
  userId: string
  enabled: boolean
}

export function AddressesPanel({ userId, enabled }: AddressesPanelProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CustomerAddress | null>(null)
  const [deleting, setDeleting] = useState<CustomerAddress | null>(null)

  const { data, loading, error, refetch } = useQuery<
    GetUserAddressesData,
    GetUserAddressesVars
  >(GET_USER_ADDRESSES, {
    variables: { userId },
    skip: !enabled || !userId,
    fetchPolicy: "cache-and-network",
  })

  const [deleteAddress, { loading: deletingBusy }] = useMutation<
    DeleteAddressData,
    DeleteAddressVars
  >(DELETE_ADDRESS)

  const addresses = data?.getUserAddresses ?? []

  const handleDelete = async () => {
    if (!deleting?._id) return
    try {
      await deleteAddress({
        variables: { addressId: deleting._id, userId },
      })
      setDeleting(null)
      await refetch()
    } catch {
      // keep dialog open; user can retry
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-medium">Addresses</h2>
          <p className="text-muted-foreground text-sm">
            Delivery and contact addresses for this customer.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <PlusIcon className="size-3.5" />
          Add address
        </Button>
      </div>

      {loading && addresses.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm">
          Failed to load addresses. Please try again.
        </p>
      ) : null}

      {!loading && !error && addresses.length === 0 ? (
        <div className="bg-muted/30 rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="font-medium">No addresses yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Add a shipping or billing address for this customer.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-4"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            <PlusIcon className="size-3.5" />
            Add address
          </Button>
        </div>
      ) : null}

      {addresses.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {addresses.map((address) => (
            <AddressCard
              key={address._id ?? `${address.address1}-${address.phone}`}
              address={address}
              deleting={deletingBusy && deleting?._id === address._id}
              onEdit={(item) => {
                setEditing(item)
                setFormOpen(true)
              }}
              onDelete={(item) => setDeleting(item)}
            />
          ))}
        </div>
      ) : null}

      <AddressFormDialog
        open={formOpen}
        userId={userId}
        address={editing}
        onOpenChange={setFormOpen}
        onSaved={() => {
          void refetch()
        }}
      />

      {deleting ? (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm space-y-4 rounded-lg border p-4 shadow-lg">
            <h3 className="font-semibold">Delete address?</h3>
            <p className="text-muted-foreground text-sm">
              This will permanently remove the address for{" "}
              {deleting.firstName || "this customer"}.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={deletingBusy}
                onClick={() => setDeleting(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deletingBusy}
                onClick={() => void handleDelete()}
              >
                {deletingBusy ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
