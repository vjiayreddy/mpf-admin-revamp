"use client"

import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CheckIcon,
  EyeIcon,
  MicIcon,
  MicOffIcon,
  PaletteIcon,
  SparklesIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { UppyFileUpload } from "@/components/upload/uppy-file-upload"
import { ColorsAutocomplete } from "@/components/orders/colors-autocomplete"
import { LookbookSelectionDialog } from "@/components/orders/lookbook-selection-dialog"
import { OrderImageSourceDialog } from "@/components/orders/order-image-source-dialog"
import {
  StylingFormDialog,
  type StyleDesignValue,
} from "@/components/orders/styling-form-dialog"
import { EmbroideryDesignFormDialog } from "@/components/orders/embroidery-design-form-dialog"
import { ReceiptImagePreview } from "@/components/receipts/receipt-image-preview"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ORDER_EVENT_TYPES,
  ORDER_PRODUCT_ATTRIBUTE_MASTERS,
  ORDERS_IMAGE_UPLOAD_PATH,
} from "@/config/order-form"
import { useSpeechToText } from "@/hooks/use-speech-to-text"
import {
  catIdForItemName,
  emptyOrderFormItem,
  formatProductLabel,
  type OrderFormItem,
} from "@/lib/orders/form"
import {
  lookBookFromPick,
  removeLookBookByImageType,
  upsertLookBookByImageType,
  type LookbookPickPayload,
  type OrderItemLookBook,
} from "@/lib/orders/lookbook"
import { notify } from "@/lib/notify"
import { uploadUrlsFromResult } from "@/lib/uppy/config"
import { cn } from "@/lib/utils"

const itemSchema = z.object({
  itemName: z.string().min(1, "Product is required"),
  occasion: z.string().min(1, "Occasion is required"),
  itemColor: z.string().optional(),
  fabricCode: z.string().optional(),
  itemPrice: z
    .string()
    .trim()
    .refine((value) => value === "" || !Number.isNaN(Number(value)), {
      message: "Enter a valid price",
    })
    .refine((value) => value === "" || Number(value) >= 0, {
      message: "Price must be 0 or more",
    }),
  hasEmbroidary: z.enum(["YES", "NO"]),
  trialDate: z.string().optional(),
  readyDate: z.string().optional(),
  fabricImage: z.string().optional(),
  fabricImageNote: z.string().optional(),
  referenceImage: z.string().optional(),
  referenceImageNote: z.string().optional(),
  fitImage: z.string().optional(),
  fitImageNote: z.string().optional(),
})

type ItemFormValues = z.infer<typeof itemSchema>

type ImageField = "fabricImage" | "referenceImage" | "fitImage"
type LookbookImageField = "referenceImage" | "fitImage"

const selectClass = cn(
  "border-input bg-transparent h-9 w-full rounded-lg border px-3 text-sm outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]

export type OrderItemDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: OrderFormItem | null
  /** Other line items on the order — used to prefill suit styling from siblings. */
  siblingItems?: OrderFormItem[]
  defaultTrialDate?: string
  defaultReadyDate?: string
  orderId?: string
  userId?: string
  onSave: (item: OrderFormItem) => void
}

function Field({
  id,
  label,
  children,
  error,
  className,
}: {
  id: string
  label: string
  children: ReactNode
  error?: string
  className?: string
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
      {children}
    </p>
  )
}

function SpeechWaveBars({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex h-3.5 items-end gap-0.5", className)}
      aria-hidden
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="bg-destructive inline-block w-0.5 origin-bottom rounded-full speech-wave-bar"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </span>
  )
}

type NoteFieldName =
  | "fabricImageNote"
  | "referenceImageNote"
  | "fitImageNote"

