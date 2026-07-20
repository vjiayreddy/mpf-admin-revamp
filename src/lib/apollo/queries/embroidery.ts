import { gql } from "@apollo/client/core"

export const EMBROIDERY_PAGE_SIZE = 25

export type EmbroideryTimestamp = {
  timestamp?: string | null
  day?: number | null
  month?: number | null
  year?: number | null
} | null

export type EmbroideryListRow = {
  _id: string
  embroideryReqNo?: string | null
  storeOrderProductNumber?: string | null
  storeOrderProductName?: string | null
  storeOrderNo?: string | null
  storeOrderId?: string | null
  storeOrderProductId?: string | null
  customerId?: string | null
  customerName?: string | null
  userId?: string | null
  fabricImage?: string | null
  referenceImage?: string | null
  designReferencesImageUrls?: string[] | null
  designReferenceImages?: string[] | null
  workAreas?: string[] | string | null
  workPlacement?: string | string[] | null
  stylistId?: string | null
  stylist?: Array<{ name?: string | null } | null> | null
  studioId?: string | null
  studio?: Array<{ name?: string | null } | null> | null
  orderStatus?: string | null
  orderDate?: EmbroideryTimestamp
  trialDate?: EmbroideryTimestamp
  embTrialDate?: EmbroideryTimestamp
  embReadyDate?: EmbroideryTimestamp
  markingExpectedDate?: EmbroideryTimestamp
  storeOrder?: {
    orderStatus?: string | null
    trialDate?: EmbroideryTimestamp
    deliveryDate?: EmbroideryTimestamp
  } | null
  orderItemAttributes?: {
    stitchingWorkshopName?: string | null
    stitchingWorkshopId?: string | null
    styleDesignImage?: string | null
    styleDesignImageNote?: string | null
    fabricImage?: string | null
    fabricImageNote?: string | null
    referenceImage?: string | null
    referenceImageNote?: string | null
    trialDate?: EmbroideryTimestamp
  } | null
  workType?: string[] | string | null
  workshopName?: string | null
  workshopId?: string | string[] | null
  machineWorkshopId?: string | string[] | null
  computerizedWorkshopId?: string | string[] | null
  embStatus?: string | null
  markingStatus?: string | null
  sampleStatus?: string | null
  paperStatus?: string | null
  approvalStatus?: string | null
  qcStatus?: string | null
  embRemark?: string | null
  note?: string | null
  estHrs?: number | null
  workHrs?: number | null
  totalActualHrs?: number | null
  price?: number | null
  estimatedCost?: number | null
  costOfEmbroidery?: number | null
  paperNo?: string | null
  paperHrs?: number | null
  sampleHrs?: number | null
  anyDelays?: string | null
  approvalRemarks?: string | null
  markingRemarks?: string | null
  estimatedCostOrPrice?: number | null
  catId?: string | null
}

export type EmbroideryOtherAttribute = {
  inputType?: string | null
  label?: string | null
  name?: string | null
  value?: string | number | null
}

export type EmbroideryBoota = {
  backSizeH?: number | null
  backSizeV?: number | null
  distance1C2CH?: number | null
  distance1C2CV?: number | null
  fractionBackSizeH?: string | null
  fractionBackSizeV?: string | null
  fractionDistance1C2CH?: string | null
  fractionDistance1C2CV?: string | null
  fractionSize1H?: string | null
  fractionSize1V?: string | null
  note?: string | null
  referenceImages?: string[] | null
  size1H?: number | null
  size1V?: number | null
  bootaSide?: string | null
}

export type EmbroideryMonogram = {
  color?: string | null
  colorId?: string | null
  hsize?: number | string | null
  note?: string | null
  positions?: string[] | string | null
  referenceImages?: string[] | null
  vsize?: number | string | null
  shadeNumber?: string | null
  shadeCard?: string | null
}

export type EmbroideryMaterialSample = {
  note?: string | null
  sample?: string | null
  attributes?: Array<{
    color?: string | null
    colorId?: string | null
    label?: string | null
    name?: string | null
    note?: string | null
    customColor?: string | null
  } | null> | null
}

export type EmbroideryFilterInput = {
  stylistId?: string | null
  orderStatus?: string | null
  startEmbTrialDate?: Record<string, unknown> | null
  endEmbTrialDate?: Record<string, unknown> | null
  approvalStatus?: string | null
  embStatus?: string[] | null
  markingStatus?: string | null
  qcStatus?: string | null
  sampleStatus?: string | null
  workType?: string | null
  searchTerm?: string | null
  sortBy?: string | null
  userId?: string | null
}

