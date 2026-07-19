import {
  patyala_ready_length,
} from "../legacy-internal-formulas"

import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import type { MeasurementGarmentSchema } from "../field-types"

/** Port of legacy patiyalaMeasurements. */
export const patiyalaSchema: MeasurementGarmentSchema = {
  catId: MEASUREMENT_CATEGORIES.PATYALA,
  subCat: "patyala",
  options: [
    [
      {
        label: "Patiyala Dhoti Waist",
        name: "patyala_dhoti_waist",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Patiyala Dhoti Seat",
        name: "patyala_dhoti_seat",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Patiyala Thigh Body",
        name: "patyala_thigh_body",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Patiyala Tummy To Back",
        name: "patyala_tummy_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Trouser Length",
        name: "patyala_dhoti_length",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [patyala_ready_length],
      },
    ],
    [
      {
        label: "Ready Patiyala Length",
        name: "ready_patyala_length",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        formula: patyala_ready_length,
      },
    ],
  ],
}
