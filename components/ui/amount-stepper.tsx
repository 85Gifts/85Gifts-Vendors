"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AmountStepperProps {
  value: string
  onChange: (value: string) => void
  min?: number
  step?: number
  placeholder?: string
  id?: string
  disabled?: boolean
  className?: string
}

function AmountStepper({
  value,
  onChange,
  min = 0,
  step = 100,
  placeholder,
  id,
  disabled,
  className,
}: AmountStepperProps) {
  const adjust = (direction: 1 | -1) => {
    if (disabled) return
    const current = parseFloat(value)
    const base = Number.isNaN(current) ? 0 : current
    const next = Math.max(min, base + direction * step)
    onChange(String(next))
  }

  return (
    <div className={cn("flex items-stretch gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => adjust(-1)}
        disabled={disabled}
        aria-label="Decrease amount"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        disabled={disabled}
        className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => adjust(1)}
        disabled={disabled}
        aria-label="Increase amount"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  )
}

export { AmountStepper }
