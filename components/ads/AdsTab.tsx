"use client"

import React, { useMemo, useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  DollarSign,
  Users,
  Target,
  BarChart3,
  Facebook,
  Instagram,
  Zap,
  Filter,
  Search,
  Plus,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

interface AdCampaign {
  id: string
  name: string
  platform: "meta" | "snapchat" | "tiktok"
  status: "active" | "paused" | "completed"
  startDate: string
  endDate?: string
  budget: number
  spend: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
  roas: number
}

interface PlatformMetrics {
  platform: "meta" | "snapchat" | "tiktok"
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  totalSpend: number
  impressions: number
  clicks: number
  conversions: number
  ctr: number
  cpc: number
  cpm: number
  roas: number
  activeCampaigns: number
  trend: "up" | "down"
  trendPercentage: number
}

// Hardcoded data
const mockCampaigns: AdCampaign[] = [
  {
    id: "1",
    name: "Summer Gift Collection 2025",
    platform: "meta",
    status: "active",
    startDate: "2025-01-15",
    budget: 50000,
    spend: 32500,
    impressions: 1250000,
    clicks: 12500,
    conversions: 450,
    ctr: 1.0,
    cpc: 2.6,
    cpm: 26.0,
    roas: 3.2,
  },
  {
    id: "2",
    name: "Valentine's Day Special",
    platform: "meta",
    status: "active",
    startDate: "2025-01-20",
    budget: 30000,
    spend: 18500,
    impressions: 850000,
    clicks: 8500,
    conversions: 320,
    ctr: 1.0,
    cpc: 2.18,
    cpm: 21.76,
    roas: 4.1,
  },
  {
    id: "3",
    name: "Snapchat Story Ads - Gift Sets",
    platform: "snapchat",
    status: "active",
    startDate: "2025-01-10",
    budget: 25000,
    spend: 15200,
    impressions: 980000,
    clicks: 9800,
    conversions: 280,
    ctr: 1.0,
    cpc: 1.55,
    cpm: 15.51,
    roas: 2.8,
  },
  {
    id: "4",
    name: "TikTok Viral Challenge Campaign",
    platform: "tiktok",
    status: "active",
    startDate: "2025-01-05",
    budget: 40000,
    spend: 28900,
    impressions: 2100000,
    clicks: 21000,
    conversions: 520,
    ctr: 1.0,
    cpc: 1.38,
    cpm: 13.76,
    roas: 3.5,
  },
  {
    id: "5",
    name: "Meta Retargeting Campaign",
    platform: "meta",
    status: "paused",
    startDate: "2024-12-01",
    endDate: "2025-01-10",
    budget: 20000,
    spend: 20000,
    impressions: 650000,
    clicks: 6500,
    conversions: 180,
    ctr: 1.0,
    cpc: 3.08,
    cpm: 30.77,
    roas: 2.5,
  },
  {
    id: "6",
    name: "Snapchat AR Lens Campaign",
    platform: "snapchat",
    status: "completed",
    startDate: "2024-12-15",
    endDate: "2025-01-05",
    budget: 15000,
    spend: 15000,
    impressions: 720000,
    clicks: 7200,
    conversions: 210,
    ctr: 1.0,
    cpc: 2.08,
    cpm: 20.83,
    roas: 3.0,
  },
]

const getStatusColor = (status: AdCampaign["status"]): string => {
  switch (status) {
    case "active":
      return "text-green-600 bg-green-100"
    case "paused":
      return "text-yellow-600 bg-yellow-100"
    case "completed":
      return "text-gray-600 bg-gray-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

const getPlatformIcon = (platform: AdCampaign["platform"]) => {
  switch (platform) {
    case "meta":
      return Facebook
    case "snapchat":
      return Zap
    case "tiktok":
      return Instagram
    default:
      return BarChart3
  }
}

const getPlatformColor = (platform: AdCampaign["platform"]): string => {
  switch (platform) {
    case "meta":
      return "text-blue-600"
    case "snapchat":
      return "text-yellow-600"
    case "tiktok":
      return "text-pink-600"
    default:
      return "text-gray-600"
  }
}

export default function AdsTab() {
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
        currencyDisplay: "narrowSymbol",
      }),
    []
  )

  const numberFormatter = useMemo(() => new Intl.NumberFormat("en-US"), [])

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const totalSpend = mockCampaigns.reduce((sum, campaign) => sum + campaign.spend, 0)
    const totalImpressions = mockCampaigns.reduce((sum, campaign) => sum + campaign.impressions, 0)
    const totalClicks = mockCampaigns.reduce((sum, campaign) => sum + campaign.clicks, 0)
    const totalConversions = mockCampaigns.reduce((sum, campaign) => sum + campaign.conversions, 0)
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
    const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0
    const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0
    const totalRevenue = mockCampaigns.reduce((sum, campaign) => sum + campaign.spend * campaign.roas, 0)
    const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0

    return {
      totalSpend,
      totalImpressions,
      totalClicks,
      totalConversions,
      avgCtr,
      avgCpc,
      avgCpm,
      avgRoas,
      activeCampaigns: mockCampaigns.filter((c) => c.status === "active").length,
    }
  }, [])

  // Calculate platform-specific metrics
  const platformMetrics: PlatformMetrics[] = useMemo(() => {
    const platforms: ("meta" | "snapchat" | "tiktok")[] = ["meta", "snapchat", "tiktok"]
    
    return platforms.map((platform) => {
      const campaigns = mockCampaigns.filter((c) => c.platform === platform)
      const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0)
      const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0)
      const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0)
      const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0)
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
      const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0
      const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0
      const totalRevenue = campaigns.reduce((sum, c) => sum + c.spend * c.roas, 0)
      const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0

      return {
        platform,
        name: platform === "meta" ? "Meta (Facebook/Instagram)" : platform === "snapchat" ? "Snapchat" : "TikTok",
        icon: getPlatformIcon(platform),
        color: platform === "meta" ? "blue" : platform === "snapchat" ? "yellow" : "pink",
        totalSpend,
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        ctr,
        cpc,
        cpm,
        roas,
        activeCampaigns: campaigns.filter((c) => c.status === "active").length,
        trend: Math.random() > 0.5 ? "up" : "down",
        trendPercentage: Math.floor(Math.random() * 30) + 5,
      }
    })
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterPlatform, setFilterPlatform] = useState<"all" | "meta" | "snapchat" | "tiktok">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "paused" | "completed">("all")

  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter((campaign) => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPlatform = filterPlatform === "all" || campaign.platform === filterPlatform
      const matchesStatus = filterStatus === "all" || campaign.status === filterStatus
      return matchesSearch && matchesPlatform && matchesStatus
    })
  }, [searchTerm, filterPlatform, filterStatus])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Ads Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and track your advertising campaigns across platforms</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Spend",
            value: currencyFormatter.format(overallMetrics.totalSpend),
            gradient: "from-purple-500 to-purple-600",
            accent: "text-purple-100",
            iconAccent: "text-purple-200",
            icon: DollarSign,
          },
          {
            label: "Impressions",
            value: numberFormatter.format(overallMetrics.totalImpressions),
            gradient: "from-blue-500 to-blue-600",
            accent: "text-blue-100",
            iconAccent: "text-blue-200",
            icon: Eye,
          },
          {
            label: "Clicks",
            value: numberFormatter.format(overallMetrics.totalClicks),
            gradient: "from-green-500 to-green-600",
            accent: "text-green-100",
            iconAccent: "text-green-200",
            icon: MousePointerClick,
          },
          {
            label: "Conversions",
            value: numberFormatter.format(overallMetrics.totalConversions),
            gradient: "from-orange-500 to-orange-600",
            accent: "text-orange-100",
            iconAccent: "text-orange-200",
            icon: Target,
          },
        ].map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className={`bg-gradient-to-r ${metric.gradient} rounded-xl p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${metric.accent} text-sm`}>{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${metric.iconAccent}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">CTR</span>
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold dark:text-white">{overallMetrics.avgCtr.toFixed(2)}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click-through rate</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg CPC</span>
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold dark:text-white">{currencyFormatter.format(overallMetrics.avgCpc)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cost per click</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg CPM</span>
            <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold dark:text-white">{currencyFormatter.format(overallMetrics.avgCpm)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cost per 1,000 impressions</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">ROAS</span>
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold dark:text-white">{overallMetrics.avgRoas.toFixed(2)}x</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Return on ad spend</p>
        </div>
      </div>

      {/* Platform Performance */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
          <BarChart3 className="w-5 h-5" />
          Platform Performance
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {platformMetrics.map((platform) => {
            const Icon = platform.icon
            return (
              <div key={platform.platform} className="border dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${getPlatformColor(platform.platform)}`} />
                    <div>
                      <h4 className="font-semibold dark:text-white">{platform.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{platform.activeCampaigns} active campaigns</p>
                    </div>
                  </div>
                  {platform.trend === "up" ? (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-medium">+{platform.trendPercentage}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <ArrowDownRight className="w-4 h-4" />
                      <span className="text-sm font-medium">-{platform.trendPercentage}%</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Spend</span>
                    <span className="font-medium dark:text-white">{currencyFormatter.format(platform.totalSpend)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Impressions</span>
                    <span className="font-medium dark:text-white">{numberFormatter.format(platform.impressions)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Clicks</span>
                    <span className="font-medium dark:text-white">{numberFormatter.format(platform.clicks)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Conversions</span>
                    <span className="font-medium dark:text-white">{numberFormatter.format(platform.conversions)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">CTR</span>
                    <span className="font-medium dark:text-white">{platform.ctr.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">CPC</span>
                    <span className="font-medium dark:text-white">{currencyFormatter.format(platform.cpc)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">CPM</span>
                    <span className="font-medium dark:text-white">{currencyFormatter.format(platform.cpm)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">ROAS</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{platform.roas.toFixed(2)}x</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800">
        <div className="p-6 border-b dark:border-gray-800">
          <h3 className="text-lg font-semibold flex items-center gap-2 dark:text-white">
            <BarChart3 className="w-5 h-5" />
            Campaigns
          </h3>
        </div>

        {/* Filters */}
        <div className="p-6 border-b dark:border-gray-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value as typeof filterPlatform)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            <option value="meta">Meta</option>
            <option value="snapchat">Snapchat</option>
            <option value="tiktok">TikTok</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Campaigns Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Spend / Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Impressions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Clicks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Conversions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CTR</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCampaigns.map((campaign) => {
                const PlatformIcon = getPlatformIcon(campaign.platform)
                const spendPercentage = (campaign.spend / campaign.budget) * 100
                return (
                  <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium dark:text-white">{campaign.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {campaign.startDate} {campaign.endDate && `- ${campaign.endDate}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <PlatformIcon className={`w-4 h-4 ${getPlatformColor(campaign.platform)}`} />
                        <span className="capitalize dark:text-white">{campaign.platform}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium dark:text-white">{currencyFormatter.format(campaign.spend)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">of {currencyFormatter.format(campaign.budget)}</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${spendPercentage > 90 ? "bg-red-500" : spendPercentage > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                            style={{ width: `${Math.min(spendPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium dark:text-white">{numberFormatter.format(campaign.impressions)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium dark:text-white">{numberFormatter.format(campaign.clicks)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium dark:text-white">{numberFormatter.format(campaign.conversions)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium dark:text-white">{campaign.ctr.toFixed(2)}%</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-green-600 dark:text-green-400">{campaign.roas.toFixed(2)}x</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
