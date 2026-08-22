'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTour } from './TourContext'

export function WelcomeModal() {
  const { status, acceptWelcome, dismissWelcome } = useTour()
  const open = status === 'welcome'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Welcome to OmniFlow85"
            className="w-full max-w-md rounded-2xl border bg-card p-8 text-center text-card-foreground shadow-2xl"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Compass className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Welcome to OmniFlow85!</h2>
            <p className="mb-6 text-muted-foreground">
              Let&apos;s take a quick tour so you know where everything lives — it only takes a minute.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={acceptWelcome} size="lg" className="w-full sm:w-auto sm:min-w-[150px]">
                <Play className="h-4 w-4" />
                Start Tour
              </Button>
              <Button onClick={dismissWelcome} variant="outline" size="lg" className="w-full sm:w-auto sm:min-w-[150px]">
                Skip for Now
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              You can replay this anytime from the help icon in the header.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
