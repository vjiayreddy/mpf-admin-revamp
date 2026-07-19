import {
  chinos_back_tummy_to_back,
  chinos_calf_loose,
  chinos_knee_loose,
  chinos_thigh_loose,
} from "../legacy-internal-formulas"

import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import type { MeasurementGarmentSchema } from "../field-types"

/** Port of legacy chinosMeasurements. */
export const chinosSchema: MeasurementGarmentSchema = {
  catId: MEASUREMENT_CATEGORIES.CHINOS,
  subCat: "chinos",
  options: [
    [
      {
        label: "Chinos Length",
        name: "chinos_length",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
      {
        label: "Chinos Front Length",
        name: "chinos_front_length",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
      {
        label: "Chinos Back Length",
        name: "chinos_back_length",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Chinos Waist",
        name: "chinos_waist",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Chinos Seat",
        name: "chinos_seat",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Chinos Thigh Body",
        name: "chinos_thigh",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [chinos_thigh_loose],
      },
      {
        label: "Chinos Thigh Loosening",
        name: "chinos_thigh_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 2,
        internalFormula: [chinos_thigh_loose],
      },
      {
        label: "Chinos Thigh Ready",
        name: "chinos_thigh_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: chinos_thigh_loose,
      },
    ],
    [
      {
        label: "Chinos Knee Body",
        name: "chinos_knee",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [chinos_knee_loose],
      },
      {
        label: "Chinos Knee Loosening",
        name: "chinos_knee_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 3,
        internalFormula: [chinos_knee_loose],
      },
      {
        label: "Chinos Knee Ready",
        name: "chinos_knee_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: chinos_knee_loose,
      },
      {
        label: "Chinos Knee Down",
        name: "chinos_knee_down",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Chinos Calf Body",
        name: "chinos_calf_tight",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [chinos_calf_loose],
      },
      {
        label: "Chinos Calf Loosening",
        name: "chinos_calf_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 1,
        defaultCm: 0.75,
        internalFormula: [chinos_calf_loose],
      },
      {
        label: "Chinos Calf Ready",
        name: "chinos_calf_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: chinos_calf_loose,
      },
    ],
    [
      {
        label: "Chinos Leg Opening",
        name: "chinos_leg_opening",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Chinos Tummy To Back",
        name: "chinos_tummy_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [chinos_back_tummy_to_back],
      },
      {
        label: "Chinos Crotch Front",
        name: "chinos_front_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [chinos_back_tummy_to_back],
      },
      {
        label: "Chinos Crotch Back",
        name: "chinos_back_tummy_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        formula: chinos_back_tummy_to_back,
      },
    ],
  ],
}
