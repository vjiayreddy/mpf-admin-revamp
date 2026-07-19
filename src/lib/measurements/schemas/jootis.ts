import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import type { MeasurementGarmentSchema } from "../field-types"

/** Port of legacy jootisMeasurements. */
export const jootisSchema: MeasurementGarmentSchema = {
  catId: MEASUREMENT_CATEGORIES.JOOTIS,
  subCat: "jootis",
  options: [
    [
      {
        label: "Jootis Foot Length",
        name: "jootis_foot_length",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Jootis Foot Width",
        name: "jootis_foot_width",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Jootis Foot Girth",
        name: "jootis_foot_girth",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Jootis Shoes Size (UK)",
        name: "jootis_shoes_size_uk",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Jootis Shoes Size (US = UK(Size) + 1)",
        name: "jootis_shoes_size_us",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
  ],
}
