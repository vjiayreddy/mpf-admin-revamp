import {
  DEFAULT_ORDER_STATUS,
  DEFAULT_SORT,
  EMBROIDERY_FILTER_PARAMS,
  type EmbroiderySortBy,
} from "@/config/embroidery-filters"
import {
  APPROVAL_STATUS_OPTIONS,
  EMB_ORDER_STATUS_OPTIONS,
  MARKING_STATUS_OPTIONS,
  QC_STATUS_OPTIONS,
  SAMPLE_STATUS_OPTIONS,
  WORK_TYPE_OPTIONS,
  getEmbroideryStatusLabel,
} from "@/config/embroidery-status"
import {
  EMBROIDERY_PAGE_SIZE,
  type EmbroideryFilterInput,
  type GetEmbroideryByFilterVars,
} from "@/lib/apollo/queries/embroidery"
import {
  endDateFilter,
  startDateFilter,
} from "@/lib/customers/date-filter"

export type ActiveEmbroideryFilter = {
  id: string
  label: string
  displayValue: string
  clear: Record<string, null>
}

function optionLabel(
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string
) {
  return options.find((o) => o.value === value)?.label ?? value
}

export function buildEmbroideryFilterFromSearchParams(
  searchParams: URLSearchParams,
  defaultStylistId?: string | null
): EmbroideryFilterInput {
  const p = EMBROIDERY_FILTER_PARAMS
  const filter: EmbroideryFilterInput = {}

  const stylistId =
    searchParams.get(p.stylistId) || defaultStylistId || undefined
  if (stylistId) filter.stylistId = stylistId

  const userId = searchParams.get(p.userId)?.trim()
  if (userId) filter.userId = userId

  const orderStatus =
    searchParams.get(p.orderStatus) || DEFAULT_ORDER_STATUS
  if (orderStatus && orderStatus !== "ALL") {
    filter.orderStatus = orderStatus
  }

  const embStatusRaw = searchParams.get(p.embStatus)
  if (embStatusRaw) {
    const statuses = embStatusRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    if (statuses.length) filter.embStatus = statuses
  }

  const start = searchParams.get(p.startEmbTrialDate)
  if (start) filter.startEmbTrialDate = startDateFilter(start)

  const end = searchParams.get(p.endEmbTrialDate)
  if (end) filter.endEmbTrialDate = endDateFilter(end)

  const approvalStatus = searchParams.get(p.approvalStatus)
  if (approvalStatus) filter.approvalStatus = approvalStatus

  const markingStatus = searchParams.get(p.markingStatus)
  if (markingStatus) filter.markingStatus = markingStatus

  const qcStatus = searchParams.get(p.qcStatus)
  if (qcStatus) filter.qcStatus = qcStatus

  const sampleStatus = searchParams.get(p.sampleStatus)
  if (sampleStatus) filter.sampleStatus = sampleStatus

  const workType = searchParams.get(p.workType)
  if (workType && workType !== "all") filter.workType = workType

  const searchTerm = searchParams.get(p.searchTerm)?.trim()
  if (searchTerm) filter.searchTerm = searchTerm

  const sortRaw = searchParams.get(p.sortByEnum)
  const sortBy: EmbroiderySortBy =
    sortRaw === "ORDER_DATE" || sortRaw === "EMB_TRIAL_DATE"
      ? sortRaw
      : DEFAULT_SORT
  filter.sortBy = sortBy

  return filter
}

export function buildEmbroideryQueryVars(
  searchParams: URLSearchParams,
  page0Based: number,
  defaultStylistId?: string | null,
  pageSize = EMBROIDERY_PAGE_SIZE
): GetEmbroideryByFilterVars {
  return {
    page: page0Based + 1,
    limit: pageSize,
    filter: buildEmbroideryFilterFromSearchParams(
      searchParams,
      defaultStylistId
    ),
  }
}

