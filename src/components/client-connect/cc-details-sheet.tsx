"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react"
import {
  Loader2Icon,
  MessageCircleIcon,
  MicIcon,
  MicOffIcon,
  NotebookPenIcon,
  PhoneIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  GET_CLIENT_CONNECT_DATA,
  GET_CLIENT_CONNECT_HISTORY,
  GET_TEMPLATES_BY_CC_TYPE,
  LOG_CLIENT_CONNECT_INTERACTION,
  UPDATE_CLIENT_CONNECT_COMMENT,
  type ClientConnectCampaign,
  type ClientConnectHistoryEdge,
  type GetClientConnectDataResponse,
  type GetClientConnectDataVars,
  type GetClientConnectHistoryData,
  type GetClientConnectHistoryVars,
  type GetTemplatesByCcTypeData,
  type LogClientConnectInteractionVars,
  type UpdateClientConnectCommentVars,
} from "@/lib/apollo/queries/client-connect"
import { CREATE_CUSTOMER_DEFAULTS } from "@/lib/apollo/queries/create-user"
import {
  GET_USER,
  type GetUserData,
  type GetUserVars,
} from "@/lib/apollo/queries/get-user"
import { authClient } from "@/lib/auth-client"
import {
  fillWhatsappTemplate,
  getDefaultWhatsappTemplate,
  openWhatsAppWithText,
} from "@/lib/client-connect/default-whatsapp-templates"
import {
  callPhone,
  displayCustomerName,
  formatProfileDate,
} from "@/lib/customers/profile-display"
import { useSpeechToText } from "@/hooks/use-speech-to-text"
import { captureEvent } from "@/lib/posthog/client"
import { notify } from "@/lib/notify"
import { teamIdFromTeamsJson } from "@/lib/products/team-id"
import { cn } from "@/lib/utils"

type ConfirmKind = "whatsapp" | "call" | "note"
type DiaryTab = "campaigns" | "history"

type CcDetailsSheetProps = {
  open: boolean
  userId: string | null
  onOpenChange: (open: boolean) => void
}

function formatCampaignLabel(ccType?: string | null) {
  if (!ccType) return "—"
  return ccType.replace(/_/g, " ")
}

