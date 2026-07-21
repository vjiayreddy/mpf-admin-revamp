import { z } from "zod"

import type { WorkAreaOption } from "@/lib/embroidery/ops-form"
import { isWorkAreaMandatory } from "@/lib/embroidery/ops-form"

/** Product category ids used by embroidery design form gating. */
export const EMB_CAT_IDS = {
  SHIRT: "5da7220571762c2a58b27a65",
  TROUSER: "5da7220571762c2a58b27a67",
  SUIT: "5da7220571762c2a58b27a66",
  BLAZER: "5da7220571762c2a58b27a68",
  INDOWESTERN: "5da7220571762c2a58b27a6f",
  SHERWANI: "5da7220571762c2a58b27a70",
  JODHPURI: "5da7220571762c2a58b27a6c",
  KURTA: "5da7220571762c2a58b27a6e",
} as const

export const EMB_IMAGE_UPLOAD_PATH = "Images/MPFEmbroidery_2.0"

export const EMB_TYPE_OPTIONS = [
  { value: "SMALLER", label: "SMALLER" },
  { value: "NORMAL", label: "NORMAL" },
  { value: "BIGGER", label: "BIGGER" },
] as const

export const ARTWORK_TYPE_OPTIONS = [
  { value: "NEW_ARTWORK", label: "NEW ARTWORK" },
  { value: "EXISTING_ARTWORK", label: "EXISTING ARTWORK" },
] as const

export const FRACTION_OPTIONS = [
  { name: "0", value: 0 },
  { name: "1/4", value: 0.25 },
  { name: "1/2", value: 0.5 },
  { name: "3/4", value: 0.75 },
] as const

export const FRACTION_ENUM = {
  0: "ZERO",
  0.25: "ONE_FOURTH",
  0.5: "ONE_HALF",
  0.75: "THREE_FOURTH",
} as const

const DEFAULT_MONOGRAM_POSITIONS = [
  { name: "Cuff Left", value: "cuff_left" },
  { name: "Pocket", value: "pocket" },
]

const BLAZER_JODHPURI_MONOGRAM_POSITIONS = [
  { name: "Below Fish cut", value: "below_fish_cut" },
  { name: "Up & Below Fish cut", value: "up_and_below_fish_cut" },
  { name: "Inside Collar", value: "inside_collar" },
  { name: "Inside Back Collar", value: "inside_back_collar" },
]

export function getMonogramPositions(catId: string) {
  if (
    catId === EMB_CAT_IDS.BLAZER ||
    catId === EMB_CAT_IDS.JODHPURI
  ) {
    return BLAZER_JODHPURI_MONOGRAM_POSITIONS
  }
  return DEFAULT_MONOGRAM_POSITIONS
}

export function showsFrontAndBackBootas(catId: string) {
  return (
    catId === EMB_CAT_IDS.KURTA ||
    catId === EMB_CAT_IDS.SHERWANI ||
    catId === EMB_CAT_IDS.JODHPURI ||
    catId === EMB_CAT_IDS.INDOWESTERN
  )
}

export function showsBackBootaOnly(catId: string) {
  return catId === EMB_CAT_IDS.BLAZER
}

export type EmbImageRef = { url: string }

export type EmbBootaFormEntry = {
  referenceImages: EmbImageRef[]
  note: string
  size1V: string
  size1H: string
  distance1C2CV: string
  distance1C2CH: string
  backSizeV: string
  backSizeH: string
  fractionSize1V: string
  fractionSize1H: string
  fractionDistance1C2CV: string
  fractionDistance1C2CH: string
  fractionBackSizeV: string
  fractionBackSizeH: string
}

export type EmbMonogramFormEntry = {
  referenceImages: EmbImageRef[]
  note: string
  color: string
  colorId: string
  hsize: string
  vsize: string
  positions: string[]
  shadeNumber: string
  shadeCard: string
}

