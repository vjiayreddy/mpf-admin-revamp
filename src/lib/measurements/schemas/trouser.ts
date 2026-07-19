import {
  trouserCalfLoose,
  trouserKneeLoose,
  trouserThighLoose,
  trouser_back_tummy_to_back,
} from "../legacy-internal-formulas"

import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import type { MeasurementGarmentSchema } from "../field-types"

/** Port of legacy trouserMeasurementAttributes. */
export const trouserSchema: MeasurementGarmentSchema = {
  catId: MEASUREMENT_CATEGORIES.TROUSER,
  subCat: "trouser",
  options: [
    [
      {
        label: "Trouser Length",
        name: "trouser_length",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
      {
        label: "Trouser Front Length",
        name: "trouser_front_length",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
      {
        label: "Trouser Back Length",
        name: "trouser_back_length",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Trouser Waist",
        name: "trouser_waist",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Trouser Seat",
        name: "trouser_seat",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Trouser Thigh Body",
        name: "trouser_thigh_tight",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [trouserThighLoose],
      },
      {
        label: "Trouser Thigh Loosening",
        name: "trouser_thigh_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 2,
        internalFormula: [trouserThighLoose],
      },
      {
        label: "Trouser Thigh Ready",
        name: "trouser_thigh_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: trouserThighLoose,
      },
    ],
    [
      {
        label: "Trouser Knee Body",
        name: "trouser_knee_tight",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [trouserKneeLoose],
      },
      {
        label: "Trouser Knee Loosening",
        name: "trouser_knee_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 3,
        internalFormula: [trouserKneeLoose],
      },
      {
        label: "Trouser Knee Ready",
        name: "trouser_knee_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: trouserKneeLoose,
      },
      {
        label: "Trouser Knee Down",
        name: "trouser_knee_down",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Trouser Calf Body",
        name: "trouser_calf_tight",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
        internalFormula: [trouserCalfLoose],
      },
      {
        label: "Trouser Calf Loosening",
        name: "trouser_calf_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 1,
        defaultCm: 0.75,
        internalFormula: [trouserCalfLoose],
      },
      {
        label: "Trouser Calf Ready",
        name: "trouser_calf_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: trouserCalfLoose,
      },
    ],
    [
      {
        label: "Trouser Leg Opening",
        name: "trouser_leg_opening",
        role: "personal_stylist",
        isRequired: true,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Trouser Tummy to back",
        name: "trouser_tummy_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [trouser_back_tummy_to_back],
      },
      {
        label: "Trouser Crotch Front",
        name: "trouser_front_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [trouser_back_tummy_to_back],
      },
      {
        label: "Trouser Crotch Back",
        name: "trouser_back_tummy_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: trouser_back_tummy_to_back,
      },
    ],
  ],
}
