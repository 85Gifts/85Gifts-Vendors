"use client"

import React, { useState } from "react"
import { X } from "lucide-react"

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: CampaignData) => Promise<void> | void
}

export interface CampaignData {
  name: string
  type: string
  budgetAmount: number
  budgetCurrency: string
  startDate: string
  endDate: string
}

export default function CreateCampaignModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateCampaignModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "search",
    budgetAmount: "",
    budgetCurrency: "USD",
    startDate: "",
    endDate: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: "",
        type: "search",
        budgetAmount: "",
        budgetCurrency: "USD",
        startDate: "",
        endDate: "",
      })
      onClose()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Format dates to ISO format
      const startDateISO = formData.startDate
        ? new Date(formData.startDate + "T00:00:00.000Z").toISOString()
        : ""
      const endDateISO = formData.endDate
        ? new Date(formData.endDate + "T23:59:59.999Z").toISOString()
        : ""

      const campaignData: CampaignData = {
        name: formData.name,
        type: formData.type,
        budgetAmount: parseFloat(formData.budgetAmount),
        budgetCurrency: formData.budgetCurrency,
        startDate: startDateISO,
        endDate: endDateISO,
      }

      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(campaignData)
        // Reset form and close modal only on success
        setFormData({
          name: "",
          type: "search",
          budgetAmount: "",
          budgetCurrency: "USD",
          startDate: "",
          endDate: "",
        })
        onClose()
      } else {
        // Default behavior: just log the data
        console.log("Campaign Data:", campaignData)
        alert("Campaign created successfully!")
        // Reset form and close modal
        setFormData({
          name: "",
          type: "search",
          budgetAmount: "",
          budgetCurrency: "USD",
          startDate: "",
          endDate: "",
        })
        onClose()
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
      // If onSubmit is provided, let the parent handle the error notification
      // Otherwise show default alert
      if (!onSubmit) {
        alert("Failed to create campaign. Please try again.")
      }
      // Re-throw error so parent can handle it if needed
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-800">
          <h3 className="text-lg font-semibold dark:text-white">Create New Campaign</h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Summer Sale Campaign 2024"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Campaign Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="search">Search</option>
              <option value="display">Display</option>
              <option value="social">Social</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Budget Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.budgetAmount}
                onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                placeholder="1000"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency *
              </label>
              <select
                value={formData.budgetCurrency}
                onChange={(e) => setFormData({ ...formData, budgetCurrency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="NGN">NGN</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

