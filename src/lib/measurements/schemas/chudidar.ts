import {
  chudidar_back_tummy_to_back,
} from "../legacy-internal-formulas"

import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import type { MeasurementGarmentSchema } from "../field-types"

/** Port of legacy chudidarMeasurements. */
export const chudidarSchema: MeasurementGarmentSchema = {
  catId: MEASUREMENT_CATEGORIES.CHUDIDAR,
  subCat: "chudidar",
  options: [
    [
      {
        label: "Chudidar Waist",
        name: "chudidar_waist",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
      {
        label: "Chudidar Seat",
        name: "chudidar_seat",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
    ],
    [
      {
        label: "Chudidar Thigh Body",
        name: "chudidar_thigh_body",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
      {
        label: "Chudidar Thigh Loosening",
        name: "chudidar_thigh_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
      {
        label: "Chudidar Thigh Ready",
        name: "chudidar_thigh_ready",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
    ],
    [
      {
        label: "Chudidar Knee Body",
        name: "chudidar_knee_body",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
      {
        label: "Chudidar Knee Loosening",
        name: "chudidar_knee_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
      {
        label: "Chudidar Knee Ready",
        name: "chudidar_knee_ready",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
      {
        label: "Chudidar Knee Down",
        name: "chudidar_knee_down",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
    ],
    [
      {
        label: "Chudidar Calf Body",
        name: "chudidar_calf_body",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
      {
        label: "Chudidar Calf Loosening",
        name: "chudidar_calf_loosening",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
      {
        label: "Chudidar Calf Ready",
        name: "chudidar_calf_ready",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
    ],
    [
      {
        label: "Chudidar Leg Opening Tight",
        name: "chudidar_leg_opening_tight",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
      {
        label: "Chudidar Leg Opening Loose",
        name: "chudidar_leg_opening_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
    ],
    [
      {
        label: "Chudidar Leg Opening Tight",
        name: "chudidar_leg_opening_tight",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
      {
        label: "Chudidar Leg Opening Loose",
        name: "chudidar_leg_opening_loose",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        defaultInch: 0,
      },
    ],
    [
      {
        label: "Chudidar Tummy to back",
        name: "chudidar_tummy_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [chudidar_back_tummy_to_back],
      },
      {
        label: "chudidar  Crotch Front",
        name: "chudidar_front_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
        internalFormula: [chudidar_back_tummy_to_back],
      },
      {
        label: "Chudidar Crotch Back",
        name: "chudidar_back_tummy_to_back",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: false,
        formula: chudidar_back_tummy_to_back,
      },
    ],
  ],
}
