import { gql } from "@apollo/client/core"

export type BrandPartnerSubCategory = {
  categoryId?: string | null
  categoryName?: string | null
  subCategoryId: string
  subCatName?: string | null
  subCatTitle?: string | null
  subCatNote?: string | null
}

export type GetBrandPartnerSubCategoriesByFilterData = {
  getBrandPartnerSubCategoriesByFilter: BrandPartnerSubCategory[]
}

export type GetBrandPartnerSubCategoriesByFilterVars = {
  filter?: {
    categoryId?: string | null
    searchTerm?: string | null
  } | null
}

export const GET_BRAND_PARTNER_SUB_CATEGORIES = gql`
  query GetBrandPartnerSubCategoriesByFilter(
    $filter: BrandPartnerSubCategoryFilterInput
  ) {
    getBrandPartnerSubCategoriesByFilter(filter: $filter) {
      categoryId
      categoryName
      subCategoryId
      subCatName
      subCatTitle
      subCatNote
    }
  }
`

export function brandPartnerSubCategoryLabel(
  item: BrandPartnerSubCategory
): string {
  const title =
    item.subCatTitle?.trim() ||
    item.subCatName?.trim() ||
    item.subCategoryId
  const category = item.categoryName?.trim()
  return category ? `${title} · ${category}` : title
}
