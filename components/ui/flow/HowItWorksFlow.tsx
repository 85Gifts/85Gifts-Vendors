"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
  BackgroundVariant,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import dagre from "dagre"
import { PlatformNode } from "./PlatformNode"
import {
  IconBuildingStore,
  IconCalendarEvent,
  IconUsers,
  IconShieldLock,
  IconTrendingUp,
} from "@tabler/icons-react"
import { motion, AnimatePresence } from "framer-motion"
import type { JSX } from "react"

const nodeTypes = {
  platformNode: PlatformNode,
}

type StepData = {
  id: string
  title: string
  description: string
  longDescription: string
  icon: JSX.Element
  accent: string
}

const steps: StepData[] = [
  {
    id: "vendor",
    title: "Vendor Setup",
    description: "Create your free account",
    longDescription:
      "Sign up in minutes and set up your vendor profile. No credit card required. Start selling immediately.",
    icon: <IconBuildingStore size={16} />,
    accent: "from-blue-500 to-blue-400",
  },
  {
    id: "events-products",
    title: "Events & Products",
    description: "List what you sell",
    longDescription:
      "Create events with ticket tiers, manage your product catalog, and track inventory in real time from one dashboard.",
    icon: <IconCalendarEvent size={16} />,
    accent: "from-orange-500 to-amber-400",
  },
  {
    id: "discovery",
    title: "Customer Discovery",
    description: "Reach buyers everywhere",
    longDescription:
      "Run cross-platform ads, share payment links, and let customers discover your offerings across channels.",
    icon: <IconUsers size={16} />,
    accent: "from-emerald-500 to-green-400",
  },
  {
    id: "payments",
    title: "Payments & Escrow",
    description: "Secure transactions",
    longDescription:
      "Process payments with built-in escrow protection. Buyers pay with confidence, sellers get paid on delivery.",
    icon: <IconShieldLock size={16} />,
    accent: "from-violet-500 to-purple-400",
  },
  {
    id: "analytics",
    title: "Analytics & Growth",
    description: "Track & scale",
    longDescription:
      "Monitor revenue, customer growth, and performance metrics. Use insights to grow your business.",
    icon: <IconTrendingUp size={16} />,
    accent: "from-cyan-500 to-sky-400",
  },
]

const nodeIds = steps.map((s) => s.id)

function getNodeSize(): { w: number; h: number } {
  if (typeof window === "undefined") return { w: 150, h: 44 }
  const small = window.innerWidth < 640
  return small ? { w: 124, h: 40 } : { w: 150, h: 44 }
}

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "LR" | "TB",
) {
  const { w: NODE_W, h: NODE_H } = getNodeSize()
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({
    rankdir: direction,
    nodesep: direction === "LR" ? 36 : 24,
    ranksep: direction === "LR" ? 56 : 44,
  })

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_W, height: NODE_H })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      ...node,
      position: {
        x: pos.x - NODE_W / 2,
        y: pos.y - NODE_H / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

function buildEdges(ids: string[]): Edge[] {
  const edges: Edge[] = []
  for (let i = 0; i < ids.length - 1; i++) {
    edges.push({
      id: `e-${ids[i]}-${ids[i + 1]}`,
      source: ids[i],
      target: ids[i + 1],
      type: "smoothstep",
      animated: true,
      style: { strokeWidth: 2, stroke: "var(--primary)" },
    })
  }
  return edges
}

export default function HowItWorksFlow() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [rankDir, setRankDir] = useState<"LR" | "TB">("LR")

  useEffect(() => {
    const check = () => setRankDir(window.innerWidth < 900 ? "TB" : "LR")
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const nodes: Node[] = steps.map((s) => ({
      id: s.id,
      type: "platformNode",
      position: { x: 0, y: 0 },
      data: {
        title: s.title,
        description: s.description,
        longDescription: s.longDescription,
        icon: s.icon,
        direction: rankDir,
        accent: s.accent,
      },
    }))
    return getLayoutedElements(nodes, buildEdges(nodeIds), rankDir)
  }, [rankDir])

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

  useEffect(() => {
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges])

  const onNodeMouseEnter: NodeMouseHandler = useCallback((_, node) => {
    setHoveredNode(node.id)
  }, [])

  const onNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    setHoveredNode(null)
  }, [])

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNode((prev) => (prev === node.id ? null : node.id))
  }, [])

  const selectedInfo = steps.find((s) => s.id === selectedNode) ?? null

  const highlightNodeIds = useMemo(() => {
    if (!hoveredNode) return null
    const s = new Set([hoveredNode])
    for (const edge of layoutedEdges) {
      if (edge.source === hoveredNode || edge.target === hoveredNode) {
        s.add(edge.source)
        s.add(edge.target)
      }
    }
    return s
  }, [hoveredNode, layoutedEdges])

  const visibleNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        style: {
          opacity:
            hoveredNode && highlightNodeIds && !highlightNodeIds.has(n.id)
              ? 0.2
              : 1,
          transition: "opacity 0.3s ease",
        },
      })),
    [nodes, hoveredNode, highlightNodeIds],
  )

  const visibleEdges = useMemo(
    () =>
      edges.map((e) => {
        const isDimmed =
          hoveredNode &&
          (!highlightNodeIds?.has(e.source) || !highlightNodeIds?.has(e.target))
        return {
          ...e,
          style: {
            ...e.style,
            stroke: isDimmed ? "var(--muted-foreground)" : "var(--primary)",
            opacity: isDimmed ? 0.12 : 1,
            transition: "all 0.3s ease",
          },
        }
      }),
    [edges, hoveredNode, highlightNodeIds],
  )

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="flex-1 min-h-[200px]">
        <ReactFlow
          nodes={visibleNodes}
          edges={visibleEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: rankDir === "TB" ? 0.18 : 0.1 }}
          minZoom={0.4}
          maxZoom={1.75}
          proOptions={{ hideAttribution: true }}
          panOnDrag
          zoomOnScroll={false}
          zoomOnPinch
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable={false}
          className="!bg-transparent"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
          />
        </ReactFlow>
      </div>


      <AnimatePresence>
        {selectedInfo && (
          <motion.div
            key={selectedInfo.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                {selectedInfo.icon}
              </div>
              <div>
                <h4 className="font-semibold text-xs text-foreground">
                  {selectedInfo.title}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  {selectedInfo.longDescription}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
