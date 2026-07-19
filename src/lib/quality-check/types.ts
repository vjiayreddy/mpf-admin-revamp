export type QcChecklistSection = {
  check?: boolean | null
  note?: string | null
  rating?: number | null
}

export type QcActualMeasurement = {
  name?: string | null
  value?: string | number | null
}

export type QcCompareField = {
  label: string
  body?: string | null
  loosening?: string | null
  ready?: string | null
  front?: string | null
  back?: string | null
  actualKey: string
  /** Option name used as baseline for Difference (legacy calculateValues first arg). */
  diffBase?: string | null
}

export type OrderQualityCheckItem = {
  _id: string
  qualityCheckStatus?: string | null
  itemNumber?: string | number | null
}

export type OrderQualityCheckDetail = {
  _id?: string | null
  orderId?: string | null
  userId?: string | null
  stylistId?: string | null
  itemNumber?: string | number | null
  name?: string | null
  catId?: string | null
  qualityCheckNote?: string | null
  qualityCheckStatus?: string | null
  productImage?: string | null
  fabricAndColor?: QcChecklistSection | null
  design?: QcChecklistSection | null
  measurements?: QcChecklistSection | null
  finishing?: QcChecklistSection | null
  cleanliness?: QcChecklistSection | null
  ironAndPackaging?: QcChecklistSection | null
  actualMeasurement?: QcActualMeasurement[] | null
  storeProductOrder?: {
    orderNo?: string | number | null
    customerFirstName?: string | null
    customerLastName?: string | null
    orderDate?: { timestamp?: string | null } | null
    trialDate?: { timestamp?: string | null } | null
    orderItems?: Array<{
      _id?: string | null
      itemNumber?: string | number | null
      itemName?: string | null
      itemCatId?: string | null
      fabricImage?: string | null
      styleDesignImage?: string | null
      itemColor?: string | null
    } | null> | null
  } | null
  stylist?: { name?: string | null } | null
}
