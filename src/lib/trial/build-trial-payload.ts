import { extractDateFormat } from "@/lib/appointments/date-payload"
import type {
  NestedOrderTrial,
  OrderTrialDateInput,
  OrderTrialInput,
  OrderTrialProduct,
  OrderTrialProductInput,
  OrderTrialRow,
} from "@/lib/apollo/queries/trial"
import type {
  StoreOrderDetail,
  StoreOrderTimestamp,
} from "@/lib/apollo/queries/store-orders"

export function cleanTrialDate(
  date?: StoreOrderTimestamp | OrderTrialDateInput | null
): OrderTrialDateInput | null {
  if (!date?.timestamp && date?.day == null) return null
  return {
    datestamp: date.datestamp ?? null,
    day: date.day ?? null,
    hour: date.hour ?? null,
    minute: date.minute ?? null,
    month: date.month ?? null,
    timestamp: date.timestamp ?? null,
    year: date.year ?? null,
  }
}

export function cleanTrialProducts(
  products?: OrderTrialProduct[] | null
): OrderTrialProductInput[] {
  if (!products?.length) return []
  return products.map((p) => ({
    catId: p.catId ?? null,
    name: p.name ?? null,
    itemNumber: p.itemNumber ?? null,
    fabricImageLink: p.fabricImageLink ?? null,
    trialNote: p.trialNote ?? null,
    trialVideoLink: p.trialVideoLink ?? null,
    trialImageLinks: p.trialImageLinks ?? null,
  }))
}

/** Products for create flow — use order itemCatId (no attribute-master lookup). */
export function productsFromStoreOrder(
  order: StoreOrderDetail
): OrderTrialProductInput[] {
  return (order.orderItems ?? []).map((item) => ({
    name: item.itemName ?? null,
    itemNumber: item.itemNumber ?? null,
    catId: item.itemCatId ?? null,
    fabricImageLink: item.fabricImage?.trim() || null,
    trialNote: "",
    trialVideoLink: null,
    trialImageLinks: null,
  }))
}

export type QuickTrialUpdateFields = {
  trialStatus?: string | null
  trialRating?: string | null
  trialDecision?: string | null
  measurementStatus?: string | null
  note?: string | null
}

/** Enum/select fields must be null — never "" — or GraphQL rejects them. */
function enumOrNull(value?: string | null): string | null {
  return value?.trim() ? value.trim() : null
}

export function buildQuickUpdatePayload(args: {
  orderId: string
  userId?: string | null
  stylistId?: string | null
  trial: NestedOrderTrial | OrderTrialRow
  fields: QuickTrialUpdateFields
  fallbackTrialDate?: StoreOrderTimestamp | null
  fallbackDeliveryDate?: StoreOrderTimestamp | null
}): OrderTrialInput {
  const { trial, fields } = args
  return {
    orderId: args.orderId,
    userId: args.userId ?? null,
    stylistId: args.stylistId ?? null,
    trialStatus: enumOrNull(fields.trialStatus ?? trial.trialStatus),
    trialRating: enumOrNull(fields.trialRating ?? trial.trialRating),
    trialDecision: enumOrNull(fields.trialDecision ?? trial.trialDecision),
    measurementStatus: enumOrNull(
      fields.measurementStatus ?? trial.measurementStatus
    ),
    note: fields.note?.trim() ? fields.note : (trial.note ?? null),
    trialBy: trial.trialBy ?? null,
    trialDate: cleanTrialDate(trial.trialDate ?? args.fallbackTrialDate),
    deliveryDate: cleanTrialDate(
      trial.deliveryDate ?? args.fallbackDeliveryDate
    ),
    products: cleanTrialProducts(trial.products),
  }
}

export type TrialFormValues = {
  trialStatus: string
  trialRating: string
  trialDecision: string
  measurementStatus: string
  trialBy: string
  note: string
  trialDate: string
  deliveryDate: string
}

export function buildCreateOrUpdateTrialPayload(args: {
  orderId: string
  userId?: string | null
  stylistId?: string | null
  values: TrialFormValues
  products: OrderTrialProductInput[]
}): OrderTrialInput {
  const { values } = args
  return {
    orderId: args.orderId,
    userId: args.userId ?? null,
    stylistId: args.stylistId ?? null,
    trialStatus: values.trialStatus || null,
    trialRating: values.trialRating || null,
    trialDecision: values.trialDecision || null,
    measurementStatus: values.measurementStatus || null,
    trialBy: values.trialBy || null,
    note: values.note || null,
    trialByIds: [],
    trialDate: values.trialDate
      ? extractDateFormat(new Date(`${values.trialDate}T00:00:00`).toISOString())
      : null,
    deliveryDate: values.deliveryDate
      ? extractDateFormat(
          new Date(`${values.deliveryDate}T00:00:00`).toISOString()
        )
      : null,
    products: args.products,
  }
}
