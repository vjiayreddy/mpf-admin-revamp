import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import { blazerQcCompareLayout } from "@/lib/quality-check/layouts/blazer"
import { chinosQcCompareLayout } from "@/lib/quality-check/layouts/chinos"
import { chudidarQcCompareLayout } from "@/lib/quality-check/layouts/chudidar"
import { dhotiQcCompareLayout } from "@/lib/quality-check/layouts/dhoti"
import { gurkaPantQcCompareLayout } from "@/lib/quality-check/layouts/gurka_pant"
import { indowesternQcCompareLayout } from "@/lib/quality-check/layouts/indowestern"
import { jodhpuriQcCompareLayout } from "@/lib/quality-check/layouts/jodhpuri"
import { jootisQcCompareLayout } from "@/lib/quality-check/layouts/jootis"
import { kurtaQcCompareLayout } from "@/lib/quality-check/layouts/kurta"
import { kurtaShirtQcCompareLayout } from "@/lib/quality-check/layouts/kurta_shirt"
import { pagdiQcCompareLayout } from "@/lib/quality-check/layouts/pagdi"
import { patiyalaQcCompareLayout } from "@/lib/quality-check/layouts/patiyala"
import { poonaPantQcCompareLayout } from "@/lib/quality-check/layouts/poona_pant"
import { sadriQcCompareLayout } from "@/lib/quality-check/layouts/sadri"
import { sherwaniQcCompareLayout } from "@/lib/quality-check/layouts/sherwani"
import { shirtQcCompareLayout } from "@/lib/quality-check/layouts/shirt"
import { shoesQcCompareLayout } from "@/lib/quality-check/layouts/shoes"
import { suitQcCompareLayout } from "@/lib/quality-check/layouts/suit"
import { trouserQcCompareLayout } from "@/lib/quality-check/layouts/trouser"
import { waistcoatQcCompareLayout } from "@/lib/quality-check/layouts/waistcoat"
import type { MeasurementOption } from "@/lib/measurements/types"
import type { QcCompareField } from "@/lib/quality-check/types"

const LAYOUT_BY_CAT_ID: Record<string, QcCompareField[]> = {
  [MEASUREMENT_CATEGORIES.SHIRT]: shirtQcCompareLayout,
  [MEASUREMENT_CATEGORIES.TROUSER]: trouserQcCompareLayout,
  [MEASUREMENT_CATEGORIES.GURKA_PANT]: gurkaPantQcCompareLayout,
  [MEASUREMENT_CATEGORIES.SUIT]: suitQcCompareLayout,
  [MEASUREMENT_CATEGORIES.BLAZER]: blazerQcCompareLayout,
  [MEASUREMENT_CATEGORIES.WAISTCOAT]: waistcoatQcCompareLayout,
  [MEASUREMENT_CATEGORIES.CHINOS]: chinosQcCompareLayout,
  [MEASUREMENT_CATEGORIES.INDOWESTERN]: indowesternQcCompareLayout,
  [MEASUREMENT_CATEGORIES.KURTA]: kurtaQcCompareLayout,
  [MEASUREMENT_CATEGORIES.KURTA_SHIRT]: kurtaShirtQcCompareLayout,
  [MEASUREMENT_CATEGORIES.JODHPURI]: jodhpuriQcCompareLayout,
  [MEASUREMENT_CATEGORIES.SHERWANI]: sherwaniQcCompareLayout,
  [MEASUREMENT_CATEGORIES.SADARI]: sadriQcCompareLayout,
  [MEASUREMENT_CATEGORIES.POONA_PANT]: poonaPantQcCompareLayout,
  [MEASUREMENT_CATEGORIES.DHOTI]: dhotiQcCompareLayout,
  [MEASUREMENT_CATEGORIES.PAGDI]: pagdiQcCompareLayout,
  [MEASUREMENT_CATEGORIES.PATYALA]: patiyalaQcCompareLayout,
  [MEASUREMENT_CATEGORIES.JOOTIS]: jootisQcCompareLayout,
  [MEASUREMENT_CATEGORIES.CHUDIDAR]: chudidarQcCompareLayout,
  [MEASUREMENT_CATEGORIES.SHOES]: shoesQcCompareLayout,
}

function flatFallback(
  options?: MeasurementOption[] | null
): QcCompareField[] {
  if (!options?.length) return []
  return options
    .filter((o) => o.name?.trim())
    .map((o) => {
      const name = o.name!.trim()
      return {
        label: (o.label || name).trim() || name,
        body: name,
        actualKey: name,
        diffBase: name,
      }
    })
}

export function resolveQcCompareLayout(
  catId: string | null | undefined,
  options?: MeasurementOption[] | null
): QcCompareField[] {
  if (catId && LAYOUT_BY_CAT_ID[catId]?.length) {
    return LAYOUT_BY_CAT_ID[catId]
  }
  return flatFallback(options)
}
