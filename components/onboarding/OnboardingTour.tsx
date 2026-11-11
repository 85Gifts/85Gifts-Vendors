'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { driver } from 'driver.js'
import type { Driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useTour } from './TourContext'

const ELEMENT_TIMEOUT = 5000

// Wait for page content before opening the mobile sidebar. The sidebar lives
// in the dashboard shell, which can remount during a route transition.
const PAGE_READY_TARGETS: Record<string, string> = {
  'side-dashboard': '[data-tour-id="dash-wallet"]',
  'side-events': '[data-tour-id="events-schedule"]',
  'side-products': '[data-tour-id="products-add"]',
  'side-inventory': '[data-tour-id="inventory-list"]',
  'side-ads': '[data-tour-id="ads-create"]',
  'side-transactions': '[data-tour-id="transactions-table"]',
}

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false
  }
  const rect = el.getBoundingClientRect()
  // Elements inside a horizontal carousel can be off-screen horizontally but
  // are still valid; driver.js scrolls them into view before highlighting.
  return rect.width > 0 && rect.height > 0
}

/**
 * Several tour targets exist twice (desktop + mobile). Pick the first one that
 * is actually rendered so the popover is never anchored to a hidden duplicate.
 */
function waitForVisibleElement(selector: string): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const el = Array.from(
        document.querySelectorAll<HTMLElement>(selector)
      ).find(isVisible)
      if (el) {
        window.clearInterval(timer)
        resolve(el)
      } else if (Date.now() - startedAt > ELEMENT_TIMEOUT) {
        window.clearInterval(timer)
        resolve(null)
      }
    }, 80)
  })
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function isMobileSidebarOpen(): boolean {
  const sidebar = document.querySelector<HTMLElement>(
    '[data-slot="sidebar"][data-mobile="true"]'
  )
  if (!sidebar) return false
  // The closed Sheet stays mounted and keeps its width, so only trust state.
  return sidebar.getAttribute('data-state') === 'open'
}

async function setMobileSidebar(open: boolean): Promise<void> {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const trigger = document.querySelector<HTMLButtonElement>(
      '[data-sidebar="trigger"]'
    )
    if (trigger) {
      if (isMobileSidebarOpen() !== open) {
        trigger.click()
        for (let wait = 0; wait < 20; wait += 1) {
          if (isMobileSidebarOpen() === open) break
          await delay(60)
        }
      }
      await delay(200)
      return
    }
    await delay(80)
  }
}

async function waitForRoute(route: string, isCancelled: () => boolean): Promise<void> {
  const startedAt = Date.now()
  while (Date.now() - startedAt < 5000) {
    if (isCancelled()) return
    if (window.location.pathname === route) {
      await delay(300)
      return
    }
    await delay(80)
  }
}

export function OnboardingTour() {
  const { status, stepIndex, steps, next, back, stop } = useTour()
  const router = useRouter()
  const pathname = usePathname()
  const driverRef = React.useRef<Driver | null>(null)
  const pendingRef = React.useRef(false)

  React.useEffect(() => {
    if (status !== 'active') return
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const driverObj = driver({
      steps: steps.map((s) => ({
        element: s.target,
        popover: { title: s.title, description: s.body },
      })),
      animate: true,
      duration: 400,
      smoothScroll: true,
      allowClose: false,
      allowKeyboardControl: false,
      disableActiveInteraction: true,
      overlayColor: '#000000',
      overlayOpacity: isMobile ? 0.3 : 0.55,
      stagePadding: isMobile ? 4 : 6,
      stageRadius: 12,
      popoverOffset: isMobile ? 8 : 12,
      popoverClass: 'of85-popover',
      onPopoverRender: (popover, { index }) => {
        const activeIndex = typeof index === 'number' ? index : 0
        const nav =
          popover.footer.querySelector('.driver-popover-navigation-btns') ?? popover.footerButtons
        document.querySelectorAll('.of85-footer-top, .of85-dots').forEach((n) => n.remove())
        const top = document.createElement('div')
        top.className = 'of85-footer-top'
        top.appendChild(popover.progress)
        if (nav) top.appendChild(nav)
        const dots = document.createElement('div')
        dots.className = 'of85-dots'
        steps.forEach((_, i) => {
          const dot = document.createElement('span')
          dot.className =
            'of85-dot' +
            (i === activeIndex ? ' of85-dot-active' : i < activeIndex ? ' of85-dot-visited' : '')
          dots.appendChild(dot)
        })
        popover.footer.prepend(top)
        popover.footer.appendChild(dots)
      },
      showButtons: ['next', 'previous', 'close'],
      showProgress: true,
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Finish',
      onNextClick: () => {
        if (pendingRef.current) return
        pendingRef.current = true
        next()
      },
      onPrevClick: () => {
        if (pendingRef.current) return
        pendingRef.current = true
        back()
      },
      onCloseClick: () => stop(),
      onDoneClick: () => stop(),
    })
    driverRef.current = driverObj
    return () => {
      driverObj.destroy()
      driverRef.current = null
      pendingRef.current = false
    }
  }, [status, steps, next, back, stop])

  React.useEffect(() => {
    if (status !== 'active') return
    const driverObj = driverRef.current
    if (!driverObj) return
    const step = steps[stepIndex]
    if (!step) {
      stop()
      return
    }
    let cancelled = false

    const go = async () => {
      if (step.route && pathname !== step.route) {
        router.push(step.route)
        await waitForRoute(step.route, () => cancelled)
      }
      if (cancelled) return
      if (window.matchMedia('(max-width: 767px)').matches) {
        const readyTarget = PAGE_READY_TARGETS[step.id]
        if (readyTarget) {
          await waitForVisibleElement(readyTarget)
        }
        if (cancelled) return
        await setMobileSidebar(step.id.startsWith('side-'))
      }
      if (cancelled) return
      const el = await waitForVisibleElement(step.target)
      if (cancelled) return
      if (!el) {
        if (stepIndex >= steps.length - 1) {
          stop()
        } else {
          next()
        }
        return
      }
      const driverStep = driverObj.getConfig().steps?.[stepIndex]
      if (driverStep) {
        driverStep.element = el
      }
      if (!driverObj.isActive()) {
        driverObj.drive(stepIndex)
      } else if (driverObj.getActiveIndex() !== stepIndex) {
        driverObj.moveTo(stepIndex)
      } else {
        driverObj.refresh()
      }
      pendingRef.current = false
    }

    void go()
    return () => {
      cancelled = true
    }
  }, [status, stepIndex, steps, pathname, router, next, stop])

  React.useEffect(() => {
    if (status !== 'active') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, stop])

  return null
}