export type GetEmbroideryByFilterVars = {
  filter: EmbroideryFilterInput
  page?: number
  limit?: number
}

export type GetEmbroideryByFilterData = {
  getEmbroideryByFilter: {
    totalCount: number
    embroideries: EmbroideryListRow[]
  }
}

export type EmbroideryDetail = EmbroideryListRow & {
  fabricName?: string | null
  fabricColor?: string | null
  fabricImageNote?: string | null
  referenceImageNote?: string | null
  styleDesignImage?: string | null
  embType?: string | null
  artworkType?: string | null
  designReferenceImageNote?: string | null
  length?: string | null
  bbs?: string | null
  otherAttributes?: EmbroideryOtherAttribute[] | null
  bootas?: EmbroideryBoota[] | null
  monograms?: EmbroideryMonogram[] | null
  workMaterialSamples?: EmbroideryMaterialSample[] | null
}

/** Lean ops form payload — excludes design bootas/monograms/materials. */
export type EmbroideryOpsDetail = EmbroideryListRow

export type GetEmbroideryOpsByIdData = {
  getEmbroideryById: EmbroideryOpsDetail
}

export type GetEmbroideryByIdData = {
  getEmbroideryById: EmbroideryDetail
}

export type GetEmbroideryByIdVars = {
  id: string
}

export type SaveEmbroideryVars = {
  body: Record<string, unknown>
  id?: string | null
}

export type SaveEmbroideryData = {
  saveEmbroidery: { _id: string }
}

export type EmbroideryAreaOption = {
  sortOrder?: number | null
  name?: string | null
  label?: string | null
}

export type EmbroideryAreaMapEntry = {
  name?: string | null
  label?: string | null
  sortOrder?: number | null
  options?: EmbroideryAreaOption[] | null
}

export type GetEmbroideryAreaMappingData = {
  getEmbroideryAreaMapping: Array<{
    _id: string
    catId?: string | null
    map?: EmbroideryAreaMapEntry[] | null
  } | null> | null
}

export type GetEmbroideryAreaMappingVars = {
  catId: string
}

const EMB_DATE_FIELDS = `
  timestamp
  day
  month
  year
`

/** Lean list selection — avoid full design payload on grid fetches. */
export const GET_EMBROIDERY_BY_FILTER = gql`
  query GetEmbroideryByFilter(
    $filter: EmbroideryFilterInput!
    $page: Int
    $limit: Int
  ) {
    getEmbroideryByFilter(filter: $filter, page: $page, limit: $limit) {
      totalCount
      embroideries {
        _id
        embroideryReqNo
        storeOrderProductNumber
        storeOrderProductName
        storeOrderNo
        storeOrderId
        storeOrderProductId
        customerId
        customerName
        userId
        fabricImage
        referenceImage
        designReferencesImageUrls
        designReferenceImages
        workAreas
        workPlacement
        stylistId
        stylist {
          name
        }
        studioId
        studio {
          name
        }
        orderStatus
        orderDate {
          ${EMB_DATE_FIELDS}
        }
        trialDate {
          ${EMB_DATE_FIELDS}
        }
        embTrialDate {
          ${EMB_DATE_FIELDS}
        }
        embReadyDate {
          ${EMB_DATE_FIELDS}
        }
        markingExpectedDate {
          ${EMB_DATE_FIELDS}
        }
        storeOrder {
          orderStatus
          trialDate {
            ${EMB_DATE_FIELDS}
          }
          deliveryDate {
            ${EMB_DATE_FIELDS}
          }
        }
        orderItemAttributes {
          stitchingWorkshopName
          stitchingWorkshopId
          styleDesignImage
          fabricImage
          referenceImage
          trialDate {
            ${EMB_DATE_FIELDS}
          }
        }
        workType
        workshopName
        workshopId
        machineWorkshopId
        computerizedWorkshopId
        embStatus
        markingStatus
        sampleStatus
        paperStatus
        approvalStatus
        qcStatus
        embRemark
        note
        estHrs
        workHrs
        totalActualHrs
        price
        estimatedCost
        costOfEmbroidery
      }
    }
  }
`