export type EmbMaterialAttributeFormEntry = {
  name: string
  label: string
  color: string
  colorId: string
  customColor: string
  note: string
}

export type EmbMaterialSampleFormEntry = {
  note: string
  attributes: EmbMaterialAttributeFormEntry[]
}

export type EmbDesignFormValues = {
  designReferenceImages: EmbImageRef[]
  designReferenceImageNote: string
  length: string
  bbs: string
  fabricName: string
  fabricColor: string
  embType: string
  artworkType: string
  workType: string[]
  workAreaIds: string[]
  cuff_distance: string
  cuff_distance_fraction: number
  daman_distance: string
  daman_distance_fraction: number
  placket_distance: string
  placket_distance_fraction: number
  front_bootas: EmbBootaFormEntry[]
  bootas: EmbBootaFormEntry[]
  monograms: EmbMonogramFormEntry[]
  workMaterialSamples: EmbMaterialSampleFormEntry[]
}

export function emptyBoota(): EmbBootaFormEntry {
  return {
    referenceImages: [],
    note: "",
    size1V: "0",
    size1H: "0",
    distance1C2CV: "0",
    distance1C2CH: "0",
    backSizeV: "0",
    backSizeH: "0",
    fractionSize1V: "ZERO",
    fractionSize1H: "ZERO",
    fractionDistance1C2CV: "ZERO",
    fractionDistance1C2CH: "ZERO",
    fractionBackSizeV: "ZERO",
    fractionBackSizeH: "ZERO",
  }
}

export function emptyMonogram(): EmbMonogramFormEntry {
  return {
    referenceImages: [],
    note: "",
    color: "",
    colorId: "",
    hsize: "0",
    vsize: "0",
    positions: [],
    shadeNumber: "",
    shadeCard: "",
  }
}

export function emptyMaterialAttribute(): EmbMaterialAttributeFormEntry {
  return {
    name: "",
    label: "",
    color: "",
    colorId: "",
    customColor: "",
    note: "",
  }
}

export function emptyMaterialSample(): EmbMaterialSampleFormEntry {
  return {
    note: "",
    attributes: [emptyMaterialAttribute()],
  }
}

export function emptyEmbDesignFormValues(
  fabricColor = ""
): EmbDesignFormValues {
  return {
    designReferenceImages: [],
    designReferenceImageNote: "",
    length: "",
    bbs: "",
    fabricName: "",
    fabricColor,
    embType: "",
    artworkType: "",
    workType: [],
    workAreaIds: [],
    cuff_distance: "0",
    cuff_distance_fraction: 0,
    daman_distance: "0",
    daman_distance_fraction: 0,
    placket_distance: "0",
    placket_distance_fraction: 0,
    front_bootas: [],
    bootas: [],
    monograms: [],
    workMaterialSamples: [emptyMaterialSample()],
  }
}

