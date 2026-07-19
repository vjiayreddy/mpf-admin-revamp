import {
  MEASUREMENT_CATEGORIES,
  getMeasurementCategoryMeta,
} from "@/config/measurement-categories"
import { blazerLayout } from "@/lib/measurements/layouts/blazer"
import { chinosLayout } from "@/lib/measurements/layouts/chinos"
import { chudidarLayout } from "@/lib/measurements/layouts/chudidar"
import { dhotiLayout } from "@/lib/measurements/layouts/dhoti"
import { gurka_pantLayout } from "@/lib/measurements/layouts/gurka_pant"
import { indowesternLayout } from "@/lib/measurements/layouts/indowestern"
import { jodhpuriLayout } from "@/lib/measurements/layouts/jodhpuri"
import { jootisLayout } from "@/lib/measurements/layouts/jootis"
import { kurtaLayout } from "@/lib/measurements/layouts/kurta"
import { kurta_shirtLayout } from "@/lib/measurements/layouts/kurta_shirt"
import { pagdiLayout } from "@/lib/measurements/layouts/pagdi"
import { patiyalaLayout } from "@/lib/measurements/layouts/patiyala"
import { poona_pantLayout } from "@/lib/measurements/layouts/poona_pant"
import { sadriLayout } from "@/lib/measurements/layouts/sadri"
import { sherwaniLayout } from "@/lib/measurements/layouts/sherwani"
import { shirtLayout } from "@/lib/measurements/layouts/shirt"
import { shoesLayout } from "@/lib/measurements/layouts/shoes"
import { suitLayout } from "@/lib/measurements/layouts/suit"
import { trouserLayout } from "@/lib/measurements/layouts/trouser"
import { waistcoatLayout } from "@/lib/measurements/layouts/waistcoat"
import type {
  MeasurementCategoryConfig,
  MeasurementLayoutRow,
  MeasurementOption,
} from "@/lib/measurements/types"

const LAYOUT_BY_CAT_ID: Record<string, MeasurementLayoutRow[]> = {
  [MEASUREMENT_CATEGORIES.SHIRT]: shirtLayout,
  [MEASUREMENT_CATEGORIES.TROUSER]: trouserLayout,
  [MEASUREMENT_CATEGORIES.GURKA_PANT]: gurka_pantLayout,
  [MEASUREMENT_CATEGORIES.SUIT]: suitLayout,
  [MEASUREMENT_CATEGORIES.BLAZER]: blazerLayout,
  [MEASUREMENT_CATEGORIES.WAISTCOAT]: waistcoatLayout,
  [MEASUREMENT_CATEGORIES.CHINOS]: chinosLayout,
  [MEASUREMENT_CATEGORIES.INDOWESTERN]: indowesternLayout,
  [MEASUREMENT_CATEGORIES.KURTA]: kurtaLayout,
  [MEASUREMENT_CATEGORIES.KURTA_SHIRT]: kurta_shirtLayout,
  [MEASUREMENT_CATEGORIES.JODHPURI]: jodhpuriLayout,
  [MEASUREMENT_CATEGORIES.SHERWANI]: sherwaniLayout,
  [MEASUREMENT_CATEGORIES.SADARI]: sadriLayout,
  [MEASUREMENT_CATEGORIES.POONA_PANT]: poona_pantLayout,
  [MEASUREMENT_CATEGORIES.DHOTI]: dhotiLayout,
  [MEASUREMENT_CATEGORIES.PAGDI]: pagdiLayout,
  [MEASUREMENT_CATEGORIES.PATYALA]: patiyalaLayout,
  [MEASUREMENT_CATEGORIES.JOOTIS]: jootisLayout,
  [MEASUREMENT_CATEGORIES.CHUDIDAR]: chudidarLayout,
  [MEASUREMENT_CATEGORIES.SHOES]: shoesLayout,
}

function flatOptionsLayout(
  options?: MeasurementOption[] | null
): MeasurementLayoutRow[] {
  if (!options?.length) return []
  const fields = options
    .filter((o) => o.name?.trim())
    .map((o) => ({
      label: (o.label || o.name || "").trim() || "—",
      name: o.name!.trim(),
    }))
  // Chunk into rows of 4 for a readable fallback table
  const rows: MeasurementLayoutRow[] = []
  for (let i = 0; i < fields.length; i += 4) {
    rows.push(fields.slice(i, i + 4))
  }
  return rows
}

export function resolveMeasurementCategory(
  catId: string | null | undefined,
  options?: MeasurementOption[] | null
): MeasurementCategoryConfig {
  const meta = getMeasurementCategoryMeta(catId)
  const knownRows = catId ? LAYOUT_BY_CAT_ID[catId] : undefined

  if (knownRows?.length) {
    return {
      name: meta?.name ?? "Measurements",
      catId: catId!,
      image: meta?.catImage ?? null,
      rows: knownRows,
    }
  }

  return {
    name: meta?.name ?? "Measurements",
    catId: catId ?? "",
    image: meta?.catImage ?? null,
    rows: flatOptionsLayout(options),
  }
}
