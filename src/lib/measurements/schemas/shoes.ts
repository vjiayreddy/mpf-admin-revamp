import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import type { MeasurementGarmentSchema } from "../field-types"

/** Port of legacy shoesSizeMeasurements. */
export const shoesSchema: MeasurementGarmentSchema = {
  catId: MEASUREMENT_CATEGORIES.SHOES,
  subCat: "shoes",
  options: [
    [
      {
        label: "Shoes Foot Length",
        name: "shoes_foot_length",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Shoes Foot Width",
        name: "shoes_foot_width",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Shoes Foot Girth",
        name: "shoes_foot_girth",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Shoes Shoes Size (UK)",
        name: "shoes_shoes_size_uk",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
    [
      {
        label: "Shoes Shoes Size (US = UK(Size) + 1)",
        name: "shoes_shoes_size_us",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
  ],
}
