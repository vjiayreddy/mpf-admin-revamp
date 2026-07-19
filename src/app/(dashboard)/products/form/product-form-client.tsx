"use client"

import { useEffect, useMemo, useState } from "react"
import { useLazyQuery, useMutation } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"

import { ProductImagesManager } from "@/components/products/product-images-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UppyFileUpload } from "@/components/upload/uppy-file-upload"
import {
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
} from "@/config/product-filters"
import { useInternalBrands } from "@/hooks/use-internal-brands"
import { useOccasions } from "@/hooks/use-occasions"
import { authClient } from "@/lib/auth-client"
import {
  GET_SINGLE_PRODUCT_BY_ID,
  SAVE_PRODUCT,
  type GetSingleProductData,
  type GetSingleProductVars,
  type SaveProductData,
  type SaveProductVars,
} from "@/lib/apollo/queries/products"
import {
  buildProductCoreInput,
  productCoreFormDefaults,
  productCoreFormSchema,
  type ProductCoreFormValues,
} from "@/lib/products/product-form-schema"
import { teamIdFromTeamsJson } from "@/lib/products/team-id"
import {
  PRODUCT_IMAGE_ALLOWED_TYPES,
  PRODUCT_IMAGE_UPLOAD_PATH,
  uploadUrlsFromResult,
} from "@/lib/uppy/config"
import { notify } from "@/lib/notify"
import { cn } from "@/lib/utils"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-2 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

const sectionClass = "bg-card flex flex-col gap-3 rounded-lg border p-4"

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-destructive text-xs" role="alert">
      {message}
    </p>
  )
}

function SectionTitle({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="text-muted-foreground text-xs">{description}</p>
      ) : null}
    </div>
  )
}

