import {
  gurka_pant_back_tummy_to_back,
  gurkapantCalfLoose,
  gurkapantKneeLoose,
  gurkapantThighLoose,
} from "../legacy-internal-formulas"

import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import type { MeasurementGarmentSchema } from "../field-types"

/** Port of legacy gurkaPantMeasurementAttributes. */
export const gurkaPantSchema: MeasurementGarmentSchema = {
  catId: MEASUREMENT_CATEGORIES.GURKA_PANT,
  subCat: "gurka_pant",
  options: [
    [
      {
        label: "Gurka Pant Length",
        name: "gurka_pant_length",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
      {
        label: "Gurka Pant Front Length",
        name: "gurka_pant_front_length",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
      {
        label: "Gurka Pant Back Length",
        name: "gurka_pant_back_length",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Gurka Pant Waist",
        name: "gurka_pant_waist",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Gurka Pant Seat",
        name: "gurka_pant_seat",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Gurka Pant Thigh Body",
        name: "gurka_pant_thigh_tight",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [gurkapantThighLoose],
      },
      {
        label: "Gurka Pant Thigh Loosening",
        name: "gurka_pant_thigh_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 2,
        internalFormula: [gurkapantThighLoose],
      },
      {
        label: "Gurka Pant Thigh Ready",
        name: "gurka_pant_thigh_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: gurkapantThighLoose,
      },
    ],
    [
      {
        label: "Gurka Pant Knee Body",
        name: "gurka_pant_knee_tight",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [gurkapantKneeLoose],
      },
      {
        label: "Gurka Pant Knee Loosening",
        name: "gurka_pant_knee_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 3,
        internalFormula: [gurkapantKneeLoose],
      },
      {
        label: "Gurka Pant Knee Ready",
        name: "gurka_pant_knee_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: gurkapantKneeLoose,
      },
      {
        label: "Gurka Pant Knee Down",
        name: "gurka_pant_knee_down",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Gurka Pant Calf Body",
        name: "gurka_pant_calf_tight",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [gurkapantCalfLoose],
      },
      {
        label: "Gurka Pant Calf Loosening",
        name: "gurka_pant_calf_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 1,
        defaultCm: 0.75,
        internalFormula: [gurkapantCalfLoose],
      },
      {
        label: "Gurka Pant Calf Ready",
        name: "gurka_pant_calf_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: gurkapantCalfLoose,
      },
    ],
    [
      {
        label: "Gurka Pant Leg Opening",
        name: "gurka_pant_leg_opening",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Gurka Pant Tummy to back",
        name: "gurka_pant_tummy_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [gurka_pant_back_tummy_to_back],
      },
      {
        label: "Gurka Pant Crotch Front",
        name: "gurka_pant_front_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [gurka_pant_back_tummy_to_back],
      },
      {
        label: "Gurka Pant Crotch Back",
        name: "gurka_pant_back_tummy_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: gurka_pant_back_tummy_to_back,
      },
    ],
  ],
}
