"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangleIcon, UserRoundSearchIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Controller, useForm } from "react-hook-form"

import { RegisterUserSheet } from "@/components/customers/register-user-sheet"
import { StylistAutocomplete } from "@/components/customers/stylist-autocomplete"
import { CustomerSearchSelect } from "@/components/orders/customer-search-select"
import {
  OrderFormField,
  OrderFormHeader,
  OrderFormSection,
  orderFormSelectClass,
} from "@/components/orders/order-form-chrome"
import { OrderFormSummaryRail } from "@/components/orders/order-form-summary-rail"
import { OrderItemDialog } from "@/components/orders/order-item-dialog"
import { OrderItemsSection } from "@/components/orders/order-items-section"
import {
  OrderCifsSelect,
  OrderLeadsSelect,
  type OrderCifOption,
  type OrderLeadOption,
} from "@/components/orders/order-lead-cif-selects"
import { OrderMoneyLinesSheet } from "@/components/orders/order-money-lines-sheet"
import { OrderPaymentsSheet } from "@/components/orders/order-payments-sheet"
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
import { PhoneInput } from "@/components/ui/phone-input"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  CUSTOMER_SEGMENT_OPTIONS,
  YES_NO_OPTIONS,
} from "@/config/customer-filters"
import { ORDER_STATUS_FILTER_OPTIONS } from "@/config/orders-filters"
import { useAllStudios } from "@/hooks/use-all-studios"
import { useAllStylists } from "@/hooks/use-all-stylists"
import { personalStylistIdFromTeamsJson } from "@/lib/appointments/build-appointments-filter"
import {
  GET_USER,
  type CustomerProfileUser,
  type GetUserData,
  type GetUserVars,
} from "@/lib/apollo/queries/get-user"
import {
  GET_ALL_SOURCE_CATEGORIES,
  type GetAllSourceCategoriesData,
  type SourceCategory,
} from "@/lib/apollo/queries/sources"
import {
  GET_STORE_ORDER_BY_ID,
  INITIATE_STORE_ORDER,
  SAVE_STORE_ORDER,
  type GetStoreOrderByIdData,
  type GetStoreOrderByIdVars,
  type InitiateStoreOrderData,
  type InitiateStoreOrderVars,
  type SaveStoreOrderData,
  type SaveStoreOrderVars,
} from "@/lib/apollo/queries/store-orders"
import { authClient } from "@/lib/auth-client"
import {
  guessCreateCustomerPrefill,
  splitPhoneForApi,
  type CreateCustomerFormValues,
} from "@/lib/customers/create-customer-schema"
import { notify } from "@/lib/notify"
import {
  applyUserToOrderFormValues,
  buildOrderSavePayload,
  emptyOrderFormValues,
  orderFormSchema,
  orderFormValuesFromDetail,
  orderItemsFromDetail,
  promoteEmbroideryFromServer,
  type OrderFormItem,
  type OrderFormValues,
  type OrderMoneyLine,
  type OrderPaymentLine,
} from "@/lib/orders/form"
import {
  collectDirtyFormFieldLabels,
  collectOrderExtrasChangeLabels,
  orderExtrasEqual,
  snapshotOrderExtras,
  type OrderExtrasSnapshot,
} from "@/lib/orders/unsaved-changes"

const selectClass = orderFormSelectClass

function FormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderIdParam = searchParams.get("orderId")?.trim() || ""
  const userIdParam = searchParams.get("userId")?.trim() || ""
  const isEdit = Boolean(orderIdParam)

  const { data: session } = authClient.useSession()
  const defaultStylistId = useMemo(() => {
    const personal = personalStylistIdFromTeamsJson(session?.user?.teamsJson)
    if (personal) return personal
    if (!session?.user?.teamsJson) return null
    try {
      const teams = JSON.parse(session.user.teamsJson) as Array<{
        _id?: string
      } | null>
      return teams?.[0]?._id ?? null
    } catch {
      return null
    }
  }, [session?.user?.teamsJson])

  const { studios, loading: studiosLoading } = useAllStudios()
  const { stylists, loading: stylistsLoading } = useAllStylists(
    Boolean(session?.user)
  )

  const { data: sourcesData, loading: sourcesLoading } =
    useQuery<GetAllSourceCategoriesData>(GET_ALL_SOURCE_CATEGORIES)

  const sources = useMemo(
    () =>
      (sourcesData?.getAllSourceCategories ?? []).filter(
        (s) => s.isVisible !== false
      ),
    [sourcesData?.getAllSourceCategories]
  )

  const [items, setItems] = useState<OrderFormItem[]>([])
  const [otherCharges, setOtherCharges] = useState<OrderMoneyLine[]>([])
  const [deductions, setDeductions] = useState<OrderMoneyLine[]>([])
  const [payments, setPayments] = useState<OrderPaymentLine[]>([])
  const [secondaryStylistIds, setSecondaryStylistIds] = useState<string[]>([])
  const [leadIds, setLeadIds] = useState<string[]>([])
  const [customerCifIds, setCustomerCifIds] = useState<string[]>([])
  const [seededLeads, setSeededLeads] = useState<OrderLeadOption[]>([])
  const [seededCifs, setSeededCifs] = useState<OrderCifOption[]>([])
  const [linkedLeads, setLinkedLeads] = useState<
    NonNullable<
      NonNullable<GetStoreOrderByIdData["getStoreOrderById"]>["linkedLeads"]
    >
  >([])
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false)
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [leaveChangeSummary, setLeaveChangeSummary] = useState<string[]>([])
  const [baselineVersion, setBaselineVersion] = useState(0)
  const [editingItem, setEditingItem] = useState<OrderFormItem | null>(null)
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false)
  const [createCustomerPrefill, setCreateCustomerPrefill] = useState<
    Partial<CreateCustomerFormValues>
  >({})
  const [otherChargesOpen, setOtherChargesOpen] = useState(false)
  const [deductionsOpen, setDeductionsOpen] = useState(false)
  const [paymentsOpen, setPaymentsOpen] = useState(false)
  const [customerLabel, setCustomerLabel] = useState("")
  const [bootstrapping, setBootstrapping] = useState(false)
  const initiatedForUserRef = useRef<string | null>(null)
  const loadedOrderIdRef = useRef<string | null>(null)
  const extrasBaselineRef = useRef<OrderExtrasSnapshot | null>(null)
  const allowNavigationRef = useRef(false)
  const pendingLeaveHrefRef = useRef("/orders")

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: emptyOrderFormValues(),
  })

  const watchedUserId = watch("userId")
  const watchedSourceChannelId = watch("sourceChannelId")
  const watchedSourceSubChannelId = watch("sourceSubChannelId")
  const watchedTrialDate = watch("trialDate")
  const watchedReadyDate = watch("readyDate")
  const watchedOrderStatus = watch("orderStatus")
  const watchedOrderNo = watch("orderNo")
  const watchedOrderDate = watch("orderDate")
  const watchedOrderId = watch("_id")
  const watchedPersonalStylistId = watch("personalStylistId")
  const watchedCustomerPhone = watch("customerPhone")
  const watchedCustomerId = watch("customerId")
  const watchedCustomerFirstName = watch("customerFirstName")
  const watchedCustomerLastName = watch("customerLastName")

  const customerPhoneSearchTerm = useMemo(() => {
    const raw = watchedCustomerPhone?.trim()
    if (!raw) return null
    try {
      const { phone } = splitPhoneForApi(raw)
      return phone || null
    } catch {
      return null
    }
  }, [watchedCustomerPhone])

  const subSources = useMemo(() => {
    const channel = sources.find((s) => s._id === watchedSourceChannelId)
    return (channel?.subCategory ?? []).filter((s) => s.isVisible !== false)
  }, [sources, watchedSourceChannelId])

  const {
    data: orderData,
    loading: orderLoading,
    error: orderError,
  } = useQuery<GetStoreOrderByIdData, GetStoreOrderByIdVars>(
    GET_STORE_ORDER_BY_ID,
    {
      variables: { orderId: orderIdParam },
      skip: !orderIdParam,
      fetchPolicy: "network-only",
    }
  )

  const [fetchUser] = useLazyQuery<GetUserData, GetUserVars>(GET_USER, {
    fetchPolicy: "network-only",
  })

  const [fetchOrderById] = useLazyQuery<
    GetStoreOrderByIdData,
    GetStoreOrderByIdVars
  >(GET_STORE_ORDER_BY_ID, {
    fetchPolicy: "network-only",
  })

  const [initiateOrder, { loading: initiating }] = useMutation<
    InitiateStoreOrderData,
    InitiateStoreOrderVars
  >(INITIATE_STORE_ORDER)

  const [saveOrder, { loading: saving }] = useMutation<
    SaveStoreOrderData,
    SaveStoreOrderVars
  >(SAVE_STORE_ORDER)

  const captureExtrasBaseline = useCallback((extras: OrderExtrasSnapshot) => {
    extrasBaselineRef.current = snapshotOrderExtras(extras)
    setBaselineVersion((v) => v + 1)
  }, [])

  const currentExtras = useMemo(
    (): OrderExtrasSnapshot => ({
      items,
      otherCharges,
      deductions,
      payments,
      secondaryStylistIds,
      leadIds,
      customerCifIds,
    }),
    [
      items,
      otherCharges,
      deductions,
      payments,
      secondaryStylistIds,
      leadIds,
      customerCifIds,
    ]
  )

  const hasExtrasDirty = useMemo(() => {
    void baselineVersion
    if (!extrasBaselineRef.current) return false
    return !orderExtrasEqual(extrasBaselineRef.current, currentExtras)
  }, [baselineVersion, currentExtras])

  const hasUnsavedChanges = isDirty || hasExtrasDirty

  const buildChangeSummary = useCallback(() => {
    const fieldLabels = collectDirtyFormFieldLabels(
      dirtyFields as Partial<Record<keyof OrderFormValues, unknown>>
    )
    const extrasLabels = collectOrderExtrasChangeLabels(
      extrasBaselineRef.current,
      currentExtras
    )
    return [...fieldLabels, ...extrasLabels]
  }, [dirtyFields, currentExtras])

  const hydrateFromOrder = useCallback(
    (order: NonNullable<GetStoreOrderByIdData["getStoreOrderById"]>) => {
      const formValues = orderFormValuesFromDetail(order)
      const nextItems = orderItemsFromDetail(order)
      const nextOtherCharges = order.otherChargesBreakdown ?? []
      const nextDeductions = order.deductionsBreakdown ?? []
      const nextPayments = order.paymentBreakdown ?? []
      const nextSecondary = (
        (order.secondaryStylistIds ?? []).filter(Boolean) as string[]
      ).filter(
        (id) =>
          id !==
          (order.personalStylistId?.trim() ||
            order.stylist?.[0]?._id?.trim() ||
            "")
      )
      const leads = (order.leads ?? []).filter(
        (l): l is NonNullable<typeof l> & { _id: string } => Boolean(l?._id)
      )
      const cifs = (order.customerCif ?? []).filter(
        (c): c is NonNullable<typeof c> & { _id: string } => Boolean(c?._id)
      )
      const nextLeadIds = leads.map((l) => l._id)
      const nextCifIds = cifs.map((c) => c._id)

      reset(formValues)
      setItems(nextItems)
      setOtherCharges(nextOtherCharges)
      setDeductions(nextDeductions)
      setPayments(nextPayments)
      setSecondaryStylistIds(nextSecondary)
      setSeededLeads(
        leads.map((l) => ({
          _id: l._id,
          leadId: l.leadId,
          firstName: l.firstName,
          lastName: l.lastName,
        }))
      )
      setLeadIds(nextLeadIds)
      setSeededCifs(
        cifs.map((c) => ({
          _id: c._id,
          cifSerialNumber: c.cifSerialNumber,
          firstName: c.firstName,
          lastName: c.lastName,
          phone: c.phone,
        }))
      )
      setCustomerCifIds(nextCifIds)
      setLinkedLeads(order.linkedLeads ?? [])
      const name = [order.customerFirstName, order.customerLastName]
        .filter(Boolean)
        .join(" ")
        .trim()
      setCustomerLabel(
        name
          ? `${name}${order.customerId ? ` · #${order.customerId}` : ""}`
          : ""
      )
      captureExtrasBaseline({
        items: nextItems,
        otherCharges: nextOtherCharges,
        deductions: nextDeductions,
        payments: nextPayments,
        secondaryStylistIds: nextSecondary,
        leadIds: nextLeadIds,
        customerCifIds: nextCifIds,
      })
    },
    [captureExtrasBaseline, reset]
  )

  const bootstrapFromUser = useCallback(
    async (userId: string, label?: string) => {
      if (!userId) return
      if (initiatedForUserRef.current === userId && getValues("_id")) return

      const stylistId = defaultStylistId
      if (!stylistId) {
        notify.error("No stylist on your session — cannot initiate order")
        return
      }

      setBootstrapping(true)
      try {
        const userResult = await fetchUser({ variables: { userId } })
        const user = userResult.data?.user as CustomerProfileUser | undefined
        if (!user?._id) {
          notify.error("Could not load customer")
          return
        }

        const initResult = await initiateOrder({
          variables: { userId, stylistId },
        })
        const initiated = initResult.data?.initiateStoreOrder
        if (!initiated?.orderId || initiated.orderNo == null) {
          notify.error("Failed to initiate order")
          return
        }

        initiatedForUserRef.current = userId
        const next = applyUserToOrderFormValues(getValues(), user, {
          orderId: initiated.orderId,
          orderNo: initiated.orderNo,
          orderStatus: initiated.orderStatus,
          personalStylistId: stylistId,
        })
        const fromUserIds = (user.secondaryStylistIds ?? []).filter(
          (id): id is string => Boolean(id?.trim())
        )
        const fromUserObjects = (user.secondaryStylists ?? [])
          .map((s) => s?._id?.trim())
          .filter((id): id is string => Boolean(id))
        const nextSecondary = (
          fromUserIds.length ? fromUserIds : fromUserObjects
        ).filter((id) => id !== stylistId)

        reset(next)
        setItems([])
        setOtherCharges([])
        setDeductions([])
        setPayments([])
        setSecondaryStylistIds(nextSecondary)
        setLeadIds([])
        setCustomerCifIds([])
        setSeededLeads([])
        setSeededCifs([])
        setLinkedLeads([])
        captureExtrasBaseline({
          items: [],
          otherCharges: [],
          deductions: [],
          payments: [],
          secondaryStylistIds: nextSecondary,
          leadIds: [],
          customerCifIds: [],
        })
        const name =
          label ||
          [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
        setCustomerLabel(
          name
            ? `${name}${next.customerId ? ` · #${next.customerId}` : ""}`
            : ""
        )
        notify.success(`Order ${initiated.orderNo} initiated`)
      } catch (err) {
        notify.fromError(err, "Failed to start order")
      } finally {
        setBootstrapping(false)
      }
    },
    [
      captureExtrasBaseline,
      defaultStylistId,
      fetchUser,
      getValues,
      initiateOrder,
      reset,
    ]
  )

  // Reset hydration when navigating to a different order (same page route).
  useEffect(() => {
    loadedOrderIdRef.current = null
  }, [orderIdParam])

  // Hydrate edit form from useQuery result (avoids blank flash + missed lazy .then).
  useEffect(() => {
    if (!orderIdParam) return
    const order = orderData?.getStoreOrderById
    if (!order?._id || order._id !== orderIdParam) return
    if (loadedOrderIdRef.current === order._id) return
    loadedOrderIdRef.current = order._id
    hydrateFromOrder(order)
  }, [orderIdParam, orderData, hydrateFromOrder])

  useEffect(() => {
    if (orderIdParam || !userIdParam || !defaultStylistId) return
    void bootstrapFromUser(userIdParam)
  }, [orderIdParam, userIdParam, defaultStylistId, bootstrapFromUser])

  const onSourceChannelChange = (channelId: string) => {
    setValue("sourceChannelId", channelId, {
      shouldValidate: true,
      shouldDirty: true,
    })
    // Clear sub-source when parent source changes; only revalidate if already errored
    setValue("sourceSubChannelId", "", {
      shouldValidate: Boolean(errors.sourceSubChannelId),
      shouldDirty: true,
    })
  }

  const onSourceSubChannelChange = (subChannelId: string) => {
    setValue("sourceSubChannelId", subChannelId, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const openAddItem = () => {
    if (!watchedTrialDate?.trim()) {
      notify.warning("Set a trial date before adding products")
      return
    }
    setEditingItem(null)
    setItemDialogOpen(true)
  }

  const openEditItem = (item: OrderFormItem) => {
    if (!watchedTrialDate?.trim()) {
      notify.warning("Set a trial date before editing products")
      return
    }
    setEditingItem(item)
    setItemDialogOpen(true)
  }

  const saveItem = (item: OrderFormItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((row) => row.key === item.key)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = item
        return next
      }
      return [...prev, item]
    })
  }

  const deleteItem = (key: string) => {
    setItems((prev) => prev.filter((row) => row.key !== key))
  }

  const onSubmit = async (values: OrderFormValues) => {
    const channel = sources.find((s) => s._id === values.sourceChannelId)
    const sub = (channel?.subCategory ?? []).find(
      (s) => s._id === values.sourceSubChannelId
    )

    try {
      const params = buildOrderSavePayload({
        values,
        items,
        sourceChannelName: channel?.name,
        sourceSubChannelName: sub?.name,
        otherChargesBreakdown: otherCharges,
        deductionsBreakdown: deductions,
        paymentBreakdown: payments,
        secondaryStylistIds,
        leadIds,
        customerCifIds,
      })
      const result = await saveOrder({ variables: { params } })
      const savedId = result.data?.saveStoreOrder?._id
      if (!savedId) {
        notify.error("Save failed — no order id returned")
        return null
      }
      reset(values)

      // Promote emb drafts → embroideryId so Continue stays in edit-emb mode
      let nextItems = items
      try {
        const refreshed = await fetchOrderById({
          variables: { orderId: savedId },
        })
        const order = refreshed.data?.getStoreOrderById
        if (order?._id) {
          nextItems = promoteEmbroideryFromServer(
            items,
            orderItemsFromDetail(order)
          )
          setItems(nextItems)
        }
      } catch {
        // Non-fatal — user can still continue; emb id appears on next full load
      }

      captureExtrasBaseline({
        items: nextItems,
        otherCharges,
        deductions,
        payments,
        secondaryStylistIds,
        leadIds,
        customerCifIds,
      })
      return savedId
    } catch (err) {
      notify.fromError(err, "Failed to save order")
      return null
    }
  }

  const onSubmitWithSuccessDialog = async (values: OrderFormValues) => {
    const savedId = await onSubmit(values)
    if (!savedId) return
    setSavedOrderId(savedId)
    setSaveSuccessOpen(true)
  }

  const requestLeave = (href = "/orders") => {
    if (allowNavigationRef.current || !hasUnsavedChanges) {
      allowNavigationRef.current = false
      router.push(href)
      return
    }
    pendingLeaveHrefRef.current = href
    setLeaveChangeSummary(buildChangeSummary())
    setLeaveDialogOpen(true)
  }

  const stayOnForm = () => {
    setLeaveDialogOpen(false)
    pendingLeaveHrefRef.current = "/orders"
  }

  const leaveWithoutSaving = () => {
    allowNavigationRef.current = true
    setLeaveDialogOpen(false)
    const href = pendingLeaveHrefRef.current || "/orders"
    router.push(href)
  }

  const saveAndLeave = handleSubmit(async (values) => {
    const savedId = await onSubmit(values)
    if (!savedId) return
    allowNavigationRef.current = true
    setLeaveDialogOpen(false)
    router.push(pendingLeaveHrefRef.current || "/orders")
  })

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (
        !hasUnsavedChanges ||
        allowNavigationRef.current ||
        saveSuccessOpen
      ) {
        return
      }
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [hasUnsavedChanges, saveSuccessOpen])

  const continueEditingAfterSave = () => {
    setSaveSuccessOpen(false)
    const id = savedOrderId
    setSavedOrderId(null)
    if (id && !orderIdParam) {
      router.replace(`/orders/form?orderId=${id}`)
    }
  }

  const goToOrderListAfterSave = () => {
    allowNavigationRef.current = true
    setSaveSuccessOpen(false)
    setSavedOrderId(null)
    router.push("/orders")
  }

  const editOrder = orderData?.getStoreOrderById ?? null
  const editNotFound =
    isEdit && !orderLoading && Boolean(orderData) && !editOrder
  const editHydrated =
    isEdit && Boolean(watchedOrderId) && watchedOrderId === orderIdParam

  const formReady = Boolean(watchedUserId && watchedOrderId)
  // Keep skeleton until edit fields are actually hydrated — avoids empty flash
  // when the query is idle or data arrived but form reset hasn't painted yet.
  const loadingPage =
    (isEdit &&
      !orderError &&
      !editNotFound &&
      (orderLoading || !editHydrated)) ||
    bootstrapping ||
    initiating

  const showCustomerGate = !isEdit && !formReady && !loadingPage

  const headerSubtitle = useMemo(() => {
    if (watchedOrderNo && customerLabel) {
      return `Order ${watchedOrderNo} · ${customerLabel}`
    }
    if (watchedOrderNo) return `Order ${watchedOrderNo}`
    if (customerLabel) return customerLabel
    return isEdit ? "Update store order details" : "Create a new store order"
  }, [watchedOrderNo, customerLabel, isEdit])

  if (isEdit && orderError) {
    return (
      <div className="flex flex-col gap-4">
        <OrderFormHeader
          title="Edit order"
          subtitle="Could not load this order"
          canSave={false}
        />
        <p className="text-destructive text-sm" role="alert">
          Failed to load order. It may have been deleted or you may not have
          access.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          nativeButton={false}
          render={<Link href="/orders" />}
        >
          Back to orders
        </Button>
      </div>
    )
  }

  if (editNotFound) {
    return (
      <div className="flex flex-col gap-4">
        <OrderFormHeader
          title="Edit order"
          subtitle="Order not found"
          canSave={false}
        />
        <p className="text-destructive text-sm" role="alert">
          This order could not be found. It may have been deleted.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          nativeButton={false}
          render={<Link href="/orders" />}
        >
          Back to orders
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4 pb-20">
      <OrderFormHeader
        title={isEdit ? "Edit order" : "New order"}
        subtitle={headerSubtitle}
        status={formReady ? watchedOrderStatus : undefined}
        saving={saving || isSubmitting}
        canSave={formReady && !loadingPage && hasUnsavedChanges}
        onLeave={() => requestLeave("/orders")}
      />

      {loadingPage ? (
        <div className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-3">
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <Skeleton className="hidden h-72 w-full rounded-xl lg:block" />
        </div>
      ) : null}

      {showCustomerGate ? (
        <div className="mx-auto w-full max-w-xl">
          <OrderFormSection
            step={1}
            title="Choose a customer"
            description="Type a name, phone, or email to find an existing client. We’ll create the order draft next."
          >
            <div className="flex flex-col gap-4 py-1 sm:py-2">
              <div className="bg-muted/40 flex items-start gap-3 rounded-lg border px-3 py-3">
                <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-full border">
                  <UserRoundSearchIcon className="text-muted-foreground size-5" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium">Search customers</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Need at least 2 characters. Or register a new customer below.
                  </p>
                </div>
              </div>
              <CustomerSearchSelect
                label=""
                autoFocus
                valueLabel={customerLabel}
                onSelect={(row) => {
                  const label = [
                    row.fullName ||
                      [row.firstName, row.lastName]
                        .filter(Boolean)
                        .join(" "),
                    row.customerSrNo != null ? `#${row.customerSrNo}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")
                  void bootstrapFromUser(row._id, label)
                }}
                onCreateNew={(searchQuery) => {
                  setCreateCustomerPrefill(
                    guessCreateCustomerPrefill(searchQuery)
                  )
                  setCreateCustomerOpen(true)
                }}
              />
            </div>
          </OrderFormSection>
        </div>
      ) : null}

      {!loadingPage && formReady ? (
        <form
          id="orders-form"
          className="mx-auto grid w-full max-w-6xl gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start"
          onSubmit={handleSubmit(onSubmitWithSuccessDialog)}
        >
          <div className="flex min-w-0 flex-col gap-4">
            {!isEdit ? (
              <OrderFormSection
                step={1}
                title="Customer"
                description="Customer is locked for this draft. Start a new order to pick someone else."
              >
                <div className="bg-muted/30 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {customerLabel || "Selected customer"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Cus. {getValues("customerId") || "—"} · Order{" "}
                      {watchedOrderNo || "—"}
                    </p>
                  </div>
                </div>
              </OrderFormSection>
            ) : null}

            <OrderFormSection
              step={isEdit ? 1 : 2}
              title="Customer details"
              description="Contact and profile fields saved with the order."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <OrderFormField
                  id="customerFirstName"
                  label="First name"
                  required
                  error={errors.customerFirstName?.message}
                >
                  <Input
                    id="customerFirstName"
                    {...register("customerFirstName")}
                  />
                </OrderFormField>
                <OrderFormField
                  id="customerLastName"
                  label="Last name"
                  required
                  error={errors.customerLastName?.message}
                >
                  <Input
                    id="customerLastName"
                    {...register("customerLastName")}
                  />
                </OrderFormField>
                <OrderFormField
                  id="customerPhone"
                  label="Phone"
                  required
                  error={errors.customerPhone?.message}
                >
                  <Controller
                    name="customerPhone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        id="customerPhone"
                        value={field.value}
                        onChange={(value) => field.onChange(value ?? "")}
                      />
                    )}
                  />
                </OrderFormField>
                <OrderFormField
                  id="customerEmail"
                  label="Email"
                  error={errors.customerEmail?.message}
                >
                  <Input
                    id="customerEmail"
                    type="email"
                    {...register("customerEmail")}
                  />
                </OrderFormField>
                <OrderFormField
                  id="customerId"
                  label="Customer no"
                  required
                  error={errors.customerId?.message}
                >
                  <Input
                    id="customerId"
                    readOnly
                    className="bg-muted/40"
                    {...register("customerId")}
                  />
                </OrderFormField>
                <OrderFormField id="customerCity" label="City">
                  <Input id="customerCity" {...register("customerCity")} />
                </OrderFormField>
                <OrderFormField id="customerSegment" label="Segment">
                  <select
                    id="customerSegment"
                    className={selectClass}
                    {...register("customerSegment")}
                  >
                    <option value="">Select segment</option>
                    {CUSTOMER_SEGMENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </OrderFormField>
                <OrderFormField
                  id="customerIsStyleClubMember"
                  label="Style club"
                >
                  <select
                    id="customerIsStyleClubMember"
                    className={selectClass}
                    {...register("customerIsStyleClubMember")}
                  >
                    {YES_NO_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </OrderFormField>
              </div>

              <details className="group border-t pt-3">
                <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium">
                  Height & weight (optional)
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <OrderFormField id="customerHeight" label="Height">
                    <Input
                      id="customerHeight"
                      {...register("customerHeight")}
                    />
                  </OrderFormField>
                  <OrderFormField id="customerWeight" label="Weight">
                    <Input
                      id="customerWeight"
                      {...register("customerWeight")}
                    />
                  </OrderFormField>
                </div>
              </details>
            </OrderFormSection>

            <OrderFormSection
              step={isEdit ? 2 : 3}
              title="Studio & source"
              description="Where the order is booked and how the customer arrived."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <OrderFormField
                  id="orderNo"
                  label="Order no"
                  required
                  error={errors.orderNo?.message}
                >
                  <Input
                    id="orderNo"
                    readOnly
                    className="bg-muted/40"
                    {...register("orderNo")}
                  />
                </OrderFormField>
                <OrderFormField
                  id="studioId"
                  label="Studio"
                  required
                  error={errors.studioId?.message}
                >
                  <select
                    id="studioId"
                    className={selectClass}
                    disabled={studiosLoading}
                    {...register("studioId")}
                  >
                    <option value="">Select studio</option>
                    {studios.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name || s.code || s._id}
                      </option>
                    ))}
                  </select>
                </OrderFormField>
                <OrderFormField
                  id="sourceChannelId"
                  label="Source"
                  required
                  error={errors.sourceChannelId?.message}
                >
                  <select
                    id="sourceChannelId"
                    className={selectClass}
                    disabled={sourcesLoading}
                    value={watchedSourceChannelId}
                    onChange={(e) => onSourceChannelChange(e.target.value)}
                  >
                    <option value="">Select source</option>
                    {sources.map((s: SourceCategory) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </OrderFormField>
                <OrderFormField
                  id="sourceSubChannelId"
                  label="Sub source"
                  required
                  error={errors.sourceSubChannelId?.message}
                >
                  <select
                    id="sourceSubChannelId"
                    className={selectClass}
                    disabled={!watchedSourceChannelId}
                    value={watchedSourceSubChannelId}
                    onChange={(e) => onSourceSubChannelChange(e.target.value)}
                  >
                    <option value="">Select sub source</option>
                    {subSources.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </OrderFormField>
                <div className="space-y-4 sm:col-span-2">
                  <Controller
                    name="personalStylistId"
                    control={control}
                    render={({ field }) => (
                      <StylistAutocomplete
                        id="personalStylistId"
                        label="Personal stylist"
                        required
                        stylists={stylists}
                        value={field.value}
                        onChange={(nextId) => {
                          field.onChange(nextId)
                          if (nextId) {
                            setSecondaryStylistIds((prev) =>
                              prev.filter((sid) => sid !== nextId)
                            )
                          }
                        }}
                        loading={stylistsLoading}
                        error={errors.personalStylistId?.message}
                        searchPlaceholder="Search personal stylist…"
                      />
                    )}
                  />
                  <StylistAutocomplete
                    multiple
                    id="secondaryStylistIds"
                    label="Secondary stylists"
                    stylists={stylists}
                    value={secondaryStylistIds}
                    onChange={setSecondaryStylistIds}
                    loading={stylistsLoading}
                    excludeIds={
                      watchedPersonalStylistId
                        ? [watchedPersonalStylistId]
                        : []
                    }
                    searchPlaceholder="Search secondary stylists…"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <OrderLeadsSelect
                      userId={watchedUserId}
                      value={leadIds}
                      onChange={setLeadIds}
                      seededOptions={seededLeads}
                    />
                    <OrderCifsSelect
                      phoneSearchTerm={customerPhoneSearchTerm}
                      value={customerCifIds}
                      onChange={setCustomerCifIds}
                      seededOptions={seededCifs}
                    />
                  </div>
                  {linkedLeads.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Linked leads ({linkedLeads.length})
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {linkedLeads.map((linked, index) => {
                          const linkedAt =
                            linked.leadLinkOrderCloseDate?.timestamp
                          return (
                            <div
                              key={`${linked.leadId ?? index}-${index}`}
                              className="border-primary/40 rounded-lg border border-l-4 px-3 py-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-primary text-sm font-semibold">
                                  Lead #
                                  {linked.leadSerialNo ?? linked.leadId ?? "—"}
                                </p>
                                <span className="text-muted-foreground rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                                  Linked
                                </span>
                              </div>
                              {linkedAt ? (
                                <p className="text-muted-foreground mt-1 text-xs">
                                  Linked date:{" "}
                                  {new Date(linkedAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </p>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </OrderFormSection>

            <OrderFormSection
              step={isEdit ? 3 : 4}
              title="Dates"
              description="Trial date is required before products can be added."
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <OrderFormField
                  id="orderDate"
                  label="Order date"
                  required
                  error={errors.orderDate?.message}
                >
                  <Input
                    id="orderDate"
                    type="date"
                    {...register("orderDate")}
                  />
                </OrderFormField>
                <OrderFormField
                  id="trialDate"
                  label="Trial date"
                  required
                  error={errors.trialDate?.message}
                >
                  <Input
                    id="trialDate"
                    type="date"
                    {...register("trialDate")}
                  />
                </OrderFormField>
                <OrderFormField id="eventDate" label="Event date">
                  <Input
                    id="eventDate"
                    type="date"
                    {...register("eventDate")}
                  />
                </OrderFormField>
                <OrderFormField id="readyDate" label="Ready date">
                  <Input
                    id="readyDate"
                    type="date"
                    {...register("readyDate")}
                  />
                </OrderFormField>
                <OrderFormField id="deliveryDate" label="Delivery date">
                  <Input
                    id="deliveryDate"
                    type="date"
                    {...register("deliveryDate")}
                  />
                </OrderFormField>
              </div>
            </OrderFormSection>

            <OrderFormSection
              step={isEdit ? 4 : 5}
              title="Products"
              description="Line items for this order. Use the summary rail for money lines."
              action={
                <span className="text-muted-foreground text-xs tabular-nums">
                  {items.length} item{items.length === 1 ? "" : "s"}
                </span>
              }
            >
              <OrderItemsSection
                items={items}
                canEditItems={Boolean(watchedTrialDate?.trim())}
                onAdd={openAddItem}
                onEdit={openEditItem}
                onDelete={deleteItem}
                embroideryContext={{
                  customerId: watchedCustomerId || null,
                  customerName:
                    [watchedCustomerFirstName, watchedCustomerLastName]
                      .filter(Boolean)
                      .join(" ")
                      .trim() || null,
                  storeOrderNo: watchedOrderNo ?? null,
                }}
              />
            </OrderFormSection>

            <OrderFormSection
              step={isEdit ? 5 : 6}
              title="Remark"
              description="Internal note for stylists and production."
            >
              <Textarea
                rows={3}
                placeholder="Optional note…"
                {...register("remark")}
              />
            </OrderFormSection>
          </div>

          <div className="lg:sticky lg:top-32">
            <OrderFormSummaryRail
              items={items}
              otherCharges={otherCharges}
              deductions={deductions}
              payments={payments}
              orderStatus={watchedOrderStatus}
              statusOptions={ORDER_STATUS_FILTER_OPTIONS}
              onOrderStatusChange={(status) =>
                setValue("orderStatus", status, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              onEditOtherCharges={() => setOtherChargesOpen(true)}
              onEditDeductions={() => setDeductionsOpen(true)}
              onEditPayments={() => setPaymentsOpen(true)}
            />
          </div>
        </form>
      ) : null}

      <OrderItemDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        item={editingItem}
        siblingItems={
          editingItem
            ? items.filter((i) => i.key !== editingItem.key)
            : items
        }
        defaultTrialDate={watchedTrialDate}
        defaultReadyDate={watchedReadyDate}
        orderId={watchedOrderId}
        userId={watchedUserId}
        onSave={saveItem}
      />

      <OrderMoneyLinesSheet
        open={otherChargesOpen}
        onOpenChange={setOtherChargesOpen}
        title="Other charges"
        description="Extra charges applied after the product total."
        lines={otherCharges}
        onSave={setOtherCharges}
      />

      <OrderMoneyLinesSheet
        open={deductionsOpen}
        onOpenChange={setDeductionsOpen}
        title="Deductions"
        description="Discounts or deductions from the order total."
        lines={deductions}
        onSave={setDeductions}
      />

      <OrderPaymentsSheet
        open={paymentsOpen}
        onOpenChange={setPaymentsOpen}
        lines={payments}
        orderDate={watchedOrderDate}
        orderId={watchedOrderId}
        onSave={(next) => {
          setPayments(next)
          setPaymentsOpen(false)
        }}
      />

      <RegisterUserSheet
        endpoint="order"
        open={createCustomerOpen}
        onOpenChange={(next) => {
          setCreateCustomerOpen(next)
          if (!next) setCreateCustomerPrefill({})
        }}
        initialValues={createCustomerPrefill}
        onCreated={(userId) => {
          setCreateCustomerOpen(false)
          setCreateCustomerPrefill({})
          void bootstrapFromUser(userId)
        }}
      />

      <Dialog open={saveSuccessOpen}>
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden p-0 sm:max-w-md"
        >
          <DialogHeader className="space-y-1.5 border-0 px-6 pt-6 pb-2 pr-6">
            <DialogTitle>
              {isEdit ? "Order updated" : "Order created"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Do you want to continue editing this order, or go to the order
              list?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent justify-end gap-2 border-0 px-6 pt-4 pb-6">
            <Button variant="outline" onClick={continueEditingAfterSave}>
              Continue
            </Button>
            <Button onClick={goToOrderListAfterSave}>Go to order list</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={leaveDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="gap-0 overflow-hidden p-0 sm:max-w-md"
        >
          <div className="flex flex-col gap-4 px-6 pt-6 pb-2">
            <DialogHeader className="space-y-1.5 border-0 p-0 text-left">
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangleIcon
                  className="size-5 shrink-0 text-amber-600 dark:text-amber-400"
                  aria-hidden
                />
                Unsaved changes
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed break-words">
                You have edits that haven&apos;t been saved. Choose how you want
                to leave this order.
              </DialogDescription>
            </DialogHeader>

            {leaveChangeSummary.length > 0 ? (
              <div className="bg-muted/40 rounded-lg border px-3.5 py-3">
                <p className="text-muted-foreground mb-2.5 text-xs font-medium tracking-wide uppercase">
                  What changed
                </p>
                <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
                  {leaveChangeSummary.map((label) => (
                    <span
                      key={label}
                      className="bg-background text-foreground inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="bg-muted/20 flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground w-full sm:w-auto"
              onClick={stayOnForm}
              disabled={saving || isSubmitting}
            >
              Stay on form
            </Button>
            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={leaveWithoutSaving}
                disabled={saving || isSubmitting}
              >
                Discard & leave
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => void saveAndLeave()}
                disabled={saving || isSubmitting}
              >
                {saving || isSubmitting ? "Saving…" : "Save & leave"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function OrdersFormClient() {
  return <FormInner />
}
