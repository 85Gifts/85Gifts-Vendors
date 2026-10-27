"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { adminApi } from "@/lib/adminApi"
import { emitOperationRequestsChanged } from "@/lib/operationRequestsEvents"
import { formatDateTime } from "@/lib/formatTime"
import type { OperationRequest } from "@/app/types/operationRequest"

export type OperationRequestReviewMode = "view" | "approve" | "reject"

interface OperationRequestReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: OperationRequest | null
  mode: OperationRequestReviewMode
  onReviewed: () => void
}

const TYPE_LABELS: Record<string, string> = {
  storefront_publish: "Storefront publish",
}

function requestName(request: OperationRequest): string {
  const name = (request.payload as Record<string, unknown> | undefined)?.name
  return typeof name === "string" && name ? name : "Untitled request"
}

function requestSlug(request: OperationRequest): string {
  const slug = (request.payload as Record<string, unknown> | undefined)?.slug
  return typeof slug === "string" && slug ? slug : "—"
}

function DetailRow({
  label,
  children,
  mono,
}: {
  label: string
  children: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-2 text-sm sm:grid-cols-[7rem_1fr]">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "break-all font-mono text-xs" : ""}>
        {children}
      </span>
    </div>
  )
}

export function OperationRequestReviewDialog({
  open,
  onOpenChange,
  request,
  mode,
  onReviewed,
}: OperationRequestReviewDialogProps) {
  const { toast } = useToast()

  const [note, setNote] = useState("")
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setNote("")
    setFormError("")
  }, [open, request?._id, mode])

  if (!request) return null

  const submittingLabel =
    mode === "approve" ? "Approve & Publish" : "Reject Request"

  const handleSubmit = async () => {
    const trimmed = note.trim()
    if (mode === "reject" && !trimmed) {
      setFormError("A reason is required so the vendor knows what to fix.")
      return
    }

    setSubmitting(true)
    setFormError("")
    try {
      if (mode === "approve") {
        await adminApi.approveOperationRequest(request._id, trimmed || undefined)
      } else {
        await adminApi.rejectOperationRequest(request._id, trimmed)
      }

      toast({
        title: mode === "approve" ? "Request approved" : "Request rejected",
        description:
          mode === "approve"
            ? `${requestName(request)} is now published.`
            : `${requestName(request)} was returned to the vendor with your note.`,
        variant: mode === "approve" ? "success" : "destructive",
      })
      emitOperationRequestsChanged()
      onReviewed()
      onOpenChange(false)
    } catch (err) {
      if ((err as { status?: number })?.status === 409) {
        toast({
          title: "Already reviewed",
          description:
            "Another admin reviewed or the vendor cancelled this request. The list has been refreshed.",
          variant: "destructive",
        })
        emitOperationRequestsChanged()
        onReviewed()
        onOpenChange(false)
        return
      }

      setFormError(
        err instanceof Error ? err.message : "Could not review the request."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !submitting && onOpenChange(next)}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto p-4 sm:max-w-lg sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {mode === "view"
              ? "Request details"
              : mode === "approve"
                ? "Approve & publish"
                : "Reject request"}
          </DialogTitle>
          <DialogDescription>
            {mode === "approve"
              ? "Approving publishes the storefront immediately. Add an optional note for the audit trail."
              : mode === "reject"
                ? "Explain what the vendor needs to change. The reason is shown to them when they resubmit."
                : "Read-only details for this operation request."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 rounded-md border p-3">
            <DetailRow label="Request">
              {TYPE_LABELS[request.type] ?? request.type}
            </DetailRow>
            <DetailRow label="Storefront">{requestName(request)}</DetailRow>
            <DetailRow label="Slug" mono>
              {requestSlug(request)}
            </DetailRow>
            <DetailRow label="Vendor ID" mono>
              {request.requesterId || "—"}
            </DetailRow>
            <DetailRow label="Target ID" mono>
              {request.targetId ||
                (typeof request.payload?.storefrontId === "string"
                  ? request.payload.storefrontId
                  : "—")}
            </DetailRow>
            <DetailRow label="Submitted">
              {formatDateTime(request.createdAt)}
            </DetailRow>
            {request.reviewedAt && (
              <DetailRow label="Reviewed">
                {formatDateTime(request.reviewedAt)}
              </DetailRow>
            )}
          </div>

          {mode !== "view" && (
            <div className="space-y-2">
              <Label htmlFor="review-note">
                {mode === "reject" ? (
                  <>
                    Reason for rejection{" "}
                    <span className="text-destructive">*</span>
                  </>
                ) : (
                  "Note (optional)"
                )}
              </Label>
              <Textarea
                id="review-note"
                value={note}
                onChange={(event) => {
                  setNote(event.target.value)
                  setFormError("")
                }}
                maxLength={500}
                rows={4}
                placeholder={
                  mode === "reject"
                    ? "e.g. Add a banner and at least three products before resubmitting."
                    : "Optional context for the vendor and audit log."
                }
                aria-invalid={Boolean(formError)}
              />
              <p className="text-right text-xs text-muted-foreground">
                {note.trim().length}/500
              </p>
            </div>
          )}

          {mode === "view" && request.reviewNote && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Review note</p>
              <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                {request.reviewNote}
              </p>
            </div>
          )}

          {formError && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {formError}
            </p>
          )}
        </div>

        <DialogFooter className="flex-row flex-wrap justify-end">
          {mode === "view" ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant={mode === "reject" ? "destructive" : "default"}
                onClick={handleSubmit}
                disabled={
                  submitting || (mode === "reject" && !note.trim())
                }
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submittingLabel}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
