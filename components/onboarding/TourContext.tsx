'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { useVendorAuth } from '@/contexts/VendorAuthContext'
import { TOUR_STEPS } from './tour-config'

type TourStatus = 'idle' | 'welcome' | 'active'

interface TourContextValue {
  status: TourStatus
  stepIndex: number
  startTour: () => void
  acceptWelcome: () => void
  dismissWelcome: () => void
  next: () => void
  back: () => void
  stop: () => void
}

const TourContext = React.createContext<TourContextValue | undefined>(undefined)

function getStorageKey(): string {
  let vendorId = 'anon'
  try {
    vendorId = localStorage.getItem('vendorId') || 'anon'
  } catch {}
  return `of85_tour_done_${vendorId}`
}

function isTourDone(): boolean {
  try {
    return localStorage.getItem(getStorageKey()) === 'true'
  } catch {
    return false
  }
}

function markTourDone(): void {
  try {
    localStorage.setItem(getStorageKey(), 'true')
  } catch {}
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<TourStatus>('idle')
  const [stepIndex, setStepIndex] = React.useState(0)
  const [tourDone, setTourDone] = React.useState<boolean | null>(null)
  const pathname = usePathname()
  const { isAuthenticated, loading } = useVendorAuth()

  React.useEffect(() => {
    setTourDone(isTourDone())
  }, [])

  const checkedRef = React.useRef(false)
  React.useEffect(() => {
    if (checkedRef.current) return
    if (loading || !isAuthenticated || tourDone !== false) return
    if (pathname !== '/dashboard') return
    checkedRef.current = true
    const timer = setTimeout(() => setStatus('welcome'), 800)
    return () => clearTimeout(timer)
  }, [loading, isAuthenticated, tourDone, pathname])

  const startTour = React.useCallback(() => {
    setStepIndex(0)
    setStatus('active')
  }, [])

  const acceptWelcome = React.useCallback(() => {
    setStepIndex(0)
    setStatus('active')
  }, [])

  const dismissWelcome = React.useCallback(() => {
    markTourDone()
    setTourDone(true)
    setStatus('idle')
  }, [])

  const stop = React.useCallback(() => {
    markTourDone()
    setTourDone(true)
    setStatus('idle')
  }, [])

  const next = React.useCallback(() => {
    setStepIndex((i) => {
      if (i >= TOUR_STEPS.length - 1) return i
      return i + 1
    })
  }, [])

  const back = React.useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1))
  }, [])

  const value = React.useMemo(
    () => ({
      status,
      stepIndex,
      startTour,
      acceptWelcome,
      dismissWelcome,
      next,
      back,
      stop,
    }),
    [status, stepIndex, startTour, acceptWelcome, dismissWelcome, next, back, stop]
  )

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export function useTour(): TourContextValue {
  const ctx = React.useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}