export function createEmbDesignFormSchema(catId: string) {
  const areasRequired = isWorkAreaMandatory(catId)
  return z
    .object({
      designReferenceImages: z.array(z.object({ url: z.string() })),
      designReferenceImageNote: z.string(),
      length: z.string().trim().min(1, "Length is required"),
      bbs: z.string().trim().min(1, "BBS is required"),
      fabricName: z.string(),
      fabricColor: z.string(),
      embType: z.string(),
      artworkType: z.string(),
      workType: z.array(z.string()).min(1, "At least one Work Type is required"),
      workAreaIds: z.array(z.string()),
      cuff_distance: z.string(),
      cuff_distance_fraction: z.number(),
      daman_distance: z.string(),
      daman_distance_fraction: z.number(),
      placket_distance: z.string(),
      placket_distance_fraction: z.number(),
      front_bootas: z.array(z.any()),
      bootas: z.array(z.any()),
      monograms: z.array(z.any()),
      workMaterialSamples: z
        .array(
          z.object({
            note: z.string(),
            attributes: z
              .array(
                z.object({
                  name: z.string(),
                  label: z.string(),
                  color: z.string(),
                  colorId: z.string(),
                  customColor: z.string(),
                  note: z.string(),
                })
              )
              .min(1, "At least one material is required in each sample"),
          })
        )
        .min(1, "At least one Work Material Sample is required"),
    })
    .superRefine((values, ctx) => {
      if (areasRequired && values.workAreaIds.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["workAreaIds"],
          message: "At least one Work Area is required",
        })
      }
      const lengthTrim = values.length.trim()
      if (lengthTrim) {
        const lengthNum = Number(lengthTrim)
        if (!Number.isFinite(lengthNum)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["length"],
            message: "Length must be a number",
          })
        }
      }
      const bbsTrim = values.bbs.trim()
      if (bbsTrim) {
        const bbsNum = Number(bbsTrim)
        if (!Number.isFinite(bbsNum)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["bbs"],
            message: "BBS must be a number",
          })
        }
      }
      values.workMaterialSamples.forEach((sample, i) => {
        const hasNamed = sample.attributes.some((a) => a.name.trim())
        if (!hasNamed) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["workMaterialSamples", i, "attributes"],
            message: "Select at least one material name",
          })
        }
      })
    })
}

const EMB_FIELD_LABELS: Record<string, string> = {
  length: "Length",
  bbs: "BBS",
  workType: "Work Type",
  workAreaIds: "Work Area",
  workMaterialSamples: "Work Material Samples",
  designReferenceImages: "Design Reference Images",
  fabricName: "Fabric Name",
  fabricColor: "Fabric Color",
  embType: "Emb Type",
  artworkType: "Artwork",
}

/** Flatten RHF / Zod field errors into user-facing messages. */
export function collectEmbDesignErrorMessages(
  errors: Record<string, unknown>,
  prefix = ""
): string[] {
  const out: string[] = []
  for (const [key, value] of Object.entries(errors)) {
    if (!value || typeof value !== "object") continue
    const node = value as { message?: string; root?: { message?: string } }
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof node.message === "string" && node.message.trim()) {
      const rootKey = path.split(".")[0] ?? path
      const label = EMB_FIELD_LABELS[rootKey] ?? rootKey
      out.push(`${label}: ${node.message}`)
      continue
    }
    if (Array.isArray(value)) {
      value.forEach((entry, index) => {
        if (entry && typeof entry === "object") {
          out.push(
            ...collectEmbDesignErrorMessages(
              entry as Record<string, unknown>,
              `${path}[${index}]`
            )
          )
        }
      })
      continue
    }
    out.push(
      ...collectEmbDesignErrorMessages(value as Record<string, unknown>, path)
    )
  }
  return out
}

/** Which top-level sections should expand when validation fails. */
export function embDesignSectionsWithErrors(
  errors: Record<string, unknown>
): Set<string> {
  const sections = new Set<string>()
  if (errors.length || errors.bbs || errors.fabricName || errors.fabricColor) {
    sections.add("basic")
  }
  if (errors.workType) sections.add("workType")
  if (errors.workAreaIds) sections.add("workArea")
  if (errors.workMaterialSamples) sections.add("materials")
  return sections
}

function mapBootaPayload(
  boota: EmbBootaFormEntry,
  bootaSide: "FRONT" | "BACK"
) {
  return {
    referenceImages: (boota.referenceImages ?? [])
      .map((img) => img.url)
      .filter(Boolean),
    note: boota.note || "",
    size1V: Number(boota.size1V) || 0,
    size1H: Number(boota.size1H) || 0,
    distance1C2CV: Number(boota.distance1C2CV) || 0,
    distance1C2CH: Number(boota.distance1C2CH) || 0,
    backSizeV: Number(boota.backSizeV) || 0,
    backSizeH: Number(boota.backSizeH) || 0,
    fractionSize1V: boota.fractionSize1V || "ZERO",
    fractionSize1H: boota.fractionSize1H || "ZERO",
    fractionDistance1C2CV: boota.fractionDistance1C2CV || "ZERO",
    fractionDistance1C2CH: boota.fractionDistance1C2CH || "ZERO",
    fractionBackSizeV: boota.fractionBackSizeV || "ZERO",
    fractionBackSizeH: boota.fractionBackSizeH || "ZERO",
    bootaSide,
  }
}

