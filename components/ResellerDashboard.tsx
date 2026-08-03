"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { TrendingUp, Calendar, DollarSign, User, Moon, Sun, Percent, MousePointerClick, LogOut, Sparkles, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CardSpotlight } from "@/components/ui/card-spotlight"
import { useResellerAuth } from "@/contexts/ResellerAuthContext"
import ResellerEventCard from "@/components/reseller/ResellerEventCard"

export default function ResellerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)
  const { email, events, logout } = useResellerAuth()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme") as "light" | "dark" | null
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme, mounted])

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    localStorage.setItem("theme", next)
  }

  const handleLogout = () => {
    logout()
  }

  const stats = useMemo(() => ({
    activeEvents: events.length,
  }), [events])

  const overviewCards = [
    { id: "sales", labelClass: "text-purple-600 dark:text-purple-400", label: "Total Sales", value: "—", icon: DollarSign },
    { id: "commission", labelClass: "text-emerald-600 dark:text-emerald-400", label: "Commission Earned", value: "—", icon: Percent },
    { id: "events", labelClass: "text-blue-600 dark:text-blue-400", label: "Active Events", value: String(stats.activeEvents), icon: Calendar },
    { id: "clicks", labelClass: "text-orange-600 dark:text-orange-400", label: "Referral Clicks", value: "—", icon: MousePointerClick },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="https://res.cloudinary.com/dsmc6vtpt/image/upload/v1768827902/omniflow_monogram_blue_segmsg.png"
                alt="logo"
                className="h-10"
                width={50}
                height={50}
              />
              <h1 className="text-xl font-bold text-foreground">OmniFlow85</h1>
              <Badge className="ml-2 bg-primary/10 text-primary text-xs">
                Reseller
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              {email && (
                <span className="hidden sm:block text-sm text-muted-foreground max-w-[200px] truncate">
                  {email}
                </span>
              )}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
              </button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <nav className="flex min-w-max space-x-4 sm:space-x-8">
              {[
                { id: "overview", label: "Overview", icon: TrendingUp },
                { id: "events", label: "Events", icon: Calendar },
                { id: "commissions", label: "Commissions", icon: DollarSign },
                { id: "profile", label: "Profile", icon: User },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewCards.map((card) => {
                const Icon = card.icon
                return (
                  <CardSpotlight
                    key={card.id}
                    className="p-6"
                    spotColor="rgba(85, 110, 230, 0.18)"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`text-sm ${card.labelClass}`}>{card.label}</p>
                        <p className="text-3xl font-bold tabular-nums mt-1">{card.value}</p>
                      </div>
                      <span className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
                        <Icon className="w-6 h-6 text-primary" />
                      </span>
                    </div>
                  </CardSpotlight>
                )
              })}
            </div>

            <div className="bg-card rounded-xl border shadow-sm">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Ticket className="w-4 h-4" />
                  Your Referral Links
                </h2>
              </div>
              <div className="p-5">
                {events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((event) => (
                      <ResellerEventCard key={event.resellerId || event.eventId} event={event} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No events assigned to you yet. When an organizer adds you as a reseller, your referral links will appear here.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="bg-card rounded-xl border shadow-sm">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Events You&apos;re Reselling
                </h2>
              </div>
              <div className="p-5">
                {events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {events.map((event) => (
                      <ResellerEventCard key={event.resellerId || event.eventId} event={event} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No events yet. Share your referral links once an organizer assigns you to an event.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === "commissions" && (
          <div className="bg-card rounded-xl border shadow-sm p-10 text-center">
            <span className="inline-flex items-center justify-center rounded-xl bg-primary/10 p-4 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </span>
            <h3 className="text-lg font-semibold text-foreground mb-2">Commissions — Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your earnings, payout history, and commission breakdown will appear here once available.
            </p>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {(email || "R").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Reseller Account</h2>
                  <p className="text-sm text-muted-foreground">{email || "Not signed in"}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Profile management is coming soon. Your referral codes and links are available on the Overview and Events tabs.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
