import {
  poonapant_back_tummy_to_back,
  poonapant_calf_loose,
  poonapant_knee_loose,
  poonapant_thigh_loose,
} from "../legacy-internal-formulas"

import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import type { MeasurementGarmentSchema } from "../field-types"

/** Port of legacy poonaPantMeasurements. */
export const poonaPantSchema: MeasurementGarmentSchema = {
  catId: MEASUREMENT_CATEGORIES.POONA_PANT,
  subCat: "poonapant",
  options: [
    [
      {
        label: "Poonapant Length",
        name: "poonapant_length",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
      {
        label: "Poonapant Front Length",
        name: "poonapant_front_length",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
      {
        label: "Poonapant Back Length",
        name: "poonapant_back_length",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Poonapant Waist",
        name: "poonapant_waist",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Poonapant Seat",
        name: "poonapant_seat",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Poonapant Thigh Body",
        name: "poonapant_thigh_tight",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [poonapant_thigh_loose],
      },
      {
        label: "Poonapant Thigh Loosening",
        name: "poonapant_thigh_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 2,
        internalFormula: [poonapant_thigh_loose],
      },
      {
        label: "Poonapant Thigh Ready",
        name: "poonapant_thigh_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: poonapant_thigh_loose,
      },
    ],
    [
      {
        label: "Poonapant Knee Body",
        name: "poonapant_knee_tight",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [poonapant_knee_loose],
      },
      {
        label: "Poonapant Knee Loosening",
        name: "poonapant_knee_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 3,
        internalFormula: [poonapant_knee_loose],
      },
      {
        label: "Poonapant Knee Ready",
        name: "poonapant_knee_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: poonapant_knee_loose,
      },
      {
        label: "Poonapant Knee Down",
        name: "poonapant_knee_down",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        formula: poonapant_knee_loose,
      },
    ],
    [
      {
        label: "Poonapant Calf Body",
        name: "poonapant_calf_tight",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [poonapant_calf_loose],
      },
      {
        label: "Poonapant Calf Loosening",
        name: "poonapant_calf_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 1,
        defaultCm: 0.75,
        internalFormula: [poonapant_calf_loose],
      },
      {
        label: "Poonapant Calf Ready",
        name: "poonapant_calf_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: poonapant_calf_loose,
      },
    ],
    [
      {
        label: "Poonapant Leg Opening",
        name: "poonapant_leg_opening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Poonapant Tummy To Back",
        name: "poonapant_tummy_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [poonapant_back_tummy_to_back],
      },
      {
        label: "Poonapant Crotch Front",
        name: "poonapant_front_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [poonapant_back_tummy_to_back],
      },
      {
        label: "Poonapant Crotch Back",
        name: "poonapant_back_tummy_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: poonapant_back_tummy_to_back,
      },
    ],
  ],
}