export function listActiveEmbroideryFilters(
  searchParams: URLSearchParams,
  stylistNameById?: Map<string, string>
): ActiveEmbroideryFilter[] {
  const p = EMBROIDERY_FILTER_PARAMS
  const chips: ActiveEmbroideryFilter[] = []

  const searchTerm = searchParams.get(p.searchTerm)
  if (searchTerm) {
    chips.push({
      id: "searchTerm",
      label: "Search",
      displayValue: searchTerm,
      clear: { [p.searchTerm]: null },
    })
  }

  const stylistId = searchParams.get(p.stylistId)
  if (stylistId) {
    chips.push({
      id: "stylistId",
      label: "Stylist",
      displayValue: stylistNameById?.get(stylistId) ?? "Selected stylist",
      clear: { [p.stylistId]: null },
    })
  }

  const orderStatus = searchParams.get(p.orderStatus)
  if (orderStatus && orderStatus !== DEFAULT_ORDER_STATUS) {
    chips.push({
      id: "orderStatus",
      label: "Order status",
      displayValue: optionLabel(EMB_ORDER_STATUS_OPTIONS, orderStatus),
      clear: { [p.orderStatus]: null },
    })
  }

  const embStatus = searchParams.get(p.embStatus)
  if (embStatus) {
    chips.push({
      id: "embStatus",
      label: "Emb status",
      displayValue: embStatus
        .split(",")
        .map((s) => getEmbroideryStatusLabel("embStatus", s.trim()))
        .join(", "),
      clear: { [p.embStatus]: null },
    })
  }

  const workType = searchParams.get(p.workType)
  if (workType) {
    chips.push({
      id: "workType",
      label: "Work type",
      displayValue: optionLabel(WORK_TYPE_OPTIONS, workType),
      clear: { [p.workType]: null },
    })
  }

  const sortByEnum = searchParams.get(p.sortByEnum)
  if (sortByEnum === "ORDER_DATE" || sortByEnum === "EMB_TRIAL_DATE") {
    if (sortByEnum !== DEFAULT_SORT) {
      chips.push({
        id: "sortByEnum",
        label: "Sort",
        displayValue:
          sortByEnum === "ORDER_DATE" ? "Order date" : "Emb trial date",
        clear: { [p.sortByEnum]: null },
      })
    }
  }

  const start = searchParams.get(p.startEmbTrialDate)
  if (start) {
    chips.push({
      id: "startEmbTrialDate",
      label: "Trial from",
      displayValue: new Date(start).toLocaleDateString("en-GB"),
      clear: { [p.startEmbTrialDate]: null },
    })
  }

  const end = searchParams.get(p.endEmbTrialDate)
  if (end) {
    chips.push({
      id: "endEmbTrialDate",
      label: "Trial to",
      displayValue: new Date(end).toLocaleDateString("en-GB"),
      clear: { [p.endEmbTrialDate]: null },
    })
  }

  const approvalStatus = searchParams.get(p.approvalStatus)
  if (approvalStatus) {
    chips.push({
      id: "approvalStatus",
      label: "Approval",
      displayValue: optionLabel(APPROVAL_STATUS_OPTIONS, approvalStatus),
      clear: { [p.approvalStatus]: null },
    })
  }

  const markingStatus = searchParams.get(p.markingStatus)
  if (markingStatus) {
    chips.push({
      id: "markingStatus",
      label: "Marking",
      displayValue: optionLabel(MARKING_STATUS_OPTIONS, markingStatus),
      clear: { [p.markingStatus]: null },
    })
  }

  const qcStatus = searchParams.get(p.qcStatus)
  if (qcStatus) {
    chips.push({
      id: "qcStatus",
      label: "QC",
      displayValue: optionLabel(QC_STATUS_OPTIONS, qcStatus),
      clear: { [p.qcStatus]: null },
    })
  }

  const sampleStatus = searchParams.get(p.sampleStatus)
  if (sampleStatus) {
    chips.push({
      id: "sampleStatus",
      label: "Sample",
      displayValue: optionLabel(SAMPLE_STATUS_OPTIONS, sampleStatus),
      clear: { [p.sampleStatus]: null },
    })
  }

  const userId = searchParams.get(p.userId)
  if (userId) {
    chips.push({
      id: "userId",
      label: "Customer",
      displayValue: userId,
      clear: { [p.userId]: null },
    })
  }

  return chips
}

export function getClearAllEmbroideryFilterUpdates(): Record<string, null> {
  const p = EMBROIDERY_FILTER_PARAMS
  return {
    [p.searchTerm]: null,
    [p.stylistId]: null,
    [p.orderStatus]: null,
    [p.workType]: null,
    [p.sortByEnum]: null,
    [p.startEmbTrialDate]: null,
    [p.endEmbTrialDate]: null,
    [p.approvalStatus]: null,
    [p.embStatus]: null,
    [p.markingStatus]: null,
    [p.qcStatus]: null,
    [p.sampleStatus]: null,
  }
}
