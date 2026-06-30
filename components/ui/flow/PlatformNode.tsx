"use client"

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { cn } from "@/lib/utils"

export type PlatformNodeData = {
  title: string
  description: string
  longDescription?: string
  icon: React.ReactNode
  direction?: "LR" | "TB"
  accent?: string
}

export type PlatformNodeType = Node<PlatformNodeData, "platformNode">

const accentColors: Record<string, string> = {
  "from-blue-500 to-blue-400": "#3b82f6",
  "from-orange-500 to-amber-400": "#f59e0b",
  "from-emerald-500 to-green-400": "#10b981",
  "from-violet-500 to-purple-400": "#8b5cf6",
  "from-cyan-500 to-sky-400": "#06b6d4",
}

export function PlatformNode({ data, selected }: NodeProps<PlatformNodeType>) {
  const isHorizontal = data.direction !== "TB"
  const targetPos = isHorizontal ? Position.Left : Position.Top
  const sourcePos = isHorizontal ? Position.Right : Position.Bottom
  const accentColor = data.accent ? accentColors[data.accent] : undefined

  return (
    <div
      className={cn(
        "relative flex items-center gap-2 px-3 py-2.5 rounded-xl border shadow-sm transition-all duration-300 cursor-pointer select-none",
        "bg-card text-card-foreground",
        selected
          ? "shadow-md"
          : "border-border hover:shadow-md hover:border-primary/40",
      )}
      style={
        selected && accentColor
          ? { borderColor: accentColor, boxShadow: `0 4px 12px ${accentColor}22` }
          : undefined
      }
    >
      {accentColor && (
        <div
          className="absolute -top-px left-3 right-3 h-0.5 rounded-full"
          style={{ background: `linear-gradient(90deg, ${accentColor}88, ${accentColor})` }}
        />
      )}

      <Handle
        type="target"
        position={targetPos}
        className="!bg-primary !w-2 !h-2 !border-2 !border-background"
      />

      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={
          accentColor
            ? { background: `linear-gradient(135deg, ${accentColor}dd, ${accentColor})` }
            : undefined
        }
      >
        <span className={accentColor ? "text-white" : "text-primary"}>
          {data.icon}
        </span>
      </div>

      <span className="font-semibold text-xs leading-tight text-foreground whitespace-nowrap">
        {data.title}
      </span>

      <Handle
        type="source"
        position={sourcePos}
        className="!bg-primary !w-2 !h-2 !border-2 !border-background"
      />
    </div>
  )
}
