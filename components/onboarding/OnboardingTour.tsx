'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { driver } from 'driver.js'
import type { Driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useTour } from './TourContext'
import { TOUR_STEPS } from './tour-config'

const ELEMENT_TIMEOUT = 3000

function waitForElement(selector: string): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const el = document.querySelector(selector) as HTMLElement | null
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

export function OnboardingTour() {
  const { status, stepIndex, next, back, stop } = useTour()
  const router = useRouter()
  const pathname = usePathname()
  const driverRef = React.useRef<Driver | null>(null)
  const pendingRef = React.useRef(false)

  React.useEffect(() => {
    if (status !== 'active') return
    const driverObj = driver({
      steps: TOUR_STEPS.map((s) => ({
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
      overlayOpacity: 0.65,
      stagePadding: 6,
      stageRadius: 12,
      popoverOffset: 12,
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
        TOUR_STEPS.forEach((_, i) => {
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
  }, [status, next, back, stop])

  React.useEffect(() => {
    if (status !== 'active') return
    const driverObj = driverRef.current
    if (!driverObj) return
    const step = TOUR_STEPS[stepIndex]
    let cancelled = false

    const go = async () => {
      if (step.route && pathname !== step.route) {
        router.push(step.route)
      }
      const el = await waitForElement(step.target)
      if (cancelled) return
      if (!el) {
        if (stepIndex >= TOUR_STEPS.length - 1) {
          stop()
        } else {
          next()
        }
        return
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
  }, [status, stepIndex, pathname, router, next, stop])

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
