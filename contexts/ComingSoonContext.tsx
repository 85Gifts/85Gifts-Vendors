"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react"

import { ComingSoonModal } from "@/components/ComingSoonModal"

export type ShowComingSoonOptions = {
  /** Shown under the title, e.g. &quot;Campaign analytics&quot; */
  featureLabel?: string
}

type ComingSoonContextValue = {
  /** Open the coming-soon modal instead of running an action (e.g. API call). */
  showComingSoon: (options?: ShowComingSoonOptions) => void
  hideComingSoon: () => void
  /** True while the modal is open — rarely needed; prefer showComingSoon. */
  isComingSoonOpen: boolean
}

const ComingSoonContext = createContext<ComingSoonContextValue | undefined>(
  undefined
)

export function ComingSoonProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [featureLabel, setFeatureLabel] = useState<string | undefined>(
    undefined
  )

  const showComingSoon = useCallback((options?: ShowComingSoonOptions) => {
    setFeatureLabel(options?.featureLabel)
    setOpen(true)
  }, [])

  const hideComingSoon = useCallback(() => {
    setOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      showComingSoon,
      hideComingSoon,
      isComingSoonOpen: open,
    }),
    [open, showComingSoon, hideComingSoon]
  )

  return (
    <ComingSoonContext.Provider value={value}>
      {children}
      <ComingSoonModal
        open={open}
        onClose={hideComingSoon}
        featureLabel={featureLabel}
      />
    </ComingSoonContext.Provider>
  )
}

export function useComingSoon(): ComingSoonContextValue {
  const ctx = useContext(ComingSoonContext)
  if (!ctx) {
    throw new Error("useComingSoon must be used within ComingSoonProvider")
  }
  return ctx
}

/**
 * Returns a click handler that shows the coming-soon modal and optionally
 * stops the event (default: prevent default + stop propagation).
 */
export function useComingSoonHandler(
  featureLabel?: string,
  stopEvent: boolean = true
) {
  const { showComingSoon } = useComingSoon()
  return useCallback(
    (e?: MouseEvent) => {
      if (stopEvent && e) {
        e.preventDefault()
        e.stopPropagation()
      }
      showComingSoon({ featureLabel })
    },
    [showComingSoon, featureLabel, stopEvent]
  )
}
