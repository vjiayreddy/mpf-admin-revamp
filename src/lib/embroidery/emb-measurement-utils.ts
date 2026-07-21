/**
 * Length / BBS autofill from customer measurements (legacy embroidery form).
 */

export type MeasurementConfig = {
  lengthField: string
  bbsFields: readonly string[]
  updateFields: { length?: string; bbs?: string }
}

export type MeasurementOption = {
  name?: string | null
  value?: string | number | null
}

export function processMeasurementOptions(
  options: MeasurementOption[],
  config: MeasurementConfig
): { length?: string; bbs?: string } {
  const lengthOption = options.find(
    (option) => option.name === config.lengthField
  )

  const bbsOptions = config.bbsFields.map((fieldName) =>
    options.find((option) => option.name === fieldName)
  )

  const measurements = bbsOptions
    .filter((option) => option && option.value != null)
    .map((option) => ({
      name: option!.name || "",
      value: parseFloat(String(option?.value)) || 0,
    }))

  const highestMeasurement = measurements.reduce(
    (max, current) => (current.value > max.value ? current : max),
    { name: "", value: 0 }
  )

  const updateData: { length?: string; bbs?: string } = {}

  if (lengthOption?.value != null && lengthOption.value !== "" && config.updateFields.length) {
    updateData.length = String(lengthOption.value)
  }

  if (highestMeasurement.value > 0 && config.updateFields.bbs) {
    updateData.bbs = highestMeasurement.value.toString()
  }

  return updateData
}

export const measurementConfigs = {
  shirt: {
    lengthField: "in_shirt_length",
    bbsFields: ["shirt_seat_body", "shirt_chest_body", "shirt_waist_body"],
    updateFields: { length: "length", bbs: "bbs" },
  },
  trouser: {
    lengthField: "in_trouser_length",
    bbsFields: ["trouser_waist", "trouser_seat", "trouser_thigh_tight"],
    updateFields: { length: "length", bbs: "bbs" },
  },
  chinos: {
    lengthField: "chinos_length",
    bbsFields: ["chinos_waist", "chinos_seat", "chinos_thigh"],
    updateFields: { length: "length", bbs: "bbs" },
  },
  poonaPant: {
    lengthField: "poonapant_length",
    bbsFields: ["poonapant_waist", "poonapant_seat", "poonapant_thigh_tight"],
    updateFields: { length: "length", bbs: "bbs" },
  },
  waistcoat: {
    lengthField: "waistcoat_length",
    bbsFields: [
      "waistcoat_chest_body",
      "waistcoat_waist_body",
      "waistcoat_seat_body",
    ],
    updateFields: { length: "length", bbs: "bbs" },
  },
  jodhpuri: {
    lengthField: "jodhpuri_length",
    bbsFields: ["jodhpuri_seat", "jodhpuri_chest", "jodhpuri_waist"],
    updateFields: { length: "length", bbs: "bbs" },
  },
  kurta: {
    lengthField: "kurta_length",
    bbsFields: ["kurta_seat_body", "kurta_chest_body", "kurta_waist_body"],
    updateFields: { length: "length", bbs: "bbs" },
  },
  blazer: {
    lengthField: "blazer_length",
    bbsFields: ["blazer_seat", "blazer_chest", "blazer_waist"],
    updateFields: { length: "length", bbs: "bbs" },
  },
  suit: {
    lengthField: "suit_length",
    bbsFields: ["suit_seat", "suit_chest", "suit_waist"],
    updateFields: { length: "length", bbs: "bbs" },
  },
  sherwani: {
    lengthField: "sherwani_length",
    bbsFields: [
      "sherwani_seat_body",
      "sherwani_chest_body",
      "sherwani_waist_body",
    ],
    updateFields: { length: "length", bbs: "bbs" },
  },
  indowestern: {
    lengthField: "indowestern_length",
    bbsFields: [
      "indowestern_seat_body",
      "indowestern_chest_body",
      "indowestern_waist_body",
    ],
    updateFields: { length: "length", bbs: "bbs" },
  },
  sadri: {
    lengthField: "sadri_length",
    bbsFields: ["sadri_seat_body", "sadri_chest", "sadri_waist_body"],
    updateFields: { length: "length", bbs: "bbs" },
  },
  dhoti: {
    lengthField: "dhoti_length",
    bbsFields: ["dhoti_seat", "dhoti_waist"],
    updateFields: { length: "length", bbs: "bbs" },
  },
  patyala: {
    lengthField: "patyala_dhoti_length",
    bbsFields: ["patyala_dhoti_waist", "patyala_dhoti_seat"],
    updateFields: { length: "length", bbs: "bbs" },
  },
  chudidar: {
    lengthField: "chudidar_length",
    bbsFields: ["chudidar_waist", "chudidar_seat", "chudidar_thigh_body"],
    updateFields: { length: "length", bbs: "bbs" },
  },
} as const

export function getMeasurementConfigByCategory(
  catId: string
): MeasurementConfig {
  const categoryMapping: Record<string, keyof typeof measurementConfigs> = {
    "5da7220571762c2a58b27a65": "shirt",
    "5da7220571762c2a58b27a67": "trouser",
    "5da7220571762c2a58b27a66": "suit",
    "5da7220571762c2a58b27a68": "blazer",
    "5da7220571762c2a58b27a6a": "waistcoat",
    "5da7220571762c2a58b27a6f": "indowestern",
    "5da7220571762c2a58b27a70": "sherwani",
    "5da7220571762c2a58b27a6c": "jodhpuri",
    "5da7220571762c2a58b27a6e": "kurta",
    "5da7220571762c2a58b27a6d": "sadri",
    "6036451627e32d7fd776a580": "dhoti",
    "621a34485417ab1e143a5245": "patyala",
    "6036446927e32d7fd776a57f": "chudidar",
    "5da7220571762c2a58b27a6b": "chinos",
    "636f3012feea0816508c5c45": "poonaPant",
  }

  const configKey = categoryMapping[catId]
  return measurementConfigs[configKey] || measurementConfigs.shirt
}

/** Categories that trigger measurement fetch in legacy OrderEmbroideryForm. */
const MEASUREMENT_FETCH_CAT_IDS = new Set([
  "5da7220571762c2a58b27a65", // shirt
  "5da7220571762c2a58b27a68", // blazer
  "5da7220571762c2a58b27a70", // sherwani
  "5da7220571762c2a58b27a6e", // kurta
  "5da7220571762c2a58b27a6d", // sadri
  "5da7220571762c2a58b27a6f", // indowestern
  "5da7220571762c2a58b27a66", // suit
  "5da7220571762c2a58b27a6c", // jodhpuri
  "636f3012feea0816508c5c45", // poonapant
  "6036451627e32d7fd776a580", // dhoti
  "5da7220571762c2a58b27a67", // trouser
])

export function shouldFetchEmbMeasurements(catId?: string | null) {
  return Boolean(catId && MEASUREMENT_FETCH_CAT_IDS.has(catId.trim()))
}
