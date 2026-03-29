"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Sparkles, X } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ComingSoonModalProps {
  open: boolean
  onClose: () => void
  /** Optional label, e.g. the feature name the user tried to open */
  featureLabel?: string
}

export function ComingSoonModal({
  open,
  onClose,
  featureLabel,
}: ComingSoonModalProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="coming-soon-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px] dark:bg-black/70"
            aria-label="Close dialog"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-2xl border border-border/80",
              "bg-gradient-to-br from-card via-card to-purple-500/[0.07] dark:to-purple-400/[0.09]",
              "shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_25px_50px_-12px_rgba(0,0,0,0.35)]"
            )}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-purple-500/15 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-12 -left-12 size-40 rounded-full bg-violet-400/10 blur-2xl"
              aria-hidden
            />

            <div className="relative flex items-start justify-between gap-3 border-b border-border/60 px-6 pt-6 pb-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-600/12 text-purple-600 dark:bg-purple-400/15 dark:text-purple-300">
                  <Sparkles className="size-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p
                    id="coming-soon-title"
                    className="text-lg font-semibold tracking-tight text-foreground"
                  >
                    Coming soon
                  </p>
                  {featureLabel ? (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {featureLabel}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">
                      We&apos;re still building this — check back shortly.
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="relative px-6 pb-6 pt-2">
              <p className="text-sm leading-relaxed text-muted-foreground">
                You&apos;ll get full access once this feature ships. Thanks for
                your patience.
              </p>
              <Button
                type="button"
                className="mt-5 w-full bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-500"
                onClick={onClose}
              >
                Got it
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
