/** URL + GraphQL filter keys for the products list. */

export const PRODUCT_FILTER_PARAMS = {
  page: "page",
  searchTerm: "searchTerm",
  status: "status",
  catId: "catId",
  internalBrand: "internalBrand",
  occasionId: "occasionId",
} as const

/**
 * API requires occasionId on productsFilter.
 * Legacy list always sent this id (see ProductGridList).
 */
export const DEFAULT_PRODUCT_OCCASION_ID = "5fc2677bfa7ff20df01ab8ce"

export const MORE_PRODUCT_FILTER_KEYS = [
  PRODUCT_FILTER_PARAMS.catId,
] as const

/** Product status options (legacy product_status, excluding ALL). */
export const PRODUCT_STATUS_OPTIONS = [
  { value: "CREATED", label: "Created" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  {
    value: "PUBLISHED_WITH_SHOPIFY_SYNC",
    label: "Published With Shopify Sync",
  },
] as const

/** Static master categories used by legacy More filters. */
export const PRODUCT_CATEGORY_OPTIONS = [
  { value: "5da7220571762c2a58b27a65", label: "Shirts" },
  { value: "5da7220571762c2a58b27a67", label: "Trousers" },
  { value: "5da7220571762c2a58b27a66", label: "Suits" },
  { value: "5da7220571762c2a58b27a68", label: "Blazers" },
  { value: "5da7220571762c2a58b27a6a", label: "Waistcoats" },
  { value: "5da7220571762c2a58b27a6b", label: "Chinos" },
  { value: "5da7220571762c2a58b27a6f", label: "Indo Western" },
  { value: "5da7220571762c2a58b27a6e", label: "Kurta" },
  { value: "5da7220571762c2a58b27a6c", label: "Jodhpuris" },
  { value: "5da7220571762c2a58b27a70", label: "Sherwanis" },
  { value: "5da7220571762c2a58b27a6d", label: "Sadris" },
  { value: "5e6c843c3a2df13444183298", label: "Tshirt" },
  { value: "5e6c845a3a2df13444183299", label: "Jeans" },
  { value: "636f3012feea0816508c5c45", label: "Poona Pant" },
  { value: "65d0cb5c77b0fedc13f0dae7", label: "Pattu Pancha" },
] as const

export const PRODUCT_TYPE_OPTIONS = [
  { value: "5da950252e429414a083ea6c", label: "Custom-made" },
  { value: "5da950252e429414a083ea6d", label: "Ready-made" },
  { value: "60af30d11ede7a3740f41751", label: "Both" },
] as const

export const PRODUCT_FORM_IDS = {
  OCCASION_ACCESSORIES: "6006f48dd47a4914dcd7ea79",
  CUSTOM_MADE: "5da950252e429414a083ea6c",
  READY_MADE_AND_CUSTOM_MADE: "60af30d11ede7a3740f41751",
} as const