export const GET_EMBROIDERY_BY_ID = gql`
  query GetEmbroideryById($id: ID!) {
    getEmbroideryById(_id: $id) {
      _id
      embroideryReqNo
      storeOrderProductNumber
      storeOrderProductName
      storeOrderNo
      storeOrderId
      storeOrderProductId
      customerId
      customerName
      userId
      catId
      stylistId
      stylist {
        name
      }
      studioId
      studio {
        name
      }
      fabricImage
      fabricImageNote
      referenceImage
      referenceImageNote
      styleDesignImage
      designReferencesImageUrls
      designReferenceImages
      designReferenceImageNote
      fabricName
      fabricColor
      embType
      artworkType
      workType
      workPlacement
      workAreas
      workshopId
      workshopName
      machineWorkshopId
      computerizedWorkshopId
      orderStatus
      orderDate {
        ${EMB_DATE_FIELDS}
      }
      trialDate {
        ${EMB_DATE_FIELDS}
      }
      embTrialDate {
        ${EMB_DATE_FIELDS}
      }
      embReadyDate {
        ${EMB_DATE_FIELDS}
      }
      markingExpectedDate {
        ${EMB_DATE_FIELDS}
      }
      embStatus
      markingStatus
      sampleStatus
      paperStatus
      approvalStatus
      qcStatus
      embRemark
      note
      paperNo
      paperHrs
      sampleHrs
      estHrs
      workHrs
      totalActualHrs
      price
      estimatedCost
      estimatedCostOrPrice
      costOfEmbroidery
      anyDelays
      approvalRemarks
      markingRemarks
      length
      bbs
      otherAttributes {
        inputType
        label
        name
        value
      }
      bootas {
        backSizeH
        backSizeV
        distance1C2CH
        distance1C2CV
        fractionBackSizeH
        fractionBackSizeV
        fractionDistance1C2CH
        fractionDistance1C2CV
        fractionSize1H
        fractionSize1V
        note
        referenceImages
        size1H
        size1V
        bootaSide
      }
      monograms {
        color
        colorId
        hsize
        note
        positions
        referenceImages
        vsize
        shadeNumber
        shadeCard
      }
      workMaterialSamples {
        note
        sample
        attributes {
          color
          colorId
          label
          name
          note
          customColor
        }
      }
      storeOrder {
        orderStatus
        trialDate {
          ${EMB_DATE_FIELDS}
        }
        deliveryDate {
          ${EMB_DATE_FIELDS}
        }
      }
      orderItemAttributes {
        stitchingWorkshopName
        stitchingWorkshopId
        styleDesignImage
        styleDesignImageNote
        fabricImage
        fabricImageNote
        referenceImage
        referenceImageNote
        trialDate {
          ${EMB_DATE_FIELDS}
        }
      }
    }
  }
`

/** Ops form only — no bootas/monograms/materials/design image trees. */
export const GET_EMBROIDERY_OPS_BY_ID = gql`
  query GetEmbroideryOpsById($id: ID!) {
    getEmbroideryById(_id: $id) {
      _id
      embroideryReqNo
      storeOrderProductNumber
      storeOrderProductName
      storeOrderNo
      storeOrderId
      storeOrderProductId
      customerId
      customerName
      userId
      catId
      stylistId
      stylist {
        name
      }
      fabricImage
      referenceImage
      workType
      workAreas
      workshopId
      workshopName
      machineWorkshopId
      computerizedWorkshopId
      orderStatus
      orderDate {
        ${EMB_DATE_FIELDS}
      }
      trialDate {
        ${EMB_DATE_FIELDS}
      }
      embReadyDate {
        ${EMB_DATE_FIELDS}
      }
      markingExpectedDate {
        ${EMB_DATE_FIELDS}
      }
      embStatus
      markingStatus
      sampleStatus
      paperStatus
      approvalStatus
      qcStatus
      embRemark
      note
      paperNo
      paperHrs
      sampleHrs
      estHrs
      workHrs
      totalActualHrs
      price
      estimatedCost
      estimatedCostOrPrice
      anyDelays
      approvalRemarks
      markingRemarks
      storeOrder {
        orderStatus
        trialDate {
          ${EMB_DATE_FIELDS}
        }
      }
      orderItemAttributes {
        fabricImage
        referenceImage
        trialDate {
          ${EMB_DATE_FIELDS}
        }
      }
    }
  }
`

export const GET_EMBROIDERY_AREA_MAPPING = gql`
  query GetEmbroideryAreaMapping($catId: ID!) {
    getEmbroideryAreaMapping(catId: $catId) {
      _id
      catId
      map {
        name
        label
        sortOrder
        options {
          sortOrder
          name
          label
        }
      }
    }
  }
`

export const SAVE_EMBROIDERY = gql`
  mutation SaveEmbroidery($body: SaveEmbroideryInput!, $id: ID) {
    saveEmbroidery(body: $body, _id: $id) {
      _id
    }
  }
`

