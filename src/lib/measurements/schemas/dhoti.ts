import {
  dhoti_ready_length,
} from "../legacy-internal-formulas"

import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import type { MeasurementGarmentSchema } from "../field-types"

/** Port of legacy dhotiMeasurement. */
export const dhotiSchema: MeasurementGarmentSchema = {
  catId: MEASUREMENT_CATEGORIES.DHOTI,
  subCat: "dhoti",
  options: [
    [
      {
        label: "Dhoti Waist",
        name: "dhoti_waist",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
    ],
    [
      {
        label: "Dhoti Seat",
        name: "dhoti_seat",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
    ],
    [
      {
        label: "Dhoti Thigh Body",
        name: "dhoti_thigh_body",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
    ],
    [
      {
        label: "Dhoti Tummy To Back",
        name: "dhoti_tummy_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
    ],
    [
      {
        label: "Trouser Length",
        name: "dhoti_length",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
        internalFormula: [dhoti_ready_length],
      },
    ],
    [
      {
        label: "Ready Dhoti Length",
        name: "ready_dhoti_length",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
        formula: dhoti_ready_length,
      },
    ],
  ],
}
