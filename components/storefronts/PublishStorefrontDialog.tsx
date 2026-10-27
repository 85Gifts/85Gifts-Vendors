"use client"

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

export type StorefrontPublishAction =
  | "publish"
  | "resubmit"
  | "unpublish"
  | "cancel"

interface PublishStorefrontDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: StorefrontPublishAction
  storefrontName: string
  submitting: boolean
  onConfirm: () => void
}

const COPY: Record<
  StorefrontPublishAction,
  {
    title: string
    description: (name: string) => string
    confirm: string
    destructive?: boolean
  }
> = {
  publish: {
    title: "Request approval to publish?",
    description: (name) =>
      `${name} stays private while an admin reviews the request. You can keep editing it, and we will notify you when a decision is made.`,
    confirm: "Send request",
  },
  resubmit: {
    title: "Request approval again?",
    description: (name) =>
      `This sends ${name} for another review. Address the admin's note first so it is not rejected again.`,
    confirm: "Send request",
  },
  unpublish: {
    title: "Unpublish this storefront?",
    description: (name) =>
      `${name} will stop being publicly available immediately. Existing product links will no longer work until you request approval again.`,
    confirm: "Unpublish",
    destructive: true,
  },
  cancel: {
    title: "Cancel the approval request?",
    description: (name) =>
      `The request for ${name} will be cancelled and the storefront will return to draft. You can request approval again later.`,
    confirm: "Cancel request",
    destructive: true,
  },
}

export function PublishStorefrontDialog({
  open,
  onOpenChange,
  action,
  storefrontName,
  submitting,
  onConfirm,
}: PublishStorefrontDialogProps) {
  const copy = COPY[action]

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !submitting && onOpenChange(next)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>
            {copy.description(storefrontName)}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row flex-wrap justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Keep as is
          </Button>
          <Button
            type="button"
            variant={copy.destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {copy.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
