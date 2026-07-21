import { isValidPhoneNumber } from "react-phone-number-input"
import { z } from "zod"

import {
  ORDER_PRODUCT_ATTRIBUTE_MASTERS,
  ORDER_PRODUCT_CAT_CODES,
} from "@/config/order-form"
import { extractDateFormat, isoToDateInput } from "@/lib/appointments/date-payload"
import type { CustomerProfileUser } from "@/lib/apollo/queries/get-user"
import type {
  StoreOrderDetail,
  StoreOrderItem,
  StoreOrderTimestamp,
} from "@/lib/apollo/queries/store-orders"
import { splitPhoneForApi } from "@/lib/customers/create-customer-schema"

export const orderFormSchema = z.object({
  _id: z.string().min(1, "Order id is required"),
  userId: z.string().min(1, "Customer is required"),
  orderNo: z.string().min(1, "Order number is required"),
  customerId: z.string().min(1, "Customer serial no is required"),
  customerFirstName: z.string().min(1, "First name is required"),
  customerLastName: z.string().min(1, "Last name is required"),
  customerPhone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .refine((value) => isValidPhoneNumber(value), {
      message: "Enter a valid phone number.",
    }),
  customerEmail: z.string().email("Invalid email").or(z.literal("")).optional(),
  customerSegment: z.string().optional(),
  customerCity: z.string().optional(),
  customerHeight: z.string().optional(),
  customerWeight: z.string().optional(),
  customerIsStyleClubMember: z.enum(["YES", "NO"]).optional(),
  studioId: z.string().min(1, "Studio is required"),
  sourceChannelId: z.string().min(1, "Source is required"),
  sourceSubChannelId: z.string().min(1, "Sub source is required"),
  personalStylistId: z.string().min(1, "Personal stylist is required"),
  orderStatus: z.string().min(1, "Status is required"),
  orderDate: z.string().min(1, "Order date is required"),
  trialDate: z.string().min(1, "Trial date is required"),
  eventDate: z.string().optional(),
  readyDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  remark: z.string().optional(),
})

export type OrderFormValues = z.infer<typeof orderFormSchema>

/** Editable order item row kept in local state (not RHF). */
export type OrderFormItem = {
  /** Stable client key for React lists. */
  key: string
  _id?: string | null
  itemName: string
  itemCatId: string
  itemNumber?: string | number | null
  itemColor: string
  fabricCode: string
  itemPrice: number
  occasion: string
  hasEmbroidary: boolean
  trialDate: string
  readyDate: string
  fabricImage: string
  fabricImageNote: string
  referenceImage: string
  referenceImageNote: string
  fitImage: string
  fitImageNote: string
  outfitStatus?: string | null
  productionStatus?: string | null
  measurementApprovalStatus?: string | null
  dyingWorkshopId?: string | null
  dyingWorkshopName?: string | null
  embroideryWorkshopId?: string | null
  embroideryWorkshopName?: string | null
  fabricWorkshopId?: string | null
  fabricWorkshopName?: string | null
  itemWorkshopId?: string | null
  itemWorkshopName?: string | null
  embDetails?: StoreOrderItem["embDetails"]
  /** Draft embroidery design JSON (create path before order save). */
  embDesignDetails?: string | null
  styleDesign?: StoreOrderItem["styleDesign"]
  referenceLookBooks?: StoreOrderItem["referenceLookBooks"]
}

export type OrderMoneyLine = {
  name?: string | null
  amount?: number | null
  note?: string | null
}

export type OrderPaymentLine = {
  note?: string | null
  amount?: number | null
  modeOfPayment?: string | null
  isAdvance?: boolean | string | null
  date?: StoreOrderTimestamp | null
  screenShotUrl?: string | null
  isVerified?: boolean | string | null
  verifiedBy?: string | null
  accountRemark?: string | null
}

function toE164Phone(
  countryCode?: string | null,
  phone?: string | null
): string {
  if (!phone?.trim()) return ""
  const raw = phone.trim()
  if (raw.startsWith("+") && isValidPhoneNumber(raw)) return raw
  const code = (countryCode || "91").replace(/^\+/, "").replace(/\D/g, "")
  const national = raw.replace(/\D/g, "")
  return `+${code}${national}`
}

function timestampToDateInput(value?: StoreOrderTimestamp | null) {
  return isoToDateInput(value?.timestamp)
}

function todayDateInput() {
  return isoToDateInput(new Date().toISOString())
}

function styleClubMemberValue(
  value?: string | boolean | null
): "YES" | "NO" {
  if (value === true || value === "YES" || value === "true") return "YES"
  return "NO"
}

