"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@apollo/client/react"
import { ArrowLeftIcon } from "lucide-react"

import { AddressesPanel } from "@/components/customers/profile/addresses-panel"
import { CustomerProfileHeader } from "@/components/customers/profile/customer-profile-header"
import { CustomerProfileTabs } from "@/components/customers/profile/customer-profile-tabs"
import { ImagesPanel } from "@/components/customers/profile/images-panel"
import { ProfileAboutPanel } from "@/components/customers/profile/profile-about-panel"
import { ProfileEditForm } from "@/components/customers/profile/profile-edit-form"
import { Button } from "@/components/ui/button"
import { UppyFileUpload } from "@/components/upload/uppy-file-upload"
import {
  CUSTOMER_PROFILE_TABS,
  PROFILE_IMAGE_UPLOAD_PATH,
  type CustomerProfileTab,
} from "@/config/customer-profile"
import { useCustomerProfile } from "@/hooks/use-customer-profile"
import {
  UPDATE_USER_PROFILE,
  type UpdateUserProfileData,
  type UpdateUserProfileVars,
} from "@/lib/apollo/queries/update-user-profile"
import {
  PRODUCT_IMAGE_ALLOWED_TYPES,
  uploadUrlsFromResult,
} from "@/lib/uppy/config"

function parseTab(value: string | null): CustomerProfileTab {
  if (
    value === CUSTOMER_PROFILE_TABS.addresses ||
    value === CUSTOMER_PROFILE_TABS.images ||
    value === CUSTOMER_PROFILE_TABS.profile
  ) {
    return value
  }
  return CUSTOMER_PROFILE_TABS.profile
}

export function CustomerProfilePageClient() {
  const params = useParams<{ userId: string }>()
  const userId = params.userId
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = parseTab(searchParams.get("tab"))

  const [uploadOpen, setUploadOpen] = useState(false)

  const { user, loadingUser, userError, refetchUser, orderStats } =
    useCustomerProfile(userId)

  const [updateProfile] = useMutation<
    UpdateUserProfileData,
    UpdateUserProfileVars
  >(UPDATE_USER_PROFILE)

  const setTab = useCallback(
    (tab: CustomerProfileTab) => {
      const next = new URLSearchParams(searchParams.toString())
      if (tab === CUSTOMER_PROFILE_TABS.profile) {
        next.delete("tab")
      } else {
        next.set("tab", tab)
      }
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
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
          render={<Link href="/customers" />}
        >
          <ArrowLeftIcon className="size-3.5" />
          Users
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
        onUploadPhoto={user ? () => setUploadOpen(true) : undefined}
      />

      {user ? (
        <>
          <CustomerProfileTabs value={activeTab} onChange={setTab} />

          {activeTab === CUSTOMER_PROFILE_TABS.profile ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <ProfileAboutPanel user={user} />
              <ProfileEditForm
                user={user}
                onSaved={() => {
                  void refetchUser()
                }}
              />
            </div>
          ) : null}

          {activeTab === CUSTOMER_PROFILE_TABS.addresses ? (
            <AddressesPanel userId={userId} enabled />
          ) : null}

          {activeTab === CUSTOMER_PROFILE_TABS.images ? (
            <ImagesPanel userId={userId} enabled />
          ) : null}
        </>
      ) : null}

      {user ? (
        <UppyFileUpload
          open={uploadOpen}
          uploadPath={`${PROFILE_IMAGE_UPLOAD_PATH}/${userId}`}
          maxNumberOfFiles={1}
          allowedFileTypes={[...PRODUCT_IMAGE_ALLOWED_TYPES]}
          onClose={() => setUploadOpen(false)}
          onCompleted={(result) => {
            const urls = uploadUrlsFromResult(result.successful)
            const profileUrl = urls[0]
            if (profileUrl) {
              void updateProfile({
                variables: {
                  userId,
                  updateData: { images: { profile: profileUrl } },
                },
              }).then(() => refetchUser())
            }
            setUploadOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}
