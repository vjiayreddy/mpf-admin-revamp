"use client"

import Link from "next/link"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { useCallback, useMemo } from "react"

import { BodyProfilePanel } from "@/components/measurements/body-profile-panel"
import { MeasurementFormPanel } from "@/components/measurements/measurement-form-panel"
import { MeasurementHubTabs } from "@/components/measurements/measurement-hub-tabs"
import { MeasurementsHistoryPanel } from "@/components/measurements/measurements-history-panel"
import { StandardSizingPanel } from "@/components/measurements/standard-sizing-panel"
import { UploadPicsPanel } from "@/components/measurements/upload-pics-panel"
import { CustomerProfileHeader } from "@/components/customers/profile/customer-profile-header"
import { Button } from "@/components/ui/button"
import {
  parseMeasurementHubTab,
  type MeasurementHubTab,
} from "@/config/measurement-hub"
import { useCustomerProfile } from "@/hooks/use-customer-profile"

export function CustomerMeasurementsPageClient() {
  const params = useParams<{ userId: string }>()
  const userId = params.userId
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tab = useMemo(
    () =>
      parseMeasurementHubTab(
        searchParams.get("tab") ?? searchParams.get("tabIndex")
      ),
    [searchParams]
  )
  const catId = searchParams.get("catId")

  const { user, loadingUser, userError, orderStats } =
    useCustomerProfile(userId)

  const setTab = useCallback(
    (next: MeasurementHubTab) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", next)
      params.delete("tabIndex")
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

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

      <div className="flex flex-col gap-4">
        <MeasurementHubTabs value={tab} onChange={setTab} />

        {tab === "body" ? (
          <BodyProfilePanel userId={userId} user={user} />
        ) : null}
        {tab === "pics" ? <UploadPicsPanel userId={userId} /> : null}
        {tab === "form" ? (
          <MeasurementFormPanel userId={userId} initialCatId={catId} />
        ) : null}
        {tab === "history" ? (
          <MeasurementsHistoryPanel userId={userId} />
        ) : null}
        {tab === "sizing" ? <StandardSizingPanel userId={userId} /> : null}
      </div>
    </div>
  )
}
