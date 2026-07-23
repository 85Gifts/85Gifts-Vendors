"use client"

import React from "react"
import { X, Search, Facebook, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AdCampaign } from "./AdsTab"

interface CampaignDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  campaign: AdCampaign | null
  onPublishToGoogle?: (campaign: AdCampaign) => void
  onPublishToMeta?: (campaign: AdCampaign) => void
  onPublishToTikTok?: (campaign: AdCampaign) => void
}

export default function CampaignDetailsModal({
  isOpen,
  onClose,
  campaign,
  onPublishToGoogle,
  onPublishToMeta,
  onPublishToTikTok,
}: CampaignDetailsModalProps) {
  if (!isOpen || !campaign) return null

  const currencyFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
    currencyDisplay: "narrowSymbol",
  })

  const numberFormatter = new Intl.NumberFormat("en-US")

  const handlePublishToGoogle = () => {
    if (onPublishToGoogle) {
      onPublishToGoogle(campaign)
    }
  }

  const handlePublishToMeta = () => {
    if (onPublishToMeta) {
      onPublishToMeta(campaign)
    }
  }

  const handlePublishToTikTok = () => {
    if (onPublishToTikTok) {
      onPublishToTikTok(campaign)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-card rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-border">
          <h3 className="text-xl font-semibold dark:text-white">Campaign Details</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Publish Buttons */}
          <div className="pb-6 border-b dark:border-border">
            <h4 className="text-lg font-semibold mb-4 dark:text-white">Publish Campaign</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Google Ads Button */}
              <Button
                onClick={handlePublishToGoogle}
                className="flex items-center justify-center gap-3 font-semibold"
              >
                <Search className="w-5 h-5" />
                <span>Publish to Google Ads</span>
              </Button>

              {/* Meta Ads Button */}
              <Button
                onClick={handlePublishToMeta}
                className="flex items-center justify-center gap-3 font-semibold"
              >
                <Facebook className="w-5 h-5" />
                <span>Publish to Meta Ads</span>
              </Button>

              {/* TikTok Ads Button */}
              <Button
                onClick={handlePublishToTikTok}
                className="flex items-center justify-center gap-3 font-semibold"
              >
                <Music className="w-5 h-5" />
                <span>Publish to TikTok Ads</span>
              </Button>
            </div>
          </div>

          {/* Campaign Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Campaign Name</label>
              <p className="text-lg font-semibold dark:text-white">{campaign.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Platform</label>
              <p className="text-lg font-semibold capitalize dark:text-white">{campaign.platform}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                campaign.status === "active" ? "text-green-600 bg-green-100" :
                campaign.status === "paused" ? "text-yellow-600 bg-yellow-100" :
                campaign.status === "completed" ? "text-muted-foreground bg-muted" :
                campaign.status === "draft" ? "text-blue-600 bg-blue-100" :
                "text-orange-600 bg-orange-100"
              }`}>
                {campaign.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Date Range</label>
              <p className="text-lg dark:text-white">
                {campaign.startDate} {campaign.endDate && `- ${campaign.endDate}`}
              </p>
            </div>
          </div>

          {/* Budget & Spend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Budget</label>
              <p className="text-2xl font-bold dark:text-white">{currencyFormatter.format(campaign.budget)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Spend</label>
              <p className="text-2xl font-bold dark:text-white">{currencyFormatter.format(campaign.spend)}</p>
              <div className="w-full bg-muted dark:bg-muted rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    (campaign.spend / campaign.budget) * 100 > 90 ? "bg-red-500" :
                    (campaign.spend / campaign.budget) * 100 > 70 ? "bg-yellow-500" :
                    "bg-green-500"
                  }`}
                  style={{ width: `${Math.min((campaign.spend / campaign.budget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Impressions</label>
              <p className="text-xl font-bold dark:text-white">{numberFormatter.format(campaign.impressions)}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Clicks</label>
              <p className="text-xl font-bold dark:text-white">{numberFormatter.format(campaign.clicks)}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Conversions</label>
              <p className="text-xl font-bold dark:text-white">{numberFormatter.format(campaign.conversions)}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <label className="block text-sm font-medium text-muted-foreground mb-1">CTR</label>
              <p className="text-xl font-bold dark:text-white">{campaign.ctr.toFixed(2)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <label className="block text-sm font-medium text-muted-foreground mb-1">CPC</label>
              <p className="text-xl font-bold dark:text-white">{currencyFormatter.format(campaign.cpc)}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <label className="block text-sm font-medium text-muted-foreground mb-1">CPM</label>
              <p className="text-xl font-bold dark:text-white">{currencyFormatter.format(campaign.cpm)}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <label className="block text-sm font-medium text-muted-foreground mb-1">ROAS</label>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{campaign.roas.toFixed(2)}x</p>
            </div>
          </div>

          {/* Campaign Images */}
          {campaign.images && campaign.images.length > 0 && (
            <div className="pt-6 border-t dark:border-border">
              <h4 className="text-lg font-semibold mb-4 dark:text-white">Campaign Images</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {campaign.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Campaign image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-border dark:border-border shadow-sm hover:shadow-md transition-shadow"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

