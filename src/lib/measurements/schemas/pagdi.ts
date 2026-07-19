import { MEASUREMENT_CATEGORIES } from "@/config/measurement-categories"
import type { MeasurementGarmentSchema } from "../field-types"

/** Port of legacy pagdiMeasurements. */
export const pagdiSchema: MeasurementGarmentSchema = {
  catId: MEASUREMENT_CATEGORIES.PAGDI,
  subCat: "pagdi",
  options: [
    [
      {
        label: "Pagdi Forhead Size",
        name: "pagdi_forhead_size",
        role: "personal_stylist",
        isRequired: false,
        canBeEdited: true,
      },
    ],
  ],
}