function newItemKey() {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function emptyOrderFormValues(): OrderFormValues {
  return {
    _id: "",
    userId: "",
    orderNo: "",
    customerId: "",
    customerFirstName: "",
    customerLastName: "",
    customerPhone: "",
    customerEmail: "",
    customerSegment: "",
    customerCity: "",
    customerHeight: "",
    customerWeight: "",
    customerIsStyleClubMember: "NO",
    studioId: "",
    sourceChannelId: "",
    sourceSubChannelId: "",
    personalStylistId: "",
    orderStatus: "DRAFT",
    orderDate: todayDateInput(),
    trialDate: "",
    eventDate: "",
    readyDate: "",
    deliveryDate: "",
    remark: "",
  }
}

export function emptyOrderFormItem(
  defaults?: Partial<Pick<OrderFormItem, "trialDate" | "readyDate">>
): OrderFormItem {
  return {
    key: newItemKey(),
    itemName: "",
    itemCatId: "NA",
    itemColor: "",
    fabricCode: "",
    itemPrice: 0,
    occasion: "",
    hasEmbroidary: false,
    trialDate: defaults?.trialDate ?? "",
    readyDate: defaults?.readyDate ?? "",
    fabricImage: "",
    fabricImageNote: "",
    referenceImage: "",
    referenceImageNote: "",
    fitImage: "",
    fitImageNote: "",
    outfitStatus: "not_started",
  }
}

export function catIdForItemName(itemName: string) {
  const hit = ORDER_PRODUCT_ATTRIBUTE_MASTERS.find((p) => p.name === itemName)
  return hit?.catId || "NA"
}

export function assignProductNumbers(
  items: OrderFormItem[],
  orderNo: string | number
): OrderFormItem[] {
  const orderNoNum = Number(orderNo)
  if (!Number.isFinite(orderNoNum) || items.length === 0) return items

  const byName = new Map<string, OrderFormItem[]>()
  for (const item of items) {
    const name = item.itemName || "others"
    const list = byName.get(name) ?? []
    list.push(item)
    byName.set(name, list)
  }

  const numbered = new Map<string, string | number>()
  for (const [name, group] of byName) {
    const code =
      ORDER_PRODUCT_CAT_CODES.find((c) => c.name === name)?.code ?? ""
    group.forEach((item, index) => {
      numbered.set(item.key, `${orderNoNum}${code}${index + 1}`)
    })
  }

  return items.map((item) => ({
    ...item,
    itemNumber: numbered.get(item.key) ?? item.itemNumber,
    itemCatId: item.itemCatId || catIdForItemName(item.itemName),
  }))
}

export function orderItemsFromDetail(
  order: StoreOrderDetail | null | undefined
): OrderFormItem[] {
  return (order?.orderItems ?? []).filter(Boolean).map((item, index) => ({
    key: String(item?._id ?? item?.itemNumber ?? `loaded-${index}`),
    _id: item?._id,
    itemName: item?.itemName?.trim() || "",
    itemCatId: item?.itemCatId || catIdForItemName(item?.itemName?.trim() || ""),
    itemNumber: item?.itemNumber,
    itemColor: item?.itemColor?.trim() || "",
    fabricCode: item?.fabricCode?.trim() || "",
    itemPrice: Number(item?.itemPrice) || 0,
    occasion: item?.occasion?.trim() || "",
    hasEmbroidary: Boolean(item?.hasEmbroidary),
    trialDate: timestampToDateInput(item?.trialDate),
    readyDate: timestampToDateInput(item?.readyDate),
    fabricImage: item?.fabricImage?.trim() || "",
    fabricImageNote: item?.fabricImageNote?.trim() || "",
    referenceImage: item?.referenceImage?.trim() || "",
    referenceImageNote: item?.referenceImageNote?.trim() || "",
    fitImage: item?.fitImage?.trim() || "",
    fitImageNote: item?.fitImageNote?.trim() || "",
    outfitStatus: item?.outfitStatus,
    productionStatus: item?.productionStatus,
    measurementApprovalStatus: item?.measurementApprovalStatus,
    dyingWorkshopId: item?.dyingWorkshopId,
    dyingWorkshopName: item?.dyingWorkshopName,
    embroideryWorkshopId: item?.embroideryWorkshopId,
    embroideryWorkshopName: item?.embroideryWorkshopName,
    fabricWorkshopId: item?.fabricWorkshopId,
    fabricWorkshopName: item?.fabricWorkshopName,
    itemWorkshopId: item?.itemWorkshopId,
    itemWorkshopName: item?.itemWorkshopName,
    embDetails: item?.embDetails,
    styleDesign: item?.styleDesign,
    referenceLookBooks: item?.referenceLookBooks,
  }))
}

/**
 * After order save, merge server-generated embroidery ids onto local items
 * and clear embDesignDetails drafts that have been promoted.
 */
export function promoteEmbroideryFromServer(
  localItems: OrderFormItem[],
  serverItems: OrderFormItem[]
): OrderFormItem[] {
  return localItems.map((local) => {
    const match =
      serverItems.find(
        (s) => local._id && s._id && local._id === s._id
      ) ??
      serverItems.find(
        (s) =>
          local.itemNumber != null &&
          s.itemNumber != null &&
          String(local.itemNumber) === String(s.itemNumber)
      ) ??
      serverItems.find(
        (s) =>
          local.itemName === s.itemName &&
          (local.itemColor || "") === (s.itemColor || "") &&
          Number(local.itemPrice) === Number(s.itemPrice)
      )

    if (!match) return local

    const embroideryId = match.embDetails?.embroideryId?.trim() || ""
    return {
      ...local,
      _id: match._id ?? local._id,
      itemNumber: match.itemNumber ?? local.itemNumber,
      embDetails: match.embDetails ?? local.embDetails,
      embroideryWorkshopId:
        match.embroideryWorkshopId ?? local.embroideryWorkshopId,
      embroideryWorkshopName:
        match.embroideryWorkshopName ?? local.embroideryWorkshopName,
      // Draft is consumed once the server has created an embroidery record
      embDesignDetails: embroideryId ? null : local.embDesignDetails,
    }
  })
}

export function orderFormValuesFromDetail(
  order: StoreOrderDetail
): OrderFormValues {
  return {
    _id: order._id,
    userId: order.userId?.trim() || "",
    orderNo: order.orderNo != null ? String(order.orderNo) : "",
    customerId:
      order.customerId != null ? String(order.customerId) : "",
    customerFirstName: order.customerFirstName?.trim() || "",
    customerLastName: order.customerLastName?.trim() || "",
    customerPhone: toE164Phone(order.customerCountryCode, order.customerPhone),
    customerEmail: order.customerEmail?.trim() || "",
    customerSegment: order.customerSegment?.trim() || "",
    customerCity: order.customerCity?.trim() || "",
    customerHeight:
      order.customerHeight != null ? String(order.customerHeight) : "",
    customerWeight:
      order.customerWeight != null ? String(order.customerWeight) : "",
    customerIsStyleClubMember: styleClubMemberValue(
      order.customerIsStyleClubMember
    ),
    studioId: order.studioId?.trim() || "",
    sourceChannelId: order.sourceChannelId?.trim() || "",
    sourceSubChannelId: order.sourceSubChannelId?.trim() || "",
    personalStylistId:
      order.personalStylistId?.trim() || order.stylist?.[0]?._id?.trim() || "",
    orderStatus: order.orderStatus?.trim() || "DRAFT",
    orderDate: timestampToDateInput(order.orderDate) || todayDateInput(),
    trialDate: timestampToDateInput(order.trialDate),
    eventDate: timestampToDateInput(order.eventDate),
    readyDate: timestampToDateInput(order.readyDate),
    deliveryDate: timestampToDateInput(order.deliveryDate),
    remark: order.remark?.trim() || "",
  }
}

export function applyUserToOrderFormValues(
  values: OrderFormValues,
  user: CustomerProfileUser,
  opts: {
    orderId: string
    orderNo: string | number
    orderStatus?: string | null
    personalStylistId: string
  }
): OrderFormValues {
  const serial =
    user.customerSrNo != null ? String(user.customerSrNo) : ""

  return {
    ...values,
    _id: opts.orderId,
    userId: user._id,
    orderNo: String(opts.orderNo),
    orderStatus: opts.orderStatus?.trim() || values.orderStatus || "DRAFT",
    customerId: serial,
    customerFirstName: user.firstName?.trim() || "",
    customerLastName: user.lastName?.trim() || "",
    customerPhone: toE164Phone(user.countryCode, user.phone),
    customerEmail: user.email?.trim() || "",
    customerSegment: user.customerSegment?.trim() || "",
    customerCity: user.cityName?.trim() || "",
    customerIsStyleClubMember: user.isStyleClubMember ? "YES" : "NO",
    studioId: user.studioId?.trim() || values.studioId,
    personalStylistId:
      opts.personalStylistId ||
      user.stylistId?.trim() ||
      user.stylist?.[0]?._id?.trim() ||
      values.personalStylistId,
    orderDate: values.orderDate || todayDateInput(),
  }
}

function dateInputToPayload(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return extractDateFormat(new Date(`${trimmed}T00:00:00`).toISOString())
}

function cleanTimestamp(date?: StoreOrderTimestamp | null) {
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

function sumAmounts(
  lines: Array<{ amount?: number | null } | null | undefined>
) {
  return lines.reduce((sum, line) => sum + (Number(line?.amount) || 0), 0)
}

function cleanStyleDesign(styleDesign: StoreOrderItem["styleDesign"]) {
  if (!styleDesign) return null
  return {
    handDesign: styleDesign.handDesign,
    monogramLetter: styleDesign.monogramLetter,
    note: styleDesign.note,
    styleAttributes: (styleDesign.styleAttributes ?? []).map((attr) => ({
      catId: attr.catId,
      image: attr.image,
      master_name: attr.master_name,
      name: attr.name,
      value: attr.value,
    })),
  }
}

export function calculateOrderTotals(
  items: OrderFormItem[],
  otherCharges: OrderMoneyLine[],
  deductions: OrderMoneyLine[],
  payments: OrderPaymentLine[]
) {
  const orderTotal = items.reduce(
    (sum, item) => sum + (Number(item.itemPrice) || 0),
    0
  )
  const otherChargesTotal = sumAmounts(otherCharges)
  const deductionsTotal = sumAmounts(deductions)
  const paymentTotal = sumAmounts(payments)
  const afterChargesTotal = orderTotal + otherChargesTotal
  const afterDeductionsTotal = afterChargesTotal - deductionsTotal
  const balanceAmount = afterDeductionsTotal - paymentTotal
  return {
    orderTotal,
    otherCharges: otherChargesTotal,
    afterChargesTotal,
    deductions: deductionsTotal,
    afterDeductionsTotal,
    payment: paymentTotal,
    balanceAmount,
  }
}

export function buildOrderSavePayload(args: {
  values: OrderFormValues
  items: OrderFormItem[]
  sourceChannelName?: string | null
  sourceSubChannelName?: string | null
  otherChargesBreakdown?: OrderMoneyLine[]
  deductionsBreakdown?: OrderMoneyLine[]
  paymentBreakdown?: OrderPaymentLine[]
  secondaryStylistIds?: string[] | null
  leadIds?: string[] | null
  customerCifIds?: string[] | null
}): Record<string, unknown> {
  const { values } = args
  const { countryCode, phone } = splitPhoneForApi(values.customerPhone.trim())
  const numberedItems = assignProductNumbers(args.items, values.orderNo)
  const otherChargesBreakdown = args.otherChargesBreakdown ?? []
  const deductionsBreakdown = args.deductionsBreakdown ?? []
  const paymentBreakdown = args.paymentBreakdown ?? []
  const totals = calculateOrderTotals(
    numberedItems,
    otherChargesBreakdown,
    deductionsBreakdown,
    paymentBreakdown
  )

  const orderItems = numberedItems.map((item) => ({
    itemName: item.itemName,
    itemPrice: Number(item.itemPrice) || 0,
    itemNumber: item.itemNumber,
    itemCatId: item.itemCatId || catIdForItemName(item.itemName) || "NA",
    itemColor: item.itemColor || "",
    ...(item.occasion ? { occasion: item.occasion } : {}),
    fabricCode: item.fabricCode || "",
    trialDate: dateInputToPayload(item.trialDate),
    readyDate: dateInputToPayload(item.readyDate),
    fabricImage: item.fabricImage || "",
    fabricImageNote: item.fabricImageNote || "",
    referenceImage: item.referenceImage || "",
    referenceImageNote: item.referenceImageNote || "",
    fitImage: item.fitImage || "",
    fitImageNote: item.fitImageNote || "",
    hasEmbroidary: Boolean(item.hasEmbroidary),
    outfitStatus: item.outfitStatus || "not_started",
    ...(item.productionStatus
      ? { productionStatus: item.productionStatus }
      : {}),
    ...(item.measurementApprovalStatus
      ? { measurementApprovalStatus: item.measurementApprovalStatus }
      : {}),
    ...(item.dyingWorkshopId ? { dyingWorkshopId: item.dyingWorkshopId } : {}),
    ...(item.dyingWorkshopName
      ? { dyingWorkshopName: item.dyingWorkshopName }
      : {}),
    ...(item.embroideryWorkshopId
      ? { embroideryWorkshopId: item.embroideryWorkshopId }
      : {}),
    ...(item.embroideryWorkshopName
      ? { embroideryWorkshopName: item.embroideryWorkshopName }
      : {}),
    ...(item.fabricWorkshopId
      ? { fabricWorkshopId: item.fabricWorkshopId }
      : {}),
    ...(item.fabricWorkshopName
      ? { fabricWorkshopName: item.fabricWorkshopName }
      : {}),
    ...(item.itemWorkshopId ? { itemWorkshopId: item.itemWorkshopId } : {}),
    ...(item.itemWorkshopName
      ? { itemWorkshopName: item.itemWorkshopName }
      : {}),
    ...(() => {
      const cleaned = cleanStyleDesign(item.styleDesign)
      return {
        styleDesign: cleaned,
        ...(cleaned ? { saveStyleDesignHistory: true } : {}),
      }
    })(),
    ...(item.embDesignDetails
      ? (() => {
          try {
            const parsed =
              typeof item.embDesignDetails === "string"
                ? JSON.parse(item.embDesignDetails)
                : item.embDesignDetails
            return parsed ? { embDesignDetails: parsed } : {}
          } catch {
            return {}
          }
        })()
      : {}),
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
  }))

  return {
    _id: values._id,
    userId: values.userId,
    customerId: String(values.customerId),
    customerCountryCode: countryCode,
    customerPhone: phone,
    customerEmail: values.customerEmail?.trim() || "",
    customerSegment: values.customerSegment?.trim() || null,
    customerFirstName: values.customerFirstName.trim(),
    customerLastName: values.customerLastName.trim(),
    customerIsStyleClubMember: values.customerIsStyleClubMember || "NO",
    customerHeight: values.customerHeight
      ? parseFloat(values.customerHeight)
      : 0,
    customerWeight: values.customerWeight
      ? parseFloat(values.customerWeight)
      : 0,
    customerCity: values.customerCity?.trim() || "",
    personalStylistId: values.personalStylistId || null,
    secondaryStylistIds: args.secondaryStylistIds?.length
      ? args.secondaryStylistIds
      : null,
    leadIds: args.leadIds?.length ? args.leadIds : [],
    customerCifIds: args.customerCifIds?.length ? args.customerCifIds : [],
    customerPersonaIds: null,
    orderNo: Number(values.orderNo),
    sourceChannelId: values.sourceChannelId || null,
    sourceSubChannelId: values.sourceSubChannelId || null,
    sourceChannel: args.sourceChannelName || null,
    sourceSubChannel: args.sourceSubChannelName || null,
    studioId: values.studioId,
    orderDate: dateInputToPayload(values.orderDate),
    eventDate: dateInputToPayload(values.eventDate),
    trialDate: dateInputToPayload(values.trialDate),
    readyDate: dateInputToPayload(values.readyDate),
    deliveryDate: dateInputToPayload(values.deliveryDate),
    orderStatus: values.orderStatus,
    remark: values.remark?.trim() || "",
    orderItems,
    otherChargesBreakdown: otherChargesBreakdown.map((item) => ({
      name: item.name,
      amount: Number(item.amount) || 0,
      note: item.note,
    })),
    deductionsBreakdown: deductionsBreakdown.map((item) => ({
      name: item.name,
      amount: Number(item.amount) || 0,
      note: item.note,
    })),
    paymentBreakdown: paymentBreakdown.map((item) => ({
      date: cleanTimestamp(item.date),
      amount: Number(item.amount) || 0,
      modeOfPayment: item.modeOfPayment,
      note: item.note,
      isAdvance:
        item.isAdvance === true ||
        item.isAdvance === "true",
      ...(item.screenShotUrl
        ? { screenShotUrl: item.screenShotUrl }
        : {}),
      ...(item.verifiedBy ? { verifiedBy: item.verifiedBy } : {}),
      ...(item.isVerified != null ? { isVerified: item.isVerified } : {}),
      ...(item.accountRemark
        ? { accountRemark: item.accountRemark }
        : {}),
    })),
    orderTotal: totals.orderTotal,
    otherCharges: totals.otherCharges,
    afterChargesTotal: totals.afterChargesTotal,
    deductions: totals.deductions,
    afterDeductionsTotal: totals.afterDeductionsTotal,
    payment: totals.payment,
    balanceAmount: totals.balanceAmount,
    note: "",
  }
}

export function formatProductLabel(name: string) {
  return name
    .split(/[/_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
