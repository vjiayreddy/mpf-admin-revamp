import {
  sadri_below_chest_ready,
  sadri_chest_ready,
  sadri_neck_ready,
  sadri_seat_ready,
  sadri_waist_ready,
} from "../legacy-internal-formulas"

import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import type { MeasurementGarmentSchema } from "../field-types"

/** Port of legacy sadriMeasurements. */
export const sadriSchema: MeasurementGarmentSchema = {
  catId: MEASUREMENT_CATEGORIES.SADARI,
  subCat: "sadri",
  options: [
    [
      {
        label: "Sadri Length",
        name: "sadri_length",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
      {
        label: "Sadri Shoulder",
        name: "sadri_shoulder",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
      {
        label: "Sadri Cross Back",
        name: "sadri_cross_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
      {
        label: "Sadri Cross Chest",
        name: "sadri_cross_chest",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Sadri Neck Body",
        name: "sadri_neck_body",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [sadri_neck_ready],
      },
      {
        label: "Sadri Neck Ready",
        name: "sadri_neck_ready",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: sadri_neck_ready,
      },
    ],
    [
      {
        label: "Sadri Chest Body",
        name: "sadri_chest",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [sadri_chest_ready],
      },
      {
        label: "Sadri Chest Loosening",
        name: "sadri_chest_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 3,
        internalFormula: [sadri_chest_ready],
      },
      {
        label: "Sadri Chest Ready",
        name: "sadri_chest_ready",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: sadri_chest_ready,
      },
    ],
    [
      {
        label: "Sadri Below Chest",
        name: "sadri_below_chest",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [sadri_below_chest_ready],
      },
      {
        label: "Sadri Below Chest Loosening",
        name: "sadri_below_chest_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [sadri_below_chest_ready],
      },
      {
        label: "Sadri Below Chest Ready",
        name: "sadri_below_chest_ready",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: sadri_below_chest_ready,
      },
    ],
    [
      {
        label: "Sadri Waist Body",
        name: "sadri_waist_body",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [sadri_waist_ready],
      },
      {
        label: "Sadri waist Loosening",
        name: "sadri_waist_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 2,
        defaultCm: 0.5,
        internalFormula: [sadri_waist_ready],
      },
      {
        label: "Sadri Waist Ready",
        name: "sadri_waist_ready",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: sadri_waist_ready,
      },
    ],
    [
      {
        label: "Sadri seat Body",
        name: "sadri_seat_body",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [sadri_seat_ready],
      },
      {
        label: "Sadri seat Loosening",
        name: "sadri_seat_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 3,
        internalFormula: [sadri_seat_ready],
      },
      {
        label: "Sadri seat Ready",
        name: "sadri_seat_ready",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: sadri_seat_ready,
      },
    ],
    [
    ],
  ],
}
