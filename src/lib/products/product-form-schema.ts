import { z } from "zod"

export const productCoreFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  subTitle: z.string().optional(),
  description: z.string().optional(),
  code: z.string().optional(),
  size: z.string().optional(),
  sortOrder: z.string().optional(),
  qty: z.string().optional(),
  internalBrandId: z.string().min(1, "Internal brand is required"),
  catId: z.string().min(1, "Category is required"),
  producttypeId: z.string().min(1, "Product type is required"),
  occasionIds: z.array(z.string()),
  isAvailable: z.boolean(),
  cost: z.string().optional(),
  price: z.string().optional(),
  discount: z.string().optional(),
  discPrice: z.string().optional(),
  altText: z.string().optional(),
  pImgIndx: z.string().optional(),
})

export type ProductCoreFormValues = z.infer<typeof productCoreFormSchema>

export const productCoreFormDefaults: ProductCoreFormValues = {
  title: "",
  subTitle: "",
  description: "",
  code: "",
  size: "",
  sortOrder: "0",
  qty: "0",
  internalBrandId: "",
  catId: "",
  producttypeId: "",
  occasionIds: [],
  isAvailable: true,
  cost: "0",
  price: "0",
  discount: "0",
  discPrice: "0",
  altText: "",
  pImgIndx: "0",
}

function numOrZero(value?: string) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function buildProductCoreInput(
  values: ProductCoreFormValues,
  images: string[] = []
) {
  return {
    title: values.title.trim(),
    subTitle: values.subTitle?.trim() || undefined,
    description: values.description?.trim() || undefined,
    code: values.code?.trim() || undefined,
    size: values.size?.trim() || undefined,
    sortOrder: numOrZero(values.sortOrder),
    qty: numOrZero(values.qty),
    internalBrandId: values.internalBrandId,
    catId: values.catId,
    producttypeId: values.producttypeId,
    occasionIds: values.occasionIds,
    isAvailable: values.isAvailable,
    cost: numOrZero(values.cost),
    price: numOrZero(values.price),
    discount: numOrZero(values.discount),
    discPrice: numOrZero(values.discPrice),
    altText: values.altText?.trim() || undefined,
    pImgIndx: numOrZero(values.pImgIndx),
    images,
  }
}
