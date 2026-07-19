"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { CifListPanel } from "@/components/cif/cif-list-panel"
import { CustomerProfileHeader } from "@/components/customers/profile/customer-profile-header"
import { Button } from "@/components/ui/button"
import { useCustomerProfile } from "@/hooks/use-customer-profile"

export function CustomerCifPageClient() {
  const params = useParams<{ userId: string }>()
  const userId = params.userId

  const { user, loadingUser, userError, orderStats } =
    useCustomerProfile(userId)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={`/customers/${userId}`} />}
        >
          <ArrowLeftIcon className="size-3.5" />
          Profile
        </Button>
      </div>

      {userError && !user ? (
        <div className="bg-card rounded-xl border border-destructive/30 p-6">
          <p className="text-destructive font-medium">
            Could not load customer profile
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {userError.message}
          </p>
        </div>
      ) : null}

      <CustomerProfileHeader
        user={user}
        orderStats={orderStats}
        loading={loadingUser}
      />

      <CifListPanel
        lockedUserId={userId}
        showPageChrome={false}
        hideCustomerColumns
      />
    </div>
  )
}
