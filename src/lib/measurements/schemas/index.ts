import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"

import type { MeasurementGarmentSchema } from "../field-types"
import { shirtSchema } from "./shirt"
import { trouserSchema } from "./trouser"
import { suitSchema } from "./suit"
import { blazerSchema } from "./blazer"
import { waistcoatSchema } from "./waistcoat"
import { chinosSchema } from "./chinos"
import { indowesternSchema } from "./indowestern"
import { kurtaSchema } from "./kurta"
import { kurtaShirtSchema } from "./kurta_shirt"
import { jodhpuriSchema } from "./jodhpuri"
import { sherwaniSchema } from "./sherwani"
import { sadriSchema } from "./sadri"
import { poonaPantSchema } from "./poona_pant"
import { gurkaPantSchema } from "./gurka_pant"
import { dhotiSchema } from "./dhoti"
import { pagdiSchema } from "./pagdi"
import { patiyalaSchema } from "./patiyala"
import { jootisSchema } from "./jootis"
import { chudidarSchema } from "./chudidar"
import { shoesSchema } from "./shoes"

export const MEASUREMENT_SCHEMAS: Partial<
  Record<string, MeasurementGarmentSchema>
> = {
  [MEASUREMENT_CATEGORIES.SHIRT]: shirtSchema,
  [MEASUREMENT_CATEGORIES.TROUSER]: trouserSchema,
  [MEASUREMENT_CATEGORIES.SUIT]: suitSchema,
  [MEASUREMENT_CATEGORIES.BLAZER]: blazerSchema,
  [MEASUREMENT_CATEGORIES.WAISTCOAT]: waistcoatSchema,
  [MEASUREMENT_CATEGORIES.CHINOS]: chinosSchema,
  [MEASUREMENT_CATEGORIES.INDOWESTERN]: indowesternSchema,
  [MEASUREMENT_CATEGORIES.KURTA]: kurtaSchema,
  [MEASUREMENT_CATEGORIES.KURTA_SHIRT]: kurtaShirtSchema,
  [MEASUREMENT_CATEGORIES.JODHPURI]: jodhpuriSchema,
  [MEASUREMENT_CATEGORIES.SHERWANI]: sherwaniSchema,
  [MEASUREMENT_CATEGORIES.SADARI]: sadriSchema,
  [MEASUREMENT_CATEGORIES.POONA_PANT]: poonaPantSchema,
  [MEASUREMENT_CATEGORIES.GURKA_PANT]: gurkaPantSchema,
  [MEASUREMENT_CATEGORIES.DHOTI]: dhotiSchema,
  [MEASUREMENT_CATEGORIES.PAGDI]: pagdiSchema,
  [MEASUREMENT_CATEGORIES.PATYALA]: patiyalaSchema,
  [MEASUREMENT_CATEGORIES.JOOTIS]: jootisSchema,
  [MEASUREMENT_CATEGORIES.CHUDIDAR]: chudidarSchema,
  [MEASUREMENT_CATEGORIES.SHOES]: shoesSchema,
}

export function getMeasurementSchema(
  catId: string
): MeasurementGarmentSchema | undefined {
  return MEASUREMENT_SCHEMAS[catId]
}

export { shirtSchema }
export { trouserSchema }
export { suitSchema }
export { blazerSchema }
export { waistcoatSchema }
export { chinosSchema }
export { indowesternSchema }
export { kurtaSchema }
export { kurtaShirtSchema }
export { jodhpuriSchema }
export { sherwaniSchema }
export { sadriSchema }
export { poonaPantSchema }
export { gurkaPantSchema }
export { dhotiSchema }
export { pagdiSchema }
export { patiyalaSchema }
export { jootisSchema }
export { chudidarSchema }
export { shoesSchema }