export function getEmbFormPayload(
  data: EmbDesignFormValues,
  workAreaOptions: WorkAreaOption[]
): Record<string, unknown> {
  const workAreaById = new Map(workAreaOptions.map((o) => [o.id, o]))
  const workAreas = data.workAreaIds
    .map((id) => workAreaById.get(id))
    .filter(Boolean)
    .map((opt) => JSON.stringify(opt))

  const front = (data.front_bootas ?? []).map((b) =>
    mapBootaPayload(b, "FRONT")
  )
  const back = (data.bootas ?? []).map((b) => mapBootaPayload(b, "BACK"))

  const monograms = (data.monograms ?? []).map((monogram) => ({
    referenceImages: (monogram.referenceImages ?? [])
      .map((img) => img.url)
      .filter(Boolean),
    note: monogram.note || "",
    colorId: monogram.colorId || null,
    color: monogram.color || null,
    hsize: Number(monogram.hsize) || 0,
    vsize: Number(monogram.vsize) || 0,
    positions: monogram.positions ?? [],
    shadeNumber: monogram.shadeNumber || "",
    shadeCard: monogram.shadeCard || "",
  }))

  const workMaterialSamples = (data.workMaterialSamples ?? []).map(
    (sample, index) => ({
      sample: index + 1,
      note: sample.note || null,
      attributes: (sample.attributes ?? [])
        .filter((attr) => attr.name?.trim())
        .map((attribute) => ({
          customColor: attribute.customColor || null,
          ...(attribute.colorId
            ? {
                color: attribute.color || null,
                colorId: attribute.colorId,
              }
            : {}),
          name: attribute.name,
          label: attribute.label || attribute.name,
          note: attribute.note || null,
        })),
    })
  )

  return {
    ...(data.designReferenceImages.length > 0
      ? {
          designReferencesImageUrls: data.designReferenceImages
            .map((img) => img.url)
            .filter(Boolean),
        }
      : {}),
    designReferenceImageNote: data.designReferenceImageNote || "",
    length: Number(data.length) || 0,
    bbs: Number(data.bbs) || 0,
    ...(data.embType ? { embType: data.embType } : {}),
    ...(data.artworkType ? { artworkType: data.artworkType } : {}),
    fabricName: data.fabricName || "",
    fabricColor: data.fabricColor || "",
    otherAttributes: [
      {
        name: "cuff_distance",
        label: "Cuff Distance",
        value: `${Number(data.cuff_distance || 0) + Number(data.cuff_distance_fraction || 0)}`,
        inputType: "TEXT",
      },
      {
        name: "daman_distance",
        label: "Daman Distance",
        value: `${Number(data.daman_distance || 0) + Number(data.daman_distance_fraction || 0)}`,
        inputType: "TEXT",
      },
      {
        name: "placket_distance",
        label: "Placket Distance",
        value: `${Number(data.placket_distance || 0) + Number(data.placket_distance_fraction || 0)}`,
        inputType: "TEXT",
      },
    ],
    bootas: [...front, ...back],
    monograms,
    workAreas,
    workType: data.workType,
    workMaterialSamples,
  }
}

function toNearestQuarter(n: number) {
  const frac = Math.abs(n - Math.trunc(n))
  const options = [0, 0.25, 0.5, 0.75]
  let nearest = options[0]
  let minDiff = Math.abs(frac - nearest)
  for (let i = 1; i < options.length; i++) {
    const d = Math.abs(frac - options[i])
    if (d < minDiff) {
      minDiff = d
      nearest = options[i]
    }
  }
  return nearest
}