export function ProductFormClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("productId")
  const { data: session } = authClient.useSession()
  const { brands, loading: brandsLoading } = useInternalBrands()
  const { occasions, loading: occasionsLoading } = useOccasions()

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [showUpload, setShowUpload] = useState(false)

  const teamId = useMemo(
    () => teamIdFromTeamsJson(session?.user?.teamsJson),
    [session?.user?.teamsJson]
  )

  const [fetchProduct, { data: productData, loading: productLoading }] =
    useLazyQuery<GetSingleProductData, GetSingleProductVars>(
      GET_SINGLE_PRODUCT_BY_ID,
      { fetchPolicy: "network-only" }
    )

  const [saveProduct, { loading: saving }] = useMutation<
    SaveProductData,
    SaveProductVars
  >(SAVE_PRODUCT)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductCoreFormValues>({
    resolver: zodResolver(productCoreFormSchema),
    mode: "onChange",
    defaultValues: productCoreFormDefaults,
  })

  const selectedOccasions = watch("occasionIds")
  const isAvailable = watch("isAvailable")
  const primaryIndex = Number(watch("pImgIndx") || 0)

  useEffect(() => {
    if (!productId) {
      reset(productCoreFormDefaults)
      setImages([])
      return
    }
    void fetchProduct({ variables: { productId } })
  }, [productId, fetchProduct, reset])

  useEffect(() => {
    const product = productData?.getSingleProduct
    if (!product || !productId) return

    const occasionIds =
      product.occasions
        ?.map((o) => o._id)
        .filter((id): id is string => Boolean(id)) ??
      product.occasionIds ??
      []

    setImages(product.images?.filter(Boolean) ?? [])

    reset({
      title: product.title ?? "",
      subTitle: product.subTitle ?? "",
      description: product.description ?? "",
      code: product.code ?? "",
      size: product.size ?? "",
      sortOrder: String(product.sortOrder ?? 0),
      qty: String(product.qty ?? 0),
      internalBrandId: product.internalBrandId ?? "",
      catId: product.catId ?? "",
      producttypeId: product.producttypeId ?? "",
      occasionIds,
      isAvailable: product.isAvailable ?? true,
      cost: String(product.cost ?? 0),
      price: String(product.price ?? 0),
      discount: String(product.discount ?? 0),
      discPrice: String(product.discPrice ?? 0),
      altText: product.altText ?? "",
      pImgIndx: String(product.pImgIndx ?? 0),
    })
  }, [productData, productId, reset])

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    setSaveSuccess(false)

    if (!teamId) {
      const msg = "Missing team id on your session. Sign in again."
      setSubmitError(msg)
      notify.error(msg)
      return
    }

    try {
      const result = await saveProduct({
        variables: {
          teamId,
          ...(productId ? { productId } : {}),
          body: buildProductCoreInput(values, images),
        },
      })

      const savedId = result.data?.saveProduct?._id
      if (!savedId) {
        const msg = "Save failed — no product id returned."
        setSubmitError(msg)
        notify.error(msg)
        return
      }

      setSaveSuccess(true)
      notify.success(productId ? "Product updated" : "Product saved")
      if (!productId) {
        router.replace(`/products/form?productId=${savedId}`)
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to save product."
      setSubmitError(msg)
      notify.fromError(err, "Failed to save product.")
    }
  })

  const busy =
    productLoading || brandsLoading || occasionsLoading || saving || isSubmitting

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      const current = Number(watch("pImgIndx") || 0)
      if (next.length === 0) {
        setValue("pImgIndx", "0", { shouldDirty: true })
      } else if (current >= next.length) {
        setValue("pImgIndx", String(next.length - 1), { shouldDirty: true })
      } else if (current > index) {
        setValue("pImgIndx", String(current - 1), { shouldDirty: true })
      }
      return next
    })
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="bg-background/95 sticky top-14 z-10 -mx-4 border-b px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <Link
              href="/products"
              className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1.5 text-sm"
            >
              <ArrowLeftIcon className="size-4" />
              Back to products
            </Link>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {productId ? "Edit product" : "Add product"}
              </h1>
              {productData?.getSingleProduct?.pId != null ? (
                <span className="text-muted-foreground text-sm">
                  No. {productData.getSingleProduct.pId}
                </span>
              ) : null}
            </div>
            <p className="text-muted-foreground text-sm">
              Catalog details, pricing, images, and occasions.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => router.push("/products")}
            >
              Cancel
            </Button>
            <Button type="submit" form="product-core-form" disabled={busy}>
              {saving || isSubmitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {productLoading && productId ? (
        <p className="text-muted-foreground text-sm">Loading product…</p>
      ) : null}

      <form
        id="product-core-form"
        onSubmit={onSubmit}
        className="flex w-full flex-col gap-4"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left: Basics + Pricing + Availability */}
          <div className="flex flex-col gap-4 lg:col-span-7">
            <section className={sectionClass}>
              <SectionTitle
                title="Basics"
                description="Name, classification, and inventory basics."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    disabled={busy}
                    {...register("title")}
                    aria-invalid={!!errors.title}
                  />
                  <FieldError message={errors.title?.message} />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="subTitle">Subtitle</Label>
                  <Input
                    id="subTitle"
                    disabled={busy}
                    {...register("subTitle")}
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    disabled={busy}
                    rows={3}
                    {...register("description")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="internalBrandId">Internal brand</Label>
                  <select
                    id="internalBrandId"
                    className={selectClass}
                    disabled={busy}
                    {...register("internalBrandId")}
                  >
                    <option value="">Select brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.title || brand.name || brand._id}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.internalBrandId?.message} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="catId">Category</Label>
                  <select
                    id="catId"
                    className={selectClass}
                    disabled={busy}
                    {...register("catId")}
                  >
                    <option value="">Select category</option>
                    {PRODUCT_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.catId?.message} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="producttypeId">Product type</Label>
                  <select
                    id="producttypeId"
                    className={selectClass}
                    disabled={busy}
                    {...register("producttypeId")}
                  >
                    <option value="">Select type</option>
                    {PRODUCT_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.producttypeId?.message} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" disabled={busy} {...register("code")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="size">Size</Label>
                  <Input id="size" disabled={busy} {...register("size")} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sortOrder">Sort order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    disabled={busy}
                    {...register("sortOrder")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="qty">Quantity</Label>
                  <Input
                    id="qty"
                    type="number"
                    disabled={busy}
                    {...register("qty")}
                  />
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <SectionTitle
                title="Pricing"
                description="Cost, list price, and discount amounts."
              />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    disabled={busy}
                    {...register("cost")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    disabled={busy}
                    {...register("price")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="discount">Discount %</Label>
                  <Input
                    id="discount"
                    type="number"
                    disabled={busy}
                    {...register("discount")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="discPrice">Discount price</Label>
                  <Input
                    id="discPrice"
                    type="number"
                    disabled={busy}
                    {...register("discPrice")}
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={isAvailable}
                  disabled={busy}
                  onChange={(e) =>
                    setValue("isAvailable", e.target.checked, {
                      shouldValidate: true,
                    })
                  }
                />
                Available for sale
              </label>
            </section>

            {(submitError || saveSuccess) && (
              <div className="flex flex-col gap-1">
                {submitError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {submitError}
                  </p>
                ) : null}
                {saveSuccess ? (
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Product saved.
                  </p>
                ) : null}
              </div>
            )}

            <div className="flex justify-end gap-2 lg:hidden">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => router.push("/products")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {saving || isSubmitting ? "Saving…" : "Save product"}
              </Button>
            </div>
          </div>

          {/* Right: Images + Occasions */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <section className={sectionClass}>
              <SectionTitle
                title="Images"
                description="Click an image to open the gallery. Star sets primary; save to persist URLs."
              />
              <ProductImagesManager
                images={images}
                primaryIndex={
                  Number.isInteger(primaryIndex) && primaryIndex >= 0
                    ? primaryIndex
                    : 0
                }
                disabled={busy}
                onOpenUpload={() => setShowUpload(true)}
                onPrimaryChange={(index) =>
                  setValue("pImgIndx", String(index), { shouldDirty: true })
                }
                onRemove={handleRemoveImage}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="altText">Alt text</Label>
                  <Input
                    id="altText"
                    disabled={busy}
                    {...register("altText")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pImgIndx">Primary image index</Label>
                  <Input
                    id="pImgIndx"
                    type="number"
                    min={0}
                    disabled={busy}
                    {...register("pImgIndx")}
                  />
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <SectionTitle
                title="Occasions"
                description="Select all occasions this product belongs to."
              />
              <div className="max-h-64 overflow-y-auto rounded-lg border p-3">
                {occasions.length === 0 && !occasionsLoading ? (
                  <p className="text-muted-foreground text-sm">
                    No occasions loaded.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {occasions.map((occasion) => {
                      const checked = selectedOccasions.includes(occasion._id)
                      return (
                        <label
                          key={occasion._id}
                          className="hover:bg-muted/50 flex cursor-pointer items-start gap-2 rounded-md px-1.5 py-1 text-sm"
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 size-4 shrink-0 accent-primary"
                            checked={checked}
                            disabled={busy}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...selectedOccasions, occasion._id]
                                : selectedOccasions.filter(
                                    (id) => id !== occasion._id
                                  )
                              setValue("occasionIds", next, {
                                shouldValidate: true,
                              })
                            }}
                          />
                          <span className="leading-snug">
                            {occasion.label || occasion.name || occasion._id}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>

            <div className="hidden justify-end gap-2 lg:flex">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => router.push("/products")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {saving || isSubmitting ? "Saving…" : "Save product"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {showUpload ? (
        <UppyFileUpload
          open
          uppyId="product-image-upload"
          uploadPath={PRODUCT_IMAGE_UPLOAD_PATH}
          maxNumberOfFiles={4}
          enableImageEditor
          enableCompressor
          allowedFileTypes={[...PRODUCT_IMAGE_ALLOWED_TYPES]}
          onClose={() => setShowUpload(false)}
          onCompleted={(result) => {
            const urls = uploadUrlsFromResult(result.successful)
            if (urls.length > 0) {
              setImages((prev) => [...prev, ...urls])
            }
            setShowUpload(false)
          }}
        />
      ) : null}
    </div>
  )
}
