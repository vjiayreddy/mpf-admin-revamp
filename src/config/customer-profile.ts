import type { LucideIcon } from "lucide-react"
import {
  Calendar,
  ClipboardCheck,
  FormInput,
  Package,
  Ruler,
  Scissors,
  Shirt,
  UsersRound,
} from "lucide-react"

export const CUSTOMER_PROFILE_TABS = {
  profile: "profile",
  addresses: "addresses",
  images: "images",
} as const

export type CustomerProfileTab =
  (typeof CUSTOMER_PROFILE_TABS)[keyof typeof CUSTOMER_PROFILE_TABS]

export const CUSTOMER_PROFILE_TAB_OPTIONS: {
  id: CustomerProfileTab
  label: string
}[] = [
  { id: "profile", label: "Profile" },
  { id: "addresses", label: "Addresses" },
  { id: "images", label: "Images" },
]

export type CustomerModuleShortcut = {
  title: string
  href: (userId: string) => string
  icon: LucideIcon
}

/** Module links that already exist in mpf-admin (userId where supported). */
export const CUSTOMER_MODULE_SHORTCUTS: CustomerModuleShortcut[] = [
  {
    title: "Measurements",
    href: (userId) => `/measurements?userId=${userId}`,
    icon: Ruler,
  },
  {
    title: "Orders",
    href: () => `/orders`,
    icon: Package,
  },
  {
    title: "Track orders",
    href: () => `/track-orders`,
    icon: Package,
  },
  {
    title: "Leads",
    href: () => `/leads`,
    icon: UsersRound,
  },
  {
    title: "Appointments",
    href: () => `/appointments`,
    icon: Calendar,
  },
  {
    title: "CIF",
    href: () => `/cif`,
    icon: FormInput,
  },
  {
    title: "Trial",
    href: () => `/trial`,
    icon: Shirt,
  },
  {
    title: "Quality check",
    href: () => `/quality-check`,
    icon: ClipboardCheck,
  },
  {
    title: "Embroidery",
    href: () => `/embroidery`,
    icon: Scissors,
  },
]

export const PROFILE_IMAGE_UPLOAD_PATH = "MPF/users"
