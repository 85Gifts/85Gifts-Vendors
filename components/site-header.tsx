"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { CircleHelp } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useTour } from "@/components/onboarding/TourContext"

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/events": "Events",
  "/dashboard/products": "Products",
  "/dashboard/ads": "Ads",
  "/dashboard/transactions": "Transactions",
  "/inventory": "Inventory",
}

export function SiteHeader() {
  const pathname = usePathname()
  const { startTour, status } = useTour()
  const title =
    Object.entries(titles).find(([key]) =>
      key === "/dashboard" ? pathname === key : pathname.startsWith(key)
    )?.[1] ?? "Dashboard"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{title}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={startTour}
          disabled={status !== "idle"}
          aria-label="Replay product tour"
        >
          <CircleHelp className="size-5" />
        </Button>
      </div>
    </header>
  )
}
