"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { TrendingUp, Calendar, DollarSign, User, Copy, Check, ExternalLink, Moon, Sun, Percent, Ticket, MousePointerClick } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

interface ResellerEvent {
  id: string
  title: string
  date: string
  ticketsSold: number
  totalCapacity: number
  commissionRate: number
  status: "upcoming" | "ongoing" | "completed"
}

interface Commission {
  id: string
  eventTitle: string
  saleAmount: number
  rate: number
  earned: number
  status: "pending" | "paid"
  date: string
}

interface DashboardStats {
  totalSales: number
  totalCommission: number
  activeEvents: number
  referralClicks: number
}

const mockEvents: ResellerEvent[] = [
  { id: "1", title: "Summer Music Fest", date: "2026-07-15", ticketsSold: 34, totalCapacity: 200, commissionRate: 10, status: "upcoming" },
  { id: "2", title: "Art & Wine Expo", date: "2026-06-20", ticketsSold: 58, totalCapacity: 150, commissionRate: 12, status: "ongoing" },
  { id: "3", title: "Tech Conference 2026", date: "2026-05-10", ticketsSold: 89, totalCapacity: 300, commissionRate: 8, status: "completed" },
  { id: "4", title: "Food Bazaar Night", date: "2026-08-05", ticketsSold: 22, totalCapacity: 100, commissionRate: 15, status: "upcoming" },
  { id: "5", title: "Fashion Week Showcase", date: "2026-04-28", ticketsSold: 127, totalCapacity: 250, commissionRate: 10, status: "completed" },
]

const mockCommissions: Commission[] = [
  { id: "1", eventTitle: "Tech Conference 2026", saleAmount: 44500, rate: 8, earned: 3560, status: "paid", date: "2026-05-15" },
  { id: "2", eventTitle: "Fashion Week Showcase", saleAmount: 38000, rate: 10, earned: 3800, status: "paid", date: "2026-05-02" },
  { id: "3", eventTitle: "Art & Wine Expo", saleAmount: 17400, rate: 12, earned: 2088, status: "pending", date: "2026-06-18" },
  { id: "4", eventTitle: "Summer Music Fest", saleAmount: 10200, rate: 10, earned: 1020, status: "pending", date: "2026-07-10" },
  { id: "5", eventTitle: "Food Bazaar Night", saleAmount: 6600, rate: 15, earned: 990, status: "pending", date: "2026-08-02" },
]

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
  currencyDisplay: "narrowSymbol",
})

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(iso))
  } catch {
    return iso
  }
}

const getEventStatusStyle = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 text-green-700"
    case "ongoing": return "bg-blue-100 text-blue-700"
    case "upcoming": return "bg-yellow-100 text-yellow-700"
    default: return "bg-gray-100 text-gray-600"
  }
}

const getCommissionStatusStyle = (status: string) => {
  switch (status) {
    case "paid": return "bg-green-100 text-green-700"
    case "pending": return "bg-yellow-100 text-yellow-700"
    default: return "bg-gray-100 text-gray-600"
  }
}

export default function ResellerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

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

  const referralCode = "RESELL85G"
  const referralLink = "https://omniflow85.com/ref/RESELL85G"

  const stats: DashboardStats = useMemo(() => ({
    totalSales: mockCommissions.reduce((sum, c) => sum + c.saleAmount, 0),
    totalCommission: mockCommissions.reduce((sum, c) => sum + c.earned, 0),
    activeEvents: mockEvents.filter(e => e.status !== "completed").length,
    referralClicks: 142,
  }), [])

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "code") { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000) }
      if (type === "link") { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000) }
      toast({ title: "Copied!", variant: "success" })
    } catch {
      toast({ title: "Copy failed", variant: "destructive" })
    }
  }

  const overviewCards = [
    { id: "sales", gradient: "from-purple-500 to-purple-600", label: "Total Sales", value: currencyFormatter.format(stats.totalSales), icon: DollarSign },
    { id: "commission", gradient: "from-green-500 to-green-600", label: "Commission Earned", value: currencyFormatter.format(stats.totalCommission), icon: Percent },
    { id: "events", gradient: "from-blue-500 to-blue-600", label: "Active Events", value: String(stats.activeEvents), icon: Calendar },
    { id: "clicks", gradient: "from-orange-500 to-orange-600", label: "Referral Clicks", value: String(stats.referralClicks), icon: MousePointerClick },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">OmniFlow85</h1>
              <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-xs">
                Reseller
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
              </button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/"}>
                Exit Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
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
                        ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
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
                  <div key={card.id} className={`bg-gradient-to-r ${card.gradient} rounded-xl p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white/80 text-sm">{card.label}</p>
                        <p className="text-3xl font-bold mt-1">{card.value}</p>
                      </div>
                      <Icon className="w-8 h-8 text-white/40" />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Recent Commissions
                </h2>
              </div>
              <div className="p-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Sale Amount</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Earned</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCommissions.slice(0, 3).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-200">{c.eventTitle}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{currencyFormatter.format(c.saleAmount)}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{c.rate}%</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-200 font-medium">{currencyFormatter.format(c.earned)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-xs capitalize ${getCommissionStatusStyle(c.status)}`}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 dark:text-gray-500">{formatDate(c.date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Events You&apos;re Reselling
              </h2>
            </div>
            <div className="p-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Tickets Sold</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEvents.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium text-gray-900 dark:text-gray-200">{e.title}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{formatDate(e.date)}</TableCell>
                      <TableCell className="text-gray-900 dark:text-gray-200">{e.ticketsSold}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{e.totalCapacity}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{e.commissionRate}%</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs capitalize ${getEventStatusStyle(e.status)}`}>
                          {e.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === "commissions" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                <p className="text-white/80 text-sm">Total Earned</p>
                <p className="text-3xl font-bold mt-1">{currencyFormatter.format(stats.totalCommission)}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                <p className="text-white/80 text-sm">Pending</p>
                <p className="text-3xl font-bold mt-1">{currencyFormatter.format(mockCommissions.filter(c => c.status === "pending").reduce((s, c) => s + c.earned, 0))}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <p className="text-white/80 text-sm">Paid Out</p>
                <p className="text-3xl font-bold mt-1">{currencyFormatter.format(mockCommissions.filter(c => c.status === "paid").reduce((s, c) => s + c.earned, 0))}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Commission History
                </h2>
              </div>
              <div className="p-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Sale Amount</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Earned</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCommissions.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-200">{c.eventTitle}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{currencyFormatter.format(c.saleAmount)}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{c.rate}%</TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-200 font-medium">{currencyFormatter.format(c.earned)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-xs capitalize ${getCommissionStatusStyle(c.status)}`}>
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 dark:text-gray-500">{formatDate(c.date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  JD
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Jane Doe</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">jane.doe@example.com</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">Referral Code</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm font-mono text-gray-900 dark:text-gray-200">
                      {referralCode}
                    </code>
                    <button
                      onClick={() => copyToClipboard(referralCode, "code")}
                      className="rounded-lg p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Copy referral code"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">Referral Link</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm font-mono text-gray-900 dark:text-gray-200 truncate">
                      {referralLink}
                    </code>
                    <button
                      onClick={() => copyToClipboard(referralLink, "link")}
                      className="rounded-lg p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Copy referral link"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={referralLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Open referral link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Performance Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Events</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{mockEvents.length}</p>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tickets Sold</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{mockEvents.reduce((s, e) => s + e.ticketsSold, 0)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Commission Rate</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {Math.round(mockEvents.reduce((s, e) => s + e.commissionRate, 0) / mockEvents.length)}%
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Referral Clicks</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{stats.referralClicks}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
