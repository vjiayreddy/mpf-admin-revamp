/** Lead create/edit form options — parity with legacy constants. */

export const LEAD_ESTIMATED_VALUE_OPTIONS = [
  { value: "StyleClub( 20-25K )", label: "StyleClub( 20-25K )" },
  { value: "StyleClub ( 50k ) ", label: "StyleClub ( 50k )" },
  { value: "StyleClub ( 80k ) ", label: "StyleClub ( 80k )" },
  { value: "Groom2B Club ( 20-25K )", label: "Groom2B Club ( 20-25K )" },
  { value: "Royal Groom ( 12-15K )", label: "Royal Groom ( 12-15K )" },
  { value: "upto-10K", label: "Upto 10K" },
  { value: "10-20k", label: "10-20k" },
  { value: "20-50K", label: "20-50k" },
  { value: "50-100K", label: "50-100k" },
  { value: "above-100K", label: "Above 100k" },
] as const

/** Legacy EVENT_TYPES */
export const LEAD_OCCASION_OPTIONS = [
  { value: "ENGAGEMENT", label: "Engagement" },
  { value: "WEDDING", label: "Wedding" },
  { value: "RECEPTION", label: "Reception" },
  { value: "SANGEET", label: "Sangeet" },
  { value: "MEHNDI", label: "Mehndi" },
  { value: "HALDI", label: "Haldi" },
  { value: "BIRTHDAY", label: "Birthday" },
  { value: "ANNIVERSARY", label: "Anniversary" },
  { value: "FRIEND_OR_RELATIVE_WEDDING", label: "Friend / relative wedding" },
  { value: "DHOTI_FUNCTION", label: "Dhoti function" },
  { value: "SAREE_FUNCTION", label: "Saree function" },
  { value: "HOUSE_WARMING", label: "House warming" },
  { value: "DAILY_WEAR", label: "Daily wear" },
  { value: "OTHERS", label: "Others" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "OTHER", label: "Other" },
] as const

/** Legacy BUDGET_OPTION (stored as enum string, not a raw number). */
export const LEAD_BUDGET_OPTIONS = [
  { value: "FROM_10_TO_20K", label: "10-20k" },
  { value: "FROM_20_TO_30K", label: "20-30k" },
  { value: "FROM_30_TO_40K", label: "30-40k" },
  { value: "FROM_40_TO_50K", label: "40-50k" },
  { value: "FROM_50_TO_60K", label: "50-60k" },
  { value: "FROM_60_TO_70K", label: "60-70k" },
  { value: "FROM_70_TO_80K", label: "70-80k" },
  { value: "FROM_80_TO_90K", label: "80-90k" },
  { value: "FROM_90_TO_100K", label: "90-100k" },
  { value: "ABOVE_100K", label: "Above 100k" },
] as const

/** Legacy S3_OCCASION_IMAGE_UPLOAD */
export const LEAD_OCCASION_IMAGE_UPLOAD_PATH = "Images/cifModule/occasion"

export const LEAD_FORM_INSTRUCTIONS = [
  "Choose a customer first (search or register), then complete the lead form.",
  "Choose a follow-up date before the expected closure date.",
] as const

export function leadOccasionLabel(value?: string | null): string {
  if (!value?.trim()) return "—"
  const match = LEAD_OCCASION_OPTIONS.find((o) => o.value === value)
  return match?.label ?? value
}

export function leadBudgetLabel(value?: string | number | null): string {
  if (value == null || value === "") return "—"
  const key = String(value)
  const match = LEAD_BUDGET_OPTIONS.find((o) => o.value === key)
  return match?.label ?? key
}
