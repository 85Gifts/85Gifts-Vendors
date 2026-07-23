"use client"

import React, { useState, ChangeEvent } from "react"
import { X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadMultipleImagesToCloudinary, validateImageFile } from "@/lib/cloudinary"

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
  images?: string[]
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
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState<boolean>(false)
  const [imageError, setImageError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    if (!isSubmitting && !uploadingImages) {
      setFormData({
        name: "",
        type: "search",
        budgetAmount: "",
        budgetCurrency: "USD",
        startDate: "",
        endDate: "",
      })
      setImageFiles([])
      setImagePreviews([])
      setImageError("")
      onClose()
    }
  }

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)
    
    // Check total images (existing + new) - max 3 images
    const totalImages = imagePreviews.length + filesArray.length
    if (totalImages > 3) {
      setImageError('Maximum 3 images allowed')
      return
    }

    // Validate each file
    for (const file of filesArray) {
      const validationError = validateImageFile(file, 10)
      if (validationError) {
        setImageError(validationError)
        return
      }
    }

    // Create previews for new files
    const newPreviews: string[] = []
    filesArray.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === filesArray.length) {
          setImagePreviews([...imagePreviews, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })

    setImageFiles([...imageFiles, ...filesArray])
    setImageError("")
  }

  const removeImage = (index: number) => {
    const newPreviews = [...imagePreviews]
    newPreviews.splice(index, 1)
    setImagePreviews(newPreviews)

    const newFiles = [...imageFiles]
    newFiles.splice(index, 1)
    setImageFiles(newFiles)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadingImages(true)

    try {
      let imageUrls: string[] = []

      // Upload images to Cloudinary if any are selected
      if (imageFiles.length > 0) {
        try {
          imageUrls = await uploadMultipleImagesToCloudinary(imageFiles)
        } catch (uploadError) {
          setImageError(uploadError instanceof Error ? uploadError.message : 'Failed to upload images')
          setIsSubmitting(false)
          setUploadingImages(false)
          return
        }
      }

      setUploadingImages(false)

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
        images: imageUrls.length > 0 ? imageUrls : undefined,
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
        setImageFiles([])
        setImagePreviews([])
        setImageError("")
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
        setImageFiles([])
        setImagePreviews([])
        setImageError("")
        onClose()
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
      setUploadingImages(false)
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
      <div className="bg-card rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b dark:border-border">
          <h3 className="text-lg font-semibold dark:text-white">Create New Campaign</h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Summer Sale Campaign 2024"
              className="w-full px-4 py-2 border border-border dark:bg-muted dark:text-white rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Campaign Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-border dark:bg-muted dark:text-white rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
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
              <label className="block text-sm font-medium text-foreground mb-2">
                Budget Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.budgetAmount}
                onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                placeholder="1000"
                className="w-full px-4 py-2 border border-border dark:bg-muted dark:text-white rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Currency *
              </label>
              <select
                value={formData.budgetCurrency}
                onChange={(e) => setFormData({ ...formData, budgetCurrency: e.target.value })}
                className="w-full px-4 py-2 border border-border dark:bg-muted dark:text-white rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
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
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-border dark:bg-muted dark:text-white rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                className="w-full px-4 py-2 border border-border dark:bg-muted dark:text-white rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Campaign Images */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Campaign Images (Max 3)
            </label>
            
            {/* File input for uploading images */}
            <div className="mb-3">
              <label
                htmlFor="campaign-image-upload"
                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <Upload className="w-5 h-5 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploadingImages ? 'Uploading images...' : 'Click to upload images'}
                </span>
                <input
                  id="campaign-image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploadingImages || isSubmitting || imagePreviews.length >= 3}
                />
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Supported formats: JPG, PNG, GIF, WebP. Max 10MB per image.
              </p>
              {imageError && (
                <p className="text-xs text-red-500 mt-1">{imageError}</p>
              )}
            </div>

            {/* Image previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Campaign preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-border dark:border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-xs"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={uploadingImages || isSubmitting}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploadingImages}
            >
              {uploadingImages ? "Uploading images..." : isSubmitting ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

