import { extractDateFormat } from "@/lib/appointments/date-payload"
import type {
  StoreOrderDetail,
  StoreOrderItem,
  StoreOrderTimestamp,
} from "@/lib/apollo/queries/store-orders"

function cleanDate(date?: StoreOrderTimestamp | null) {
  if (!date?.timestamp && date?.day == null) return null
  return {
    datestamp: date.datestamp ?? "",
    day: date.day ?? 0,
    hour: date.hour ?? 0,
    minute: date.minute ?? 0,
    month: date.month ?? 0,
    timestamp: date.timestamp ?? "",
    year: date.year ?? 0,
  }
}

function cleanOrderItem(
  item: StoreOrderItem,
  overrides?: { outfitStatus?: string; hasEmbroidary?: boolean }
) {
  return {
    itemName: item.itemName,
    itemPrice: item.itemPrice,
    itemNumber: item.itemNumber,
    itemColor: item.itemColor,
    occasion: item.occasion,
    fabricCode: item.fabricCode,
    fabricImage: item.fabricImage,
    referenceImage: item.referenceImage,
    itemCatId: item.itemCatId,
    productionStatus: item.productionStatus,
    measurementApprovalStatus: item.measurementApprovalStatus,
    dyingWorkshopId: item.dyingWorkshopId,
    dyingWorkshopName: item.dyingWorkshopName,
    embroideryWorkshopId: item.embroideryWorkshopId,
    embroideryWorkshopName: item.embroideryWorkshopName,
    fabricWorkshopId: item.fabricWorkshopId,
    fabricWorkshopName: item.fabricWorkshopName,
    itemWorkshopId: item.itemWorkshopId,
    itemWorkshopName: item.itemWorkshopName,
    // readyItemImage is query-only — not on StoreProductOrderItemInput
    trialDate: cleanDate(item.trialDate),
    readyDate: cleanDate(item.readyDate),
    hasEmbroidary: overrides?.hasEmbroidary ?? !!item.hasEmbroidary,
    outfitStatus: overrides?.outfitStatus ?? item.outfitStatus ?? "not_started",
    styleDesign: item.styleDesign
      ? {
          handDesign: item.styleDesign.handDesign,
          monogramLetter: item.styleDesign.monogramLetter,
          note: item.styleDesign.note,
          styleAttributes: (item.styleDesign.styleAttributes ?? []).map(
            (attr) => ({
              catId: attr.catId,
              image: attr.image,
              master_name: attr.master_name,
              name: attr.name,
              value: attr.value,
            })
          ),
        }
      : null,
    ...(item.referenceLookBooks && item.referenceLookBooks.length > 0
      ? {
          referenceLookBooks: item.referenceLookBooks.map((lb) => ({
            lookBookId: lb.lookBookId,
            lookBookName: lb.lookBookName,
            lookBookTitle: lb.lookBookTitle,
            lookBookNotes: lb.lookBookNotes,
            lookBookImages: lb.lookBookImages,
            imageType: lb.imageType,
            lookBookNo: lb.lookBookNo,
          })),
        }
      : {}),
  }
}

export type OrderEventFormValues = {
  trialDate: string
  deliveryDate: string
  orderStatus: string
  remark: string
  items: Array<{
    key: string
    outfitStatus: string
    hasEmbroidary: boolean
  }>
}

export function buildSaveStoreOrderParams(
  order: StoreOrderDetail,
  values: OrderEventFormValues
): Record<string, unknown> {
  const itemOverrides = new Map(
    values.items.map((item) => [item.key, item] as const)
  )

  const orderItems = (order.orderItems ?? []).map((item, index) => {
    const key = String(item._id ?? item.itemNumber ?? index)
    const override = itemOverrides.get(key)
    return cleanOrderItem(item, override)
  })

  const paymentBreakdown = (order.paymentBreakdown ?? []).map((item) => ({
    date: cleanDate(item.date),
    amount: Number(item.amount) || 0,
    modeOfPayment: item.modeOfPayment,
    note: item.note,
    isAdvance:
      item.isAdvance === true ||
      item.isAdvance === "true",
  }))

  const otherChargesBreakdown = (order.otherChargesBreakdown ?? []).map(
    (item) => ({
      name: item.name,
      amount: Number(item.amount) || 0,
      note: item.note,
    })
  )

  const deductionsBreakdown = (order.deductionsBreakdown ?? []).map((item) => ({
    name: item.name,
    amount: Number(item.amount) || 0,
    note: item.note,
  }))

  return {
    _id: order._id,
    userId: order.userId,
    orderNo: order.orderNo,
    trialDate: values.trialDate
      ? extractDateFormat(new Date(`${values.trialDate}T00:00:00`).toISOString())
      : null,
    deliveryDate: values.deliveryDate
      ? extractDateFormat(
          new Date(`${values.deliveryDate}T00:00:00`).toISOString()
        )
      : null,
    eventDate: cleanDate(order.eventDate),
    orderStatus: values.orderStatus,
    remark: values.remark,
    orderItems,
    paymentBreakdown,
    otherChargesBreakdown,
    deductionsBreakdown,
  }
}