function normalizeBoota(boota: Record<string, unknown>): EmbBootaFormEntry {
  const images = Array.isArray(boota.referenceImages)
    ? boota.referenceImages.map((image) =>
        typeof image === "string" ? { url: image } : { url: String((image as { url?: string })?.url || "") }
      )
    : []
  return {
    referenceImages: images.filter((i) => i.url),
    note: String(boota.note ?? ""),
    size1V: String(boota.size1V ?? 0),
    size1H: String(boota.size1H ?? 0),
    distance1C2CV: String(boota.distance1C2CV ?? 0),
    distance1C2CH: String(boota.distance1C2CH ?? 0),
    backSizeV: String(boota.backSizeV ?? 0),
    backSizeH: String(boota.backSizeH ?? 0),
    fractionSize1V: String(boota.fractionSize1V ?? "ZERO"),
    fractionSize1H: String(boota.fractionSize1H ?? "ZERO"),
    fractionDistance1C2CV: String(boota.fractionDistance1C2CV ?? "ZERO"),
    fractionDistance1C2CH: String(boota.fractionDistance1C2CH ?? "ZERO"),
    fractionBackSizeV: String(boota.fractionBackSizeV ?? "ZERO"),
    fractionBackSizeH: String(boota.fractionBackSizeH ?? "ZERO"),
  }
}

