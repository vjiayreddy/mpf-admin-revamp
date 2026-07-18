import { gql } from "@apollo/client/core"

export const PRODUCTS_PAGE_LIMIT = 100

export type ProductBrandRef = {
  _id?: string | null
  image?: string | null
  name?: string | null
  title?: string | null
}

export type ProductCategoryRef = {
  _id?: string | null
  image?: string | null
  name?: string | null
  note?: string | null
}

export type ProductColorRef = {
  _id?: string | null
  color?: string | null
  colorname?: string | null
  label?: string | null
}

export type ProductListRow = {
  _id: string
  pidSerial?: number | null
  pId?: number | null
  title?: string | null
  name?: string | null
  images?: string[] | null
  currentStatus?: string | null
  isAvailable?: boolean | null
  sortOrder?: number | null
  catId?: string | null
  category?: ProductCategoryRef[] | null
  internalBrandId?: string | null
  internalBrand?: ProductBrandRef[] | null
  brand?: ProductBrandRef[] | null
  discPrice?: number | null
  price?: number | null
  qty?: number | null
  primaryColor?: ProductColorRef[] | null
  secondaryColor?: ProductColorRef[] | null
}

export type ProductFilterInput = {
  adminSearchTerm?: string
  status?: string
  catIds?: string[]
  internalBrandId?: string
  occasionId?: string
}

export type ProductsFilterVars = {
  params: ProductFilterInput
  page?: number
  limit?: number
}

export type ProductsFilterData = {
  productsFilter: {
    totalItemCount: number
    products: ProductListRow[]
  }
}

export type InternalBrand = {
  _id: string
  image?: string | null
  name?: string | null
  title?: string | null
  isDeleted?: boolean | null
  sortOrder?: number | null
}

export type GetAllInternalBrandsData = {
  getAllInternalBrands: InternalBrand[]
}

export type ProductDetail = ProductListRow & {
  altText?: string | null
  care?: string | null
  code?: string | null
  cost?: number | null
  delivery?: string | null
  deliveryDays?: number | null
  description?: string | null
  discount?: number | null
  fabricCode?: string | null
  fabricType?: string | null
  isAccessory?: boolean | null
  isPer?: boolean | null
  isVirtual?: boolean | null
  isWithPocket?: boolean | null
  occasionId?: string | null
  occasionIds?: string[] | null
  occasions?: Array<{ _id?: string | null }> | null
  producttypeId?: string | null
  subTitle?: string | null
  size?: string | null
  warranty?: string | null
  pImgIndx?: number | null
  primaryColorId?: string | null
  secondaryColorId?: string | null
  seo?: {
    content_description?: string | null
    h1_tag?: string | null
    h2_tag?: string | null
    meta_description?: string | null
    title?: string | null
  } | null
}

export type GetSingleProductData = {
  getSingleProduct: ProductDetail | null
}

export type GetSingleProductVars = {
  productId: string
}

export type ProductInput = {
  title?: string
  subTitle?: string
  description?: string
  code?: string
  size?: string
  sortOrder?: number
  qty?: number
  occasionIds?: string[]
  producttypeId?: string
  catId?: string
  internalBrandId?: string
  isAvailable?: boolean
  cost?: number
  price?: number
  discount?: number
  discPrice?: number
  altText?: string
  care?: string
  delivery?: string
  deliveryDays?: number | null
  warranty?: string
  fabricType?: string
  fabricCode?: string
  isPer?: boolean
  isWithPocket?: boolean
  images?: string[]
  pImgIndx?: number
  primaryColorId?: string
  secondaryColorId?: string
  seo?: {
    h1_tag?: string
    h2_tag?: string
    title?: string
    meta_description?: string
    content_description?: string
  }
}

export type SaveProductVars = {
  body: ProductInput
  teamId: string
  productId?: string
}

export type SaveProductData = {
  saveProduct: {
    _id: string
  }
}

export type OccasionListItem = {
  _id: string
  label?: string | null
  name?: string | null
  occasionType?: string | null
  catIds?: string[] | null
}

export type GetAllOccasionsData = {
  getAllOccasions: OccasionListItem[]
}

export const GET_PRODUCTS_FILTER = gql`
  query ProductsFilter($params: ProductFilter!, $page: Int, $limit: Int) {
    productsFilter(params: $params, page: $page, limit: $limit) {
      totalItemCount
      products {
        _id
        pidSerial
        pId
        title
        name
        images
        currentStatus
        isAvailable
        sortOrder
        catId
        category {
          _id
          image
          name
          note
        }
        internalBrandId
        internalBrand {
          _id
          name
          title
        }
        brand {
          _id
          image
          name
        }
        discPrice
        price
        qty
        primaryColor {
          _id
          color
          colorname
          label
        }
        secondaryColor {
          _id
          color
          colorname
          label
        }
      }
    }
  }
`

export const GET_ALL_INTERNAL_BRANDS = gql`
  query GetAllInternalBrands {
    getAllInternalBrands {
      _id
      image
      name
      isDeleted
      sortOrder
      title
    }
  }
`

export const GET_ALL_OCCASIONS = gql`
  query GetAllOccasions {
    getAllOccasions {
      _id
      label
      name
      occasionType
      catIds
    }
  }
`

export const GET_SINGLE_PRODUCT_BY_ID = gql`
  query GetSingleProduct($productId: ID!) {
    getSingleProduct(productId: $productId) {
      _id
      pidSerial
      pId
      title
      name
      subTitle
      description
      code
      size
      sortOrder
      qty
      catId
      currentStatus
      isAvailable
      internalBrandId
      producttypeId
      occasionId
      occasionIds
      occasions {
        _id
      }
      cost
      price
      discount
      discPrice
      altText
      care
      delivery
      deliveryDays
      warranty
      fabricType
      fabricCode
      isPer
      isWithPocket
      images
      pImgIndx
      primaryColorId
      secondaryColorId
      category {
        _id
        name
      }
      internalBrand {
        _id
        name
        title
      }
      seo {
        content_description
        h1_tag
        h2_tag
        meta_description
        title
      }
    }
  }
`

export const SAVE_PRODUCT = gql`
  mutation SaveProduct($body: ProductInput!, $teamId: String!, $productId: ID) {
    saveProduct(body: $body, teamId: $teamId, productId: $productId) {
      _id
    }
  }
`
