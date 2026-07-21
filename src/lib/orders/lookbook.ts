import type { StoreOrderItem } from "@/lib/apollo/queries/store-orders"

export type OrderItemLookBook = NonNullable<
  StoreOrderItem["referenceLookBooks"]
>[number]

export type LookbookPickPayload = {
  url: string
  lookBookId?: string
  lookbookName?: string
  lookBookNo?: string | number
  lookBookTitle?: string
  lookBookNotes?: string
  lookBookImages?: string[]
}

const DEFAULT_STYLECLUB_GRAPHQL = "https://api.mpfstyleclub.com/graphql"

/** Style Club GraphQL endpoint used by legacy LookbookSelectionDialog. */
export function getStyleClubGraphqlUrl() {
  return (
    process.env.NEXT_PUBLIC_STYLECLUB_GRAPHQL_URL?.trim() ||
    DEFAULT_STYLECLUB_GRAPHQL
  )
}

export function upsertLookBookByImageType(
  list: OrderItemLookBook[] | null | undefined,
  entry: OrderItemLookBook,
  imageType: "REFERENCE" | "FIT"
): OrderItemLookBook[] {
  const next = (list ?? []).filter(
    (lb) => (lb.imageType ?? "").toUpperCase() !== imageType
  )
  next.push({ ...entry, imageType })
  return next
}

export function removeLookBookByImageType(
  list: OrderItemLookBook[] | null | undefined,
  imageType: "REFERENCE" | "FIT"
): OrderItemLookBook[] {
  return (list ?? []).filter(
    (lb) => (lb.imageType ?? "").toUpperCase() !== imageType
  )
}

export function lookBookFromPick(
  data: LookbookPickPayload,
  imageType: "REFERENCE" | "FIT"
): OrderItemLookBook {
  return {
    lookBookId: data.lookBookId ?? null,
    lookBookName: data.lookbookName ?? null,
    lookBookNo: data.lookBookNo ?? null,
    lookBookTitle: data.lookBookTitle ?? null,
    lookBookNotes: data.lookBookNotes ?? null,
    lookBookImages: data.lookBookImages ?? null,
    imageType,
  }
}