function ImageNoteField({
  id,
  label,
  listening,
  speechSupported,
  listeningHint,
  onToggleSpeech,
  children,
}: {
  id: string
  label: string
  listening: boolean
  speechSupported: boolean
  listeningHint: string
  onToggleSpeech: () => void
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-xs font-medium">
          {label}
        </Label>
        {speechSupported ? (
          <Button
            type="button"
            size="icon-sm"
            variant={listening ? "destructive" : "outline"}
            aria-label={listening ? "Stop listening" : `Speak ${label}`}
            aria-pressed={listening}
            onClick={onToggleSpeech}
          >
            {listening ? (
              <MicOffIcon className="size-3.5" />
            ) : (
              <MicIcon className="size-3.5" />
            )}
          </Button>
        ) : null}
      </div>
      {children}
      {listening ? (
        <div className="text-destructive flex items-center gap-2 text-xs font-medium">
          <SpeechWaveBars />
          <span>{listeningHint}</span>
          <SpeechWaveBars />
        </div>
      ) : null}
    </div>
  )
}

function hasStyleDesign(design?: StyleDesignValue | null) {
  if (!design) return false
  if (
    design.handDesign?.trim() ||
    design.monogramLetter?.trim() ||
    design.note?.trim()
  ) {
    return true
  }
  return (design.styleAttributes ?? []).some(
    (a) => a?.name?.trim() || a?.value?.trim() || a?.image?.trim()
  )
}

const tileShellClass =
  "relative flex h-44 w-full flex-col items-center justify-center overflow-hidden rounded-md border border-dashed"