/** Client-connect history timestamps are often epoch ms (string/number). */
function formatHistoryDate(
  createdAt?: string | null,
  dateRecorded?: string | number | null
) {
  const raw = dateRecorded ?? createdAt
  if (raw == null || raw === "") return "—"

  let date: Date
  if (typeof raw === "number") {
    date = new Date(raw)
  } else if (/^\d+$/.test(raw.trim())) {
    date = new Date(Number(raw))
  } else {
    date = new Date(raw)
  }

  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatActionLabel(actionType?: string | null) {
  if (!actionType) return "—"
  return actionType.replace(/_/g, " ")
}

function historyActionStyles(actionType?: string | null) {
  switch (actionType) {
    case "WHATSAPP_SENT":
      return {
        card: "border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
        badge:
          "border-transparent bg-emerald-600/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
        accent: "bg-emerald-500",
      }
    case "CALL_MADE":
      return {
        card: "border-sky-200/80 bg-sky-50/50 dark:border-sky-900/50 dark:bg-sky-950/20",
        badge:
          "border-transparent bg-sky-600/15 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
        accent: "bg-sky-500",
      }
    case "NOTE_ADDED":
      return {
        card: "border-amber-200/80 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20",
        badge:
          "border-transparent bg-amber-600/15 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300",
        accent: "bg-amber-500",
      }
    default:
      return {
        card: "bg-muted/30",
        badge: "",
        accent: "bg-muted-foreground/40",
      }
  }
}

function HistoryNote({ note }: { note: string }) {
  const textRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [canExpand, setCanExpand] = useState(false)

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    setCanExpand(el.scrollHeight > el.clientHeight + 1)
  }, [note])

  return (
    <div className="mt-1">
      <p
        ref={textRef}
        className={cn(
          "text-xs leading-relaxed",
          !expanded && "line-clamp-2"
        )}
      >
        {note}
      </p>
      {canExpand || expanded ? (
        <button
          type="button"
          className="text-primary mt-0.5 text-xs font-medium hover:underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
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

export function CcDetailsSheet({
  open,
  userId,
  onOpenChange,
}: CcDetailsSheetProps) {
  const { data: session } = authClient.useSession()
  const stylistId =
    teamIdFromTeamsJson(session?.user?.teamsJson) ??
    CREATE_CUSTOMER_DEFAULTS.fallbackStylistId

  const [comment, setComment] = useState("")
  const [diaryTab, setDiaryTab] = useState<DiaryTab>("campaigns")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>("whatsapp")
  const [confirmCcType, setConfirmCcType] = useState("")
  const [confirmNote, setConfirmNote] = useState("")
  const [pendingMessage, setPendingMessage] = useState("")

  const {
    isSupported: speechSupported,
    isListening: noteListening,
    toggle: toggleNoteListeningRaw,
    stop: stopNoteListening,
  } = useSpeechToText({
    lang: "en-IN",
    onFinalTranscript: (transcript) => {
      setConfirmNote((prev) =>
        prev.trim() ? `${prev.trim()} ${transcript}` : transcript
      )
    },
    onUnsupported: () => {
      notify.error(
        "Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari."
      )
    },
    onPermissionDenied: () => {
      notify.error(
        "Microphone access is blocked. Allow mic permission in your browser settings, then try again."
      )
    },
  })

  const {
    isListening: commentListening,
    toggle: toggleCommentListeningRaw,
    stop: stopCommentListening,
  } = useSpeechToText({
    lang: "en-IN",
    onFinalTranscript: (transcript) => {
      setComment((prev) =>
        prev.trim() ? `${prev.trim()} ${transcript}` : transcript
      )
    },
    onUnsupported: () => {
      notify.error(
        "Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari."
      )
    },
    onPermissionDenied: () => {
      notify.error(
        "Microphone access is blocked. Allow mic permission in your browser settings, then try again."
      )
    },
  })

  const toggleNoteListening = useCallback(() => {
    stopCommentListening()
    toggleNoteListeningRaw()
  }, [stopCommentListening, toggleNoteListeningRaw])

  const toggleCommentListening = useCallback(() => {
    stopNoteListening()
    toggleCommentListeningRaw()
  }, [stopNoteListening, toggleCommentListeningRaw])

  useEffect(() => {
    if (!confirmOpen || confirmKind !== "note") {
      stopNoteListening()
    } else {
      stopCommentListening()
    }
  }, [confirmOpen, confirmKind, stopNoteListening, stopCommentListening])

  useEffect(() => {
    if (!open || diaryTab !== "campaigns") {
      stopCommentListening()
    }
  }, [open, diaryTab, stopCommentListening])

  useEffect(() => {
    if (!open) {
      stopNoteListening()
      stopCommentListening()
    }
  }, [open, stopNoteListening, stopCommentListening])

  const { data: userData, loading: userLoading } = useQuery<
    GetUserData,
    GetUserVars
  >(GET_USER, {
    variables: { userId: userId ?? "" },
    skip: !open || !userId,
    fetchPolicy: "cache-and-network",
  })

  const [fetchConnect, { data: connectData, loading: connectLoading }] =
    useLazyQuery<GetClientConnectDataResponse, GetClientConnectDataVars>(
      GET_CLIENT_CONNECT_DATA,
      { fetchPolicy: "network-only", nextFetchPolicy: "network-only" }
    )

  const [fetchHistory, { data: historyData, loading: historyLoading }] =
    useLazyQuery<GetClientConnectHistoryData, GetClientConnectHistoryVars>(
      GET_CLIENT_CONNECT_HISTORY,
      { fetchPolicy: "network-only", nextFetchPolicy: "network-only" }
    )

  const [fetchTemplates] = useLazyQuery<
    GetTemplatesByCcTypeData,
    { ccType: string }
  >(GET_TEMPLATES_BY_CC_TYPE, { fetchPolicy: "network-only" })

  const [logInteraction, { loading: logging }] = useMutation<
    unknown,
    LogClientConnectInteractionVars
  >(LOG_CLIENT_CONNECT_INTERACTION)

  const [updateComment, { loading: savingComment }] = useMutation<
    unknown,
    UpdateClientConnectCommentVars
  >(UPDATE_CLIENT_CONNECT_COMMENT)

  const user = userData?.user
  const connect = connectData?.getClientConnectData
  const campaigns: ClientConnectCampaign[] = connect?.campaigns ?? []
  const history: ClientConnectHistoryEdge[] =
    historyData?.getClientConnectHistory?.edges ?? []

  const customerName = displayCustomerName(user)
  const stylistName = user?.stylist?.[0]?.name ?? null

  useEffect(() => {
    if (!open || !userId) return
    setDiaryTab("campaigns")
    captureEvent("client_connect_open", { userId })
    void fetchConnect({ variables: { userId } })
    void fetchHistory({ variables: { userId, limit: 40 } })
  }, [open, userId, fetchConnect, fetchHistory])

  useEffect(() => {
    setComment(connect?.ccComment ?? "")
  }, [connect?.ccComment])

  const loading = userLoading || connectLoading

  const resolveWhatsappText = useCallback(
    async (ccType: string) => {
      let template = getDefaultWhatsappTemplate(ccType)
      try {
        const result = await fetchTemplates({ variables: { ccType } })
        const active = result.data?.getTemplatesByCCType?.find(
          (t) => t.isActive !== false && t.textContent?.trim()
        )
        if (active?.textContent) template = active.textContent
      } catch {
        // defaults
      }
      return fillWhatsappTemplate(template, {
        name: customerName === "—" ? null : customerName,
        stylistName,
      })
    },
    [customerName, stylistName, fetchTemplates]
  )

  const openConfirm = useCallback(
    async (kind: ConfirmKind, ccType: string) => {
      setConfirmKind(kind)
      setConfirmCcType(ccType)
      if (kind === "whatsapp") {
        const text = await resolveWhatsappText(ccType)
        setPendingMessage(text)
        setConfirmNote("")
      } else if (kind === "note") {
        const camp = campaigns.find((c) => c.ccType === ccType)
        setConfirmNote(camp?.currentComment ?? "")
        setPendingMessage("")
      } else {
        setPendingMessage("")
        setConfirmNote("")
      }
      setConfirmOpen(true)
    },
    [campaigns, resolveWhatsappText]
  )

  const refreshDiary = useCallback(async () => {
    if (!userId) return
    await Promise.all([
      fetchConnect({
        variables: { userId },
        fetchPolicy: "network-only",
      }),
      fetchHistory({
        variables: { userId, limit: 40 },
        fetchPolicy: "network-only",
      }),
    ])
  }, [userId, fetchConnect, fetchHistory])

  const confirmAction = useCallback(async () => {
    if (!userId || !confirmCcType) return

    const actionType =
      confirmKind === "whatsapp"
        ? "WHATSAPP_SENT"
        : confirmKind === "call"
          ? "CALL_MADE"
          : "NOTE_ADDED"

    try {
      if (confirmKind === "whatsapp") {
        openWhatsAppWithText(user?.countryCode, user?.phone, pendingMessage)
        captureEvent("client_connect_whatsapp", {
          userId,
          ccType: confirmCcType,
        })
      } else if (confirmKind === "call") {
        callPhone(user?.countryCode, user?.phone)
        captureEvent("client_connect_call", {
          userId,
          ccType: confirmCcType,
        })
      } else {
        captureEvent("client_connect_note", {
          userId,
          ccType: confirmCcType,
        })
      }

      await logInteraction({
        variables: {
          input: {
            userId,
            stylistId,
            actionType,
            ccType: confirmCcType,
            note:
              confirmKind === "note"
                ? confirmNote.trim() || "Note added"
                : confirmKind === "whatsapp"
                  ? pendingMessage.trim() || "WhatsApp sent"
                  : "Called customer for mid-cycle followup",
            orderId: connect?.activeOrderId ?? null,
          },
        },
        refetchQueries: [
          {
            query: GET_CLIENT_CONNECT_HISTORY,
            variables: { userId, limit: 40 },
          },
          {
            query: GET_CLIENT_CONNECT_DATA,
            variables: { userId },
          },
        ],
        awaitRefetchQueries: true,
      })
      notify.success(
        confirmKind === "whatsapp"
          ? "WhatsApp logged"
          : confirmKind === "call"
            ? "Call logged"
            : "Note logged"
      )
      stopNoteListening()
      setConfirmOpen(false)
      setDiaryTab("history")
      await refreshDiary()
    } catch (err) {
      notify.fromError(err, "Failed to log interaction")
    }
  }, [
    userId,
    stylistId,
    confirmCcType,
    confirmKind,
    confirmNote,
    pendingMessage,
    user,
    connect?.activeOrderId,
    logInteraction,
    refreshDiary,
    stopNoteListening,
  ])

  const saveGlobalComment = useCallback(async () => {
    if (!userId) return
    try {
      stopCommentListening()
      await updateComment({
        variables: { userId, ccComment: comment },
      })
      notify.success("Comment saved")
      await fetchConnect({ variables: { userId } })
    } catch (err) {
      notify.fromError(err, "Failed to save comment")
    }
  }, [userId, comment, updateComment, fetchConnect, stopCommentListening])

  const campaignRows = useMemo(() => {
    if (campaigns.length > 0) return campaigns
    return [{ ccType: confirmCcType || "TOUCH_BASE_CC", status: null }]
  }, [campaigns, confirmCcType])

  const handleSheetOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        stopNoteListening()
        stopCommentListening()
      }
      onOpenChange(next)
    },
    [onOpenChange, stopNoteListening, stopCommentListening]
  )

  return (
    <>
      <Sheet open={open} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 sm:max-w-lg"
        >
          <SheetHeader className="border-b">
            <SheetTitle>Client Connect diary</SheetTitle>
            <SheetDescription>
              {customerName}
              {user?.customerSrNo != null
                ? ` · #${user.customerSrNo}`
                : null}
            </SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col">
            {loading && !user ? (
              <div className="space-y-3 px-4 py-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <>
                <div className="flex gap-1 border-b px-4">
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                      diaryTab === "campaigns"
                        ? "border-foreground text-foreground"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    )}
                    onClick={() => setDiaryTab("campaigns")}
                  >
                    Campaigns
                    <Badge variant="secondary" className="ml-0.5">
                      {campaignRows.length}
                    </Badge>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                      diaryTab === "history"
                        ? "border-foreground text-foreground"
                        : "text-muted-foreground hover:text-foreground border-transparent"
                    )}
                    onClick={() => setDiaryTab("history")}
                  >
                    History
                    <Badge variant="secondary" className="ml-0.5">
                      {history.length}
                    </Badge>
                  </button>
                </div>

                <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
                  {diaryTab === "campaigns" ? (
                    <>
                      <section className="space-y-2">
                        {connectLoading ? (
                          <Skeleton className="h-20 w-full" />
                        ) : (
                          <ul className="space-y-2">
                            {campaignRows.map((camp, idx) => (
                              <li
                                key={`${camp.ccType ?? "camp"}-${idx}`}
                                className="bg-muted/40 rounded-lg border p-3"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium">
                                      {formatCampaignLabel(camp.ccType)}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                      Due{" "}
                                      {formatProfileDate(
                                        camp.dueDate?.timestamp
                                      )}{" "}
                                      · {camp.status || "—"}
                                    </p>
                                    {camp.currentComment ? (
                                      <p className="mt-1 line-clamp-2 text-xs">
                                        {camp.currentComment}
                                      </p>
                                    ) : null}
                                  </div>
                                  <div className="flex shrink-0 gap-1">
                                    <Button
                                      type="button"
                                      size="icon-sm"
                                      variant="ghost"
                                      aria-label="WhatsApp campaign"
                                      onClick={() =>
                                        void openConfirm(
                                          "whatsapp",
                                          camp.ccType || "TOUCH_BASE_CC"
                                        )
                                      }
                                    >
                                      <MessageCircleIcon className="size-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon-sm"
                                      variant="ghost"
                                      aria-label="Call campaign"
                                      onClick={() =>
                                        void openConfirm(
                                          "call",
                                          camp.ccType || "TOUCH_BASE_CC"
                                        )
                                      }
                                    >
                                      <PhoneIcon className="size-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon-sm"
                                      variant="ghost"
                                      aria-label="Add note"
                                      onClick={() =>
                                        void openConfirm(
                                          "note",
                                          camp.ccType || "TOUCH_BASE_CC"
                                        )
                                      }
                                    >
                                      <NotebookPenIcon className="size-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>

                      <section className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-medium">Global comment</h3>
                          {speechSupported ? (
                            <Button
                              type="button"
                              size="icon-sm"
                              variant={
                                commentListening ? "destructive" : "outline"
                              }
                              aria-label={
                                commentListening
                                  ? "Stop listening"
                                  : "Speak comment"
                              }
                              aria-pressed={commentListening}
                              onClick={() => toggleCommentListening()}
                            >
                              {commentListening ? (
                                <MicOffIcon className="size-3.5" />
                              ) : (
                                <MicIcon className="size-3.5" />
                              )}
                            </Button>
                          ) : null}
                        </div>
                        <Textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={3}
                          placeholder="Notes for this client connect…"
                        />
                        {commentListening ? (
                          <div className="text-destructive flex items-center gap-2 text-xs font-medium">
                            <SpeechWaveBars />
                            <span>Listening… speak your comment</span>
                            <SpeechWaveBars />
                          </div>
                        ) : null}
                        <Button
                          type="button"
                          size="sm"
                          disabled={savingComment}
                          onClick={() => void saveGlobalComment()}
                        >
                          {savingComment ? (
                            <Loader2Icon className="size-3.5 animate-spin" />
                          ) : null}
                          Save comment
                        </Button>
                      </section>
                    </>
                  ) : (
                    <section className="space-y-2">
                      {historyLoading ? (
                        <Skeleton className="h-24 w-full" />
                      ) : history.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          No interactions yet.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {history.map((entry) => {
                            const styles = historyActionStyles(
                              entry.actionType
                            )
                            return (
                              <li
                                key={entry._id}
                                className={cn(
                                  "relative overflow-hidden rounded-lg border px-3 py-2.5 pl-3.5 text-sm",
                                  styles.card
                                )}
                              >
                                <span
                                  aria-hidden
                                  className={cn(
                                    "absolute inset-y-0 left-0 w-1",
                                    styles.accent
                                  )}
                                />
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        "text-[10px] font-semibold tracking-wide uppercase",
                                        styles.badge
                                      )}
                                    >
                                      {formatActionLabel(entry.actionType)}
                                    </Badge>
                                    <span className="text-foreground/80 text-xs font-medium">
                                      {formatCampaignLabel(entry.ccType)}
                                    </span>
                                  </div>
                                  <time className="text-muted-foreground shrink-0 text-right text-[11px] leading-tight font-medium tabular-nums">
                                    {formatHistoryDate(
                                      entry.createdAt,
                                      entry.dateRecorded
                                    )}
                                  </time>
                                </div>
                                {entry.note ? (
                                  <HistoryNote note={entry.note} />
                                ) : null}
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </section>
                  )}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!next) stopNoteListening()
          setConfirmOpen(next)
        }}
      >
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmKind === "whatsapp"
                ? "Send WhatsApp"
                : confirmKind === "call"
                  ? "Log call"
                  : "Add note"}
            </DialogTitle>
            <DialogDescription>
              {confirmKind === "whatsapp"
                ? "Review the message, then confirm to open WhatsApp and log it."
                : confirmKind === "call"
                  ? "This will open the dialer and log the call."
                  : "Write a short note for this client, or speak it with the mic."}
            </DialogDescription>
          </DialogHeader>

          {confirmKind === "whatsapp" ? (
            <div className="flex flex-col gap-2 px-5 py-4">
              <Label htmlFor="wa-preview">Message</Label>
              <Textarea
                id="wa-preview"
                value={pendingMessage}
                onChange={(e) => setPendingMessage(e.target.value)}
                rows={6}
                className="min-h-32 resize-y"
                placeholder="WhatsApp message…"
                autoFocus
              />
            </div>
          ) : null}

          {confirmKind === "note" ? (
            <div className="flex flex-col gap-2 px-5 py-4">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="note-input">Note</Label>
                {speechSupported ? (
                  <Button
                    type="button"
                    size="icon-sm"
                    variant={noteListening ? "destructive" : "outline"}
                    aria-label={
                      noteListening ? "Stop listening" : "Speak note"
                    }
                    aria-pressed={noteListening}
                    onClick={() => toggleNoteListening()}
                  >
                    {noteListening ? (
                      <MicOffIcon className="size-3.5" />
                    ) : (
                      <MicIcon className="size-3.5" />
                    )}
                  </Button>
                ) : null}
              </div>
              <Textarea
                id="note-input"
                value={confirmNote}
                onChange={(e) => setConfirmNote(e.target.value)}
                rows={5}
                className="min-h-28 resize-y"
                placeholder="e.g. Client asked to follow up next week…"
                autoFocus
              />
              {noteListening ? (
                <div className="text-destructive flex items-center gap-2 text-xs font-medium">
                  <SpeechWaveBars />
                  <span>Listening… speak your note</span>
                  <SpeechWaveBars />
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Saved to this client's interaction history.
                </p>
              )}
            </div>
          ) : null}

          {confirmKind === "call" ? (
            <div className="px-5 py-3">
              <p className="text-muted-foreground text-sm">
                Continue only if you're ready to place the call now.
              </p>
            </div>
          ) : null}

          <DialogFooter className="justify-end gap-2 px-5 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                stopNoteListening()
                setConfirmOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                logging ||
                (confirmKind === "note" && !confirmNote.trim()) ||
                (confirmKind === "whatsapp" && !pendingMessage.trim())
              }
              onClick={() => void confirmAction()}
            >
              {logging ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : null}
              {confirmKind === "whatsapp"
                ? "Open WhatsApp"
                : confirmKind === "call"
                  ? "Call & log"
                  : "Save note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