/** Hydrate RHF values from getEmbroideryById or parsed embDesignDetails. */
export function resetEmbFormPayload(
  formData: Record<string, unknown> | null | undefined,
  fabricColorFallback = ""
): EmbDesignFormValues {
  const base = emptyEmbDesignFormValues(fabricColorFallback)
  if (!formData) return base

  const workAreasRaw = Array.isArray(formData.workAreas)
    ? formData.workAreas
    : []
  const workAreaIds: string[] = []
  for (const workarea of workAreasRaw) {
    try {
      const parsed =
        typeof workarea === "string" ? JSON.parse(workarea) : workarea
      const record = parsed as {
        id?: string
        name?: string
        label?: string
        group?: string
      } | null
      if (record?.id) {
        workAreaIds.push(String(record.id))
      } else if (record?.name) {
        const group = String(record.group || record.label || record.name)
        workAreaIds.push(`${group}_${record.name}`)
      }
    } catch {
      // ignore bad entries
    }
  }

  const front_bootas: EmbBootaFormEntry[] = []
  const bootas: EmbBootaFormEntry[] = []
  if (Array.isArray(formData.bootas)) {
    for (const boota of formData.bootas as Record<string, unknown>[]) {
      const normalized = normalizeBoota(boota)
      if (boota?.bootaSide === "FRONT") front_bootas.push(normalized)
      else bootas.push(normalized)
    }
  }

  const monograms: EmbMonogramFormEntry[] = []
  if (Array.isArray(formData.monograms)) {
    for (const monogram of formData.monograms as Record<string, unknown>[]) {
      const images = Array.isArray(monogram.referenceImages)
        ? monogram.referenceImages.map((image) =>
            typeof image === "string"
              ? { url: image }
              : { url: String((image as { url?: string })?.url || "") }
          )
        : []
      const positions = Array.isArray(monogram.positions)
        ? monogram.positions.map(String)
        : typeof monogram.positions === "string" && monogram.positions
          ? [monogram.positions]
          : []
      monograms.push({
        referenceImages: images.filter((i) => i.url),
        note: String(monogram.note ?? ""),
        color: String(monogram.color ?? ""),
        colorId: String(monogram.colorId ?? ""),
        hsize: String(monogram.hsize ?? 0),
        vsize: String(monogram.vsize ?? 0),
        positions,
        shadeNumber: String(monogram.shadeNumber ?? ""),
        shadeCard: String(monogram.shadeCard ?? ""),
      })
    }
  }

  const workMaterialSamples: EmbMaterialSampleFormEntry[] = []
  if (Array.isArray(formData.workMaterialSamples)) {
    for (const sample of formData.workMaterialSamples as Record<
      string,
      unknown
    >[]) {
      const attributes = Array.isArray(sample.attributes)
        ? (sample.attributes as Record<string, unknown>[]).map((attribute) => ({
            note: String(attribute.note ?? ""),
            name: String(attribute.name ?? ""),
            label: String(attribute.label ?? attribute.name ?? ""),
            customColor: String(attribute.customColor ?? ""),
            color: String(attribute.color ?? ""),
            colorId: String(attribute.colorId ?? ""),
          }))
        : [emptyMaterialAttribute()]
      workMaterialSamples.push({
        note: String(sample.note ?? ""),
        attributes:
          attributes.length > 0 ? attributes : [emptyMaterialAttribute()],
      })
    }
  }

  const otherAttributes = Array.isArray(formData.otherAttributes)
    ? (formData.otherAttributes as Array<{ name?: string; value?: string | number }>)
    : []
  const cuffAttr = otherAttributes.find((a) => a?.name === "cuff_distance")?.value
  const damanAttr = otherAttributes.find((a) => a?.name === "daman_distance")?.value
  const placketAttr = otherAttributes.find((a) => a?.name === "placket_distance")?.value
  const cuffNum = Number(cuffAttr)
  const damanNum = Number(damanAttr)
  const placketNum = Number(placketAttr)

  const designUrls: string[] = []
  if (Array.isArray(formData.designReferencesImageUrls)) {
    for (const entry of formData.designReferencesImageUrls) {
      if (typeof entry === "string" && entry.trim()) designUrls.push(entry)
    }
  } else if (Array.isArray(formData.designReferenceImages)) {
    for (const entry of formData.designReferenceImages) {
      if (typeof entry === "string" && entry.trim()) {
        designUrls.push(entry)
      } else if (entry && typeof entry === "object") {
        const url = String((entry as { url?: string }).url ?? "").trim()
        if (url) designUrls.push(url)
      }
    }
  }

  return {
    ...base,
    designReferenceImageNote: String(formData.designReferenceImageNote ?? ""),
    designReferenceImages: designUrls.map((url) => ({ url })),
    length:
      formData.length != null && formData.length !== ""
        ? String(formData.length)
        : "",
    bbs:
      formData.bbs != null && formData.bbs !== ""
        ? String(formData.bbs)
        : "",
    workType: Array.isArray(formData.workType)
      ? formData.workType.map(String)
      : [],
    workAreaIds,
    bootas,
    front_bootas,
    embType: String(formData.embType ?? ""),
    artworkType: String(formData.artworkType ?? ""),
    fabricName: String(formData.fabricName ?? ""),
    fabricColor:
      String(formData.fabricColor ?? "").trim() || fabricColorFallback,
    monograms,
    workMaterialSamples:
      workMaterialSamples.length > 0
        ? workMaterialSamples
        : [emptyMaterialSample()],
    cuff_distance: String(
      Number.isFinite(cuffNum) ? Math.trunc(cuffNum) : 0
    ),
    daman_distance: String(
      Number.isFinite(damanNum) ? Math.trunc(damanNum) : 0
    ),
    placket_distance: String(
      Number.isFinite(placketNum) ? Math.trunc(placketNum) : 0
    ),
    cuff_distance_fraction: Number.isFinite(cuffNum)
      ? toNearestQuarter(cuffNum)
      : 0,
    daman_distance_fraction: Number.isFinite(damanNum)
      ? toNearestQuarter(damanNum)
      : 0,
    placket_distance_fraction: Number.isFinite(placketNum)
      ? toNearestQuarter(placketNum)
      : 0,
  }
}