function OrderItemImageTile({
  label,
  value,
  disabled,
  onUpload,
  onClear,
  onView,
}: {
  label: string
  value?: string
  disabled?: boolean
  onUpload: () => void
  onClear: () => void
  onView: () => void
}) {
  const src = value?.trim() || ""
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium">{label}</p>
      <div
        className={cn(
          tileShellClass,
          src
            ? "border-primary/40 bg-primary/5"
            : "border-muted-foreground/25 bg-muted/30",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={label}
              className="absolute inset-0 size-full object-contain"
            />
            <button
              type="button"
              className="absolute inset-0 z-[1]"
              aria-label={`View ${label}`}
              onClick={onView}
            />
            <div className="absolute inset-x-0 bottom-1.5 z-10 flex items-center justify-center gap-1">
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="shadow-sm"
                title="View image"
                onClick={(e) => {
                  e.stopPropagation()
                  onView()
                }}
              >
                <EyeIcon className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="shadow-sm"
                disabled={disabled}
                title="Replace image"
                onClick={(e) => {
                  e.stopPropagation()
                  onUpload()
                }}
              >
                <UploadIcon className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="shadow-sm"
                disabled={disabled}
                title="Remove image"
                onClick={(e) => {
                  e.stopPropagation()
                  onClear()
                }}
              >
                <Trash2Icon className="size-3.5" />
              </Button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="hover:bg-muted/50 flex size-full flex-col items-center justify-center gap-1 px-2 text-center transition-colors"
            disabled={disabled}
            onClick={onUpload}
          >
            <UploadIcon className="text-muted-foreground size-4" />
            <span className="text-muted-foreground text-[11px] leading-snug">
              Upload
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

function DesignActionTile({
  kind,
  filled,
  detail,
  muted,
  onClick,
}: {
  kind: "styling" | "embroidery"
  filled: boolean
  detail?: string
  muted?: boolean
  onClick?: () => void
}) {
  const isStyling = kind === "styling"
  const label = isStyling ? "Styling info" : "Embroidery design"
  const emptyCta = isStyling ? "Add styling" : "Add embroidery"
  const Icon = isStyling
    ? filled
      ? CheckIcon
      : PaletteIcon
    : filled
      ? CheckIcon
      : SparklesIcon

  const statusLabel = muted
    ? null
    : filled
      ? isStyling
        ? "Ready"
        : detail?.toLowerCase().includes("draft")
          ? "Draft"
          : "Saved"
      : "Required"

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium">{label}</p>
      <button
        type="button"
        disabled={muted || !onClick}
        onClick={onClick}
        className={cn(
          "group relative flex h-44 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border px-3 text-center transition-all duration-200",
          "focus-visible:ring-ring outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          muted &&
            "border-border/60 bg-muted/20 text-muted-foreground cursor-default opacity-80",
          !muted &&
            !filled &&
            isStyling &&
            "border-violet-300/70 bg-gradient-to-b from-violet-500/10 via-violet-500/5 to-transparent hover:border-violet-400 hover:from-violet-500/15 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.25)]",
          !muted &&
            !filled &&
            !isStyling &&
            "border-teal-300/70 bg-gradient-to-b from-teal-500/10 via-teal-500/5 to-transparent hover:border-teal-400 hover:from-teal-500/15 hover:shadow-[0_0_0_1px_rgba(20,184,166,0.25)]",
          !muted &&
            filled &&
            isStyling &&
            "border-violet-400/60 bg-gradient-to-b from-violet-500/18 via-violet-500/8 to-background hover:border-violet-500 hover:shadow-sm",
          !muted &&
            filled &&
            !isStyling &&
            "border-teal-400/60 bg-gradient-to-b from-teal-500/18 via-teal-500/8 to-background hover:border-teal-500 hover:shadow-sm"
        )}
      >
        {!muted ? (
          <span
            className={cn(
              "absolute top-2 right-2 rounded-full px-1.5 py-0.5 text-[9px] font-semibold tracking-wide uppercase",
              filled && isStyling && "bg-violet-500/15 text-violet-700 dark:text-violet-300",
              filled && !isStyling && "bg-teal-500/15 text-teal-700 dark:text-teal-300",
              !filled && isStyling && "bg-violet-500/10 text-violet-600/80 dark:text-violet-300/80",
              !filled && !isStyling && "bg-teal-500/10 text-teal-600/80 dark:text-teal-300/80"
            )}
          >
            {statusLabel}
          </span>
        ) : null}

        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-full border transition-transform duration-200 group-hover:scale-105",
            muted && "border-border/50 bg-muted/40",
            !muted &&
              isStyling &&
              "border-violet-300/50 bg-violet-500/10 text-violet-700 dark:text-violet-300",
            !muted &&
              !isStyling &&
              "border-teal-300/50 bg-teal-500/10 text-teal-700 dark:text-teal-300"
          )}
        >
          <Icon className="size-5" />
        </span>

        <div className="space-y-0.5">
          <p
            className={cn(
              "text-xs font-semibold tracking-tight",
              muted && "text-muted-foreground font-medium"
            )}
          >
            {muted
              ? detail || "Unavailable"
              : filled
                ? isStyling
                  ? "Styling set"
                  : detail?.toLowerCase().includes("draft")
                    ? "Draft ready"
                    : "Design saved"
                : emptyCta}
          </p>
          {!muted && filled && detail && !detail.toLowerCase().includes("draft") && !isStyling ? (
            <p className="text-muted-foreground line-clamp-2 max-w-[11rem] text-[10px] leading-snug">
              {detail}
            </p>
          ) : null}
          {!muted && filled && isStyling ? (
            <p className="text-muted-foreground text-[10px]">Tap to view or edit</p>
          ) : null}
          {!muted && !filled ? (
            <p className="text-muted-foreground text-[10px]">
              {isStyling ? "Open styling form" : "Open embroidery form"}
            </p>
          ) : null}
        </div>
      </button>
    </div>
  )
}

export function OrderItemDialog({
  open,
  onOpenChange,
  item,
  siblingItems = [],
  defaultTrialDate,
  defaultReadyDate,
  orderId,
  userId,
  onSave,
}: OrderItemDialogProps) {
  const formId = useId()
  const isEdit = Boolean(item?.itemName)
  const [uploadField, setUploadField] = useState<ImageField | null>(null)
  const [sourceField, setSourceField] = useState<LookbookImageField | null>(
    null
  )
  const [lookbookField, setLookbookField] = useState<LookbookImageField | null>(
    null
  )
  const [referenceLookBooks, setReferenceLookBooks] = useState<
    OrderItemLookBook[]
  >([])
  const [styleDesign, setStyleDesign] = useState<StyleDesignValue | null>(null)
  const [styleDesignForItemName, setStyleDesignForItemName] = useState("")
  const [stylingFormOpen, setStylingFormOpen] = useState(false)
  const [embDesignDetails, setEmbDesignDetails] = useState<string | null>(null)
  const [embDesignFormOpen, setEmbDesignFormOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<{
    images: string[]
    index: number
  } | null>(null)

  const embLocked = Boolean(item?.embDetails?.embroideryId?.trim())

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      itemName: "",
      occasion: "",
      itemColor: "",
      fabricCode: "",
      itemPrice: "0",
      hasEmbroidary: "NO",
      trialDate: defaultTrialDate || "",
      readyDate: defaultReadyDate || "",
      fabricImage: "",
      fabricImageNote: "",
      referenceImage: "",
      referenceImageNote: "",
      fitImage: "",
      fitImageNote: "",
    },
  })

  const appendNoteTranscript = useCallback(
    (field: NoteFieldName, transcript: string) => {
      const prev = getValues(field)?.trim() || ""
      setValue(field, prev ? `${prev} ${transcript}` : transcript, {
        shouldDirty: true,
      })
    },
    [getValues, setValue]
  )

  const speechNotifyUnsupported = useCallback(() => {
    notify.error(
      "Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari."
    )
  }, [])

  const speechNotifyPermissionDenied = useCallback(() => {
    notify.error(
      "Microphone access is blocked. Allow mic permission in your browser settings, then try again."
    )
  }, [])

  const {
    isSupported: speechSupported,
    isListening: fabricNoteListening,
    toggle: toggleFabricNoteRaw,
    stop: stopFabricNote,
  } = useSpeechToText({
    lang: "en-IN",
    onFinalTranscript: (transcript) =>
      appendNoteTranscript("fabricImageNote", transcript),
    onUnsupported: speechNotifyUnsupported,
    onPermissionDenied: speechNotifyPermissionDenied,
  })

  const {
    isListening: referenceNoteListening,
    toggle: toggleReferenceNoteRaw,
    stop: stopReferenceNote,
  } = useSpeechToText({
    lang: "en-IN",
    onFinalTranscript: (transcript) =>
      appendNoteTranscript("referenceImageNote", transcript),
    onUnsupported: speechNotifyUnsupported,
    onPermissionDenied: speechNotifyPermissionDenied,
  })

  const {
    isListening: fitNoteListening,
    toggle: toggleFitNoteRaw,
    stop: stopFitNote,
  } = useSpeechToText({
    lang: "en-IN",
    onFinalTranscript: (transcript) =>
      appendNoteTranscript("fitImageNote", transcript),
    onUnsupported: speechNotifyUnsupported,
    onPermissionDenied: speechNotifyPermissionDenied,
  })

  const stopAllNoteSpeech = useCallback(() => {
    stopFabricNote()
    stopReferenceNote()
    stopFitNote()
  }, [stopFabricNote, stopReferenceNote, stopFitNote])

  const toggleFabricNoteListening = useCallback(() => {
    stopReferenceNote()
    stopFitNote()
    toggleFabricNoteRaw()
  }, [stopReferenceNote, stopFitNote, toggleFabricNoteRaw])

  const toggleReferenceNoteListening = useCallback(() => {
    stopFabricNote()
    stopFitNote()
    toggleReferenceNoteRaw()
  }, [stopFabricNote, stopFitNote, toggleReferenceNoteRaw])

  const toggleFitNoteListening = useCallback(() => {
    stopFabricNote()
    stopReferenceNote()
    toggleFitNoteRaw()
  }, [stopFabricNote, stopReferenceNote, toggleFitNoteRaw])

  useEffect(() => {
    if (!open) stopAllNoteSpeech()
  }, [open, stopAllNoteSpeech])

  const itemName = useWatch({ control, name: "itemName" })
  const hasEmbroidary = useWatch({ control, name: "hasEmbroidary" })
  const itemColor = useWatch({ control, name: "itemColor" })
  const fabricImage = useWatch({ control, name: "fabricImage" })
  const referenceImage = useWatch({ control, name: "referenceImage" })
  const fitImage = useWatch({ control, name: "fitImage" })

  const itemCatId = useMemo(
    () => (itemName ? catIdForItemName(itemName) : item?.itemCatId || ""),
    [itemName, item?.itemCatId]
  )
  const colorDisabled = itemName === "style_club"
  const showEmbTile = hasEmbroidary === "YES" && Boolean(itemCatId)

  const uploadPath = useMemo(() => {
    if (userId?.trim() && orderId?.trim()) {
      return `${ORDERS_IMAGE_UPLOAD_PATH}/${userId.trim()}/${orderId.trim()}`
    }
    if (orderId?.trim()) {
      return `${ORDERS_IMAGE_UPLOAD_PATH}/${orderId.trim()}`
    }
    return ORDERS_IMAGE_UPLOAD_PATH
  }, [orderId, userId])

  const canUpload = Boolean(orderId?.trim())

  useEffect(() => {
    if (!open) return
    const base =
      item ??
      emptyOrderFormItem({
        trialDate: defaultTrialDate,
        readyDate: defaultReadyDate,
      })
    reset({
      itemName: base.itemName,
      occasion: base.occasion,
      itemColor: base.itemColor,
      fabricCode: base.fabricCode,
      itemPrice: String(base.itemPrice ?? 0),
      hasEmbroidary: base.hasEmbroidary ? "YES" : "NO",
      trialDate: base.trialDate || defaultTrialDate || "",
      readyDate: base.readyDate || defaultReadyDate || "",
      fabricImage: base.fabricImage,
      fabricImageNote: base.fabricImageNote,
      referenceImage: base.referenceImage,
      referenceImageNote: base.referenceImageNote,
      fitImage: base.fitImage,
      fitImageNote: base.fitImageNote,
    })
    setUploadField(null)
    setSourceField(null)
    setLookbookField(null)
    setStylingFormOpen(false)
    setEmbDesignFormOpen(false)
    setReferenceLookBooks([...(base.referenceLookBooks ?? [])])
    setStyleDesign(base.styleDesign ?? null)
    setStyleDesignForItemName(base.itemName || "")
    setEmbDesignDetails(base.embDesignDetails?.trim() || null)
  }, [open, item, defaultTrialDate, defaultReadyDate, reset])

  // Clear styling if the product changes after it was set
  useEffect(() => {
    if (!open) return
    if (
      styleDesign &&
      styleDesignForItemName &&
      itemName &&
      itemName !== styleDesignForItemName
    ) {
      setStyleDesign(null)
      setStyleDesignForItemName("")
    }
  }, [open, itemName, styleDesign, styleDesignForItemName])

  const onSubmit = (values: ItemFormValues) => {
    const next: OrderFormItem = {
      ...(item ?? emptyOrderFormItem()),
      itemName: values.itemName,
      itemCatId: catIdForItemName(values.itemName),
      occasion: values.occasion,
      itemColor: values.itemColor?.trim() || "",
      fabricCode: values.fabricCode?.trim() || "",
      itemPrice: Number(values.itemPrice) || 0,
      hasEmbroidary: values.hasEmbroidary === "YES",
      trialDate: values.trialDate?.trim() || "",
      readyDate: values.readyDate?.trim() || "",
      fabricImage: values.fabricImage?.trim() || "",
      fabricImageNote: values.fabricImageNote?.trim() || "",
      referenceImage: values.referenceImage?.trim() || "",
      referenceImageNote: values.referenceImageNote?.trim() || "",
      fitImage: values.fitImage?.trim() || "",
      fitImageNote: values.fitImageNote?.trim() || "",
      styleDesign: styleDesign ?? undefined,
      embDesignDetails: embDesignDetails ?? undefined,
      referenceLookBooks:
        referenceLookBooks.length > 0 ? referenceLookBooks : undefined,
    }
    onSave(next)
    onOpenChange(false)
  }

  const openStylingForm = () => {
    if (!itemName?.trim()) {
      notify.warning("Select a product before editing styling")
      return
    }
    const resolvedCatId = catIdForItemName(itemName)
    if (!resolvedCatId || resolvedCatId === "NA") {
      notify.warning("Styling is not available for this product")
      return
    }
    setStylingFormOpen(true)
  }

  const openEmbDesignForm = () => {
    if (!itemName?.trim()) {
      notify.warning("Select a product before editing embroidery")
      return
    }
    const resolvedCatId = catIdForItemName(itemName)
    if (!resolvedCatId || resolvedCatId === "NA") {
      notify.warning("Embroidery design is not available for this product")
      return
    }
    setEmbDesignFormOpen(true)
  }

  const openDeviceUpload = (field: ImageField) => {
    if (!canUpload) {
      notify.warning("Save or initiate the order before uploading images")
      return
    }
    setUploadField(field)
  }

  const openImageSource = (field: LookbookImageField) => {
    if (!canUpload) {
      notify.warning("Save or initiate the order before uploading images")
      return
    }
    setSourceField(field)
  }

  const clearImageField = (field: ImageField) => {
    setValue(field, "", { shouldDirty: true })
    if (field === "referenceImage") {
      setReferenceLookBooks((prev) =>
        removeLookBookByImageType(prev, "REFERENCE")
      )
    }
    if (field === "fitImage") {
      setReferenceLookBooks((prev) => removeLookBookByImageType(prev, "FIT"))
    }
  }

  const applyLookbookPick = (
    field: LookbookImageField,
    data: LookbookPickPayload
  ) => {
    const imageType = field === "referenceImage" ? "REFERENCE" : "FIT"
    setValue(field, data.url, { shouldDirty: true, shouldValidate: true })
    setReferenceLookBooks((prev) =>
      upsertLookBookByImageType(prev, lookBookFromPick(data, imageType), imageType)
    )
  }

  const galleryImages = useMemo(() => {
    return [fabricImage, referenceImage, fitImage]
      .map((url) => url?.trim() || "")
      .filter(Boolean)
  }, [fabricImage, referenceImage, fitImage])

  const openImagePreview = (field: ImageField) => {
    const src =
      field === "fabricImage"
        ? fabricImage?.trim()
        : field === "referenceImage"
          ? referenceImage?.trim()
          : fitImage?.trim()
    if (!src) return
    const images = galleryImages.length > 0 ? galleryImages : [src]
    const index = Math.max(0, images.indexOf(src))
    setImagePreview({ images, index })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Update order item" : "Add a new order item"}
            </DialogTitle>
            <DialogDescription>
              Product details, images, and notes for this line.
            </DialogDescription>
          </DialogHeader>

          <form
            id={formId}
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {/* Core fields — legacy order */}
              <section className="space-y-3">
                <SectionHeading>Details</SectionHeading>
                <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                  <Field
                    id="itemName"
                    label="Product"
                    error={errors.itemName?.message}
                  >
                    <Controller
                      name="itemName"
                      control={control}
                      render={({ field }) => (
                        <select
                          id="itemName"
                          className={selectClass}
                          value={field.value}
                          disabled={embLocked}
                          onChange={field.onChange}
                        >
                          <option value="">Select product</option>
                          {ORDER_PRODUCT_ATTRIBUTE_MASTERS.map((p) => (
                            <option key={p.name} value={p.name}>
                              {formatProductLabel(p.name)}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Field>

                  <Field id="itemColor" label="Color">
                    <Controller
                      name="itemColor"
                      control={control}
                      render={({ field }) => (
                        <ColorsAutocomplete
                          id="itemColor"
                          hideLabel
                          value={field.value ?? ""}
                          disabled={colorDisabled}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Field>

                  <Field id="fabricCode" label="Fabric code">
                    <Input id="fabricCode" {...register("fabricCode")} />
                  </Field>

                  <Field id="trialDate" label="Trial date">
                    <Input
                      id="trialDate"
                      type="date"
                      {...register("trialDate")}
                    />
                  </Field>

                  <Field id="readyDate" label="Ready date">
                    <Input
                      id="readyDate"
                      type="date"
                      {...register("readyDate")}
                    />
                  </Field>

                  <Field
                    id="itemPrice"
                    label="Price"
                    error={errors.itemPrice?.message}
                  >
                    <Input
                      id="itemPrice"
                      type="number"
                      min={0}
                      step="1"
                      {...register("itemPrice")}
                    />
                  </Field>

                  <Field id="hasEmbroidary" label="Embroidery">
                    <Controller
                      name="hasEmbroidary"
                      control={control}
                      render={({ field }) => (
                        <select
                          id="hasEmbroidary"
                          className={selectClass}
                          value={field.value}
                          disabled={embLocked}
                          onChange={field.onChange}
                        >
                          <option value="NO">No</option>
                          <option value="YES">Yes</option>
                        </select>
                      )}
                    />
                  </Field>

                  <Field
                    id="occasion"
                    label="Occasion"
                    className="sm:col-span-2"
                    error={errors.occasion?.message}
                  >
                    <Controller
                      name="occasion"
                      control={control}
                      render={({ field }) => (
                        <select
                          id="occasion"
                          className={selectClass}
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="">Select occasion</option>
                          {ORDER_EVENT_TYPES.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Field>
                </div>
              </section>

              {/* Media tiles */}
              <section className="space-y-3 border-t pt-5">
                <div className="flex items-baseline justify-between gap-2">
                  <SectionHeading>Images & design</SectionHeading>
                  {!canUpload ? (
                    <p className="text-muted-foreground text-[11px]">
                      Available after order is initiated
                    </p>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <OrderItemImageTile
                    label="Fab image"
                    value={fabricImage}
                    disabled={!canUpload}
                    onUpload={() => openDeviceUpload("fabricImage")}
                    onClear={() => clearImageField("fabricImage")}
                    onView={() => openImagePreview("fabricImage")}
                  />
                  <OrderItemImageTile
                    label="Ref image"
                    value={referenceImage}
                    disabled={!canUpload}
                    onUpload={() => openImageSource("referenceImage")}
                    onClear={() => clearImageField("referenceImage")}
                    onView={() => openImagePreview("referenceImage")}
                  />
                  <OrderItemImageTile
                    label="Fit image"
                    value={fitImage}
                    disabled={!canUpload}
                    onUpload={() => openImageSource("fitImage")}
                    onClear={() => clearImageField("fitImage")}
                    onView={() => openImagePreview("fitImage")}
                  />
                  <DesignActionTile
                    kind="styling"
                    filled={hasStyleDesign(styleDesign)}
                    detail={
                      hasStyleDesign(styleDesign)
                        ? "View styling"
                        : undefined
                    }
                    onClick={openStylingForm}
                  />
                  {showEmbTile ? (
                    <DesignActionTile
                      kind="embroidery"
                      filled={Boolean(
                        item?.embDetails?.embroideryId?.trim() ||
                          embDesignDetails?.trim()
                      )}
                      detail={
                        item?.embDetails?.embroideryId?.trim()
                          ? item.embDetails.embStatus?.trim()
                            ? `${item.embDetails.embroideryId} · ${item.embDetails.embStatus}`
                            : item.embDetails.embroideryId
                          : embDesignDetails?.trim()
                            ? "Draft ready"
                            : undefined
                      }
                      onClick={openEmbDesignForm}
                    />
                  ) : (
                    <DesignActionTile
                      kind="embroidery"
                      filled={false}
                      muted
                      detail="Set embroidery to Yes"
                    />
                  )}
                </div>
              </section>

              {/* Notes */}
              <section className="space-y-3 border-t pt-5">
                <SectionHeading>Image notes</SectionHeading>
                <div className="grid gap-3">
                  <ImageNoteField
                    id="fabricImageNote"
                    label="Fabric image note"
                    listening={fabricNoteListening}
                    speechSupported={speechSupported}
                    listeningHint="Listening… speak fabric note"
                    onToggleSpeech={toggleFabricNoteListening}
                  >
                    <Textarea
                      id="fabricImageNote"
                      rows={2}
                      className="min-h-[4.5rem] resize-y"
                      {...register("fabricImageNote")}
                    />
                  </ImageNoteField>
                  <ImageNoteField
                    id="referenceImageNote"
                    label="Reference image note"
                    listening={referenceNoteListening}
                    speechSupported={speechSupported}
                    listeningHint="Listening… speak reference note"
                    onToggleSpeech={toggleReferenceNoteListening}
                  >
                    <Textarea
                      id="referenceImageNote"
                      rows={2}
                      className="min-h-[4.5rem] resize-y"
                      {...register("referenceImageNote")}
                    />
                  </ImageNoteField>
                  <ImageNoteField
                    id="fitImageNote"
                    label="Fit image note"
                    listening={fitNoteListening}
                    speechSupported={speechSupported}
                    listeningHint="Listening… speak fit note"
                    onToggleSpeech={toggleFitNoteListening}
                  >
                    <Textarea
                      id="fitImageNote"
                      rows={2}
                      className="min-h-[4.5rem] resize-y"
                      {...register("fitImageNote")}
                    />
                  </ImageNoteField>
                </div>
              </section>
            </div>

            <DialogFooter className="justify-end px-5 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{isEdit ? "Update item" : "Add item"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <OrderImageSourceDialog
        open={Boolean(sourceField)}
        onOpenChange={(next) => {
          if (!next) setSourceField(null)
        }}
        title={
          sourceField === "fitImage"
            ? "Select fit image source"
            : "Select reference image source"
        }
        onSelectDevice={() => {
          if (sourceField) openDeviceUpload(sourceField)
          setSourceField(null)
        }}
        onSelectLookbook={() => {
          if (sourceField) setLookbookField(sourceField)
          setSourceField(null)
        }}
      />

      <LookbookSelectionDialog
        open={Boolean(lookbookField)}
        onOpenChange={(next) => {
          if (!next) setLookbookField(null)
        }}
        onSelectImage={(data) => {
          if (lookbookField) applyLookbookPick(lookbookField, data)
          setLookbookField(null)
        }}
      />

      <StylingFormDialog
        open={stylingFormOpen}
        onOpenChange={setStylingFormOpen}
        catId={itemCatId && itemCatId !== "NA" ? itemCatId : ""}
        itemName={itemName || ""}
        styleDesign={styleDesign}
        siblingItems={siblingItems}
        onSubmit={(data) => {
          setStyleDesign(data)
          setStyleDesignForItemName(itemName || "")
        }}
      />

      <EmbroideryDesignFormDialog
        open={embDesignFormOpen}
        onOpenChange={setEmbDesignFormOpen}
        catId={itemCatId && itemCatId !== "NA" ? itemCatId : ""}
        userId={userId}
        embId={item?.embDetails?.embroideryId}
        embJsonString={embDesignDetails}
        fabColor={itemColor?.trim() || ""}
        onDraftSaved={(jsonString) => setEmbDesignDetails(jsonString)}
      />

      <UppyFileUpload
        open={Boolean(uploadField)}
        uploadPath={uploadPath}
        maxNumberOfFiles={1}
        allowedFileTypes={IMAGE_TYPES}
        onClose={() => setUploadField(null)}
        onCompleted={(result) => {
          const urls = uploadUrlsFromResult(result.successful)
          if (uploadField && urls[0]) {
            setValue(uploadField, urls[0], {
              shouldDirty: true,
              shouldValidate: true,
            })
            // Device upload replaces any prior lookbook link for that tile
            if (uploadField === "referenceImage") {
              setReferenceLookBooks((prev) =>
                removeLookBookByImageType(prev, "REFERENCE")
              )
            }
            if (uploadField === "fitImage") {
              setReferenceLookBooks((prev) =>
                removeLookBookByImageType(prev, "FIT")
              )
            }
          }
          setUploadField(null)
        }}
      />

      <ReceiptImagePreview
        open={Boolean(imagePreview)}
        images={imagePreview?.images ?? []}
        initialIndex={imagePreview?.index ?? 0}
        onOpenChange={(next) => {
          if (!next) setImagePreview(null)
        }}
        ariaLabel="Order item image preview"
      />
    </>
  )
}
