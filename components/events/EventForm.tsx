"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Ticket, Users, ArrowLeft, Save, Plus, Trash2, Image, Tag, ArrowRight, ChevronLeft } from "lucide-react"
import { useToast } from "../ui/use-toast"
import { config } from "../../config"
import Cookies from "js-cookie"

type EventFormValues = {
  title: string
  category: string
  date: string
  time: string
  location: string
  price: string
  capacity: string
  emoji: string
  description: string
  organiserName: string
  endDate: string
  endTime: string
  salesStartDate: string
  salesStartTime: string
  salesEndDate: string
  salesEndTime: string
  venue: string
  address: string
  city: string
  state: string
  country: string
  coverImageUrl: string
  tags: string
}

type Tier = {
  name: string
  description: string
  price: string
  capacity: string
  type: "general" | "vip" | "vvip"
}

const validCategories = [
  "music",
  "sports",
  "arts",
  "business",
  "technology",
  "food",
  "health",
  "education",
  "charity",
  "comedy",
  "theater",
  "festival",
  "conference",
  "workshop",
  "networking",
  "other",
]

type EventFormProps = {
  mode?: "create" | "edit"
  eventId?: string
  initialValues?: Partial<EventFormValues>
  initialTiers?: Tier[]
}

const defaultValues: EventFormValues = {
  title: "",
  category: "",
  date: "",
  time: "",
  location: "",
  price: "",
  capacity: "",
  emoji: "",
  description: "",
  organiserName: "",
  endDate: "",
  endTime: "",
  salesStartDate: "",
  salesStartTime: "",
  salesEndDate: "",
  salesEndTime: "",
  venue: "",
  address: "",
  city: "",
  state: "",
  country: "",
  coverImageUrl: "",
  tags: "",
}

const steps = [
  { number: 1, title: "Basic Info", description: "Event details and timing" },
  { number: 2, title: "Location", description: "Where it happens" },
  { number: 3, title: "Pricing", description: "Tickets and capacity" },
  { number: 4, title: "Sales Period", description: "When tickets go on sale" },
  { number: 5, title: "Details & Tiers", description: "Branding and ticket types" },
]

export default function EventForm(props: EventFormProps = {}): React.ReactElement {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Initialize state with props if available, otherwise use defaults
  const [values, setValues] = useState<EventFormValues>(() => {
    if (props.initialValues && Object.keys(props.initialValues).length > 0) {
      return { ...defaultValues, ...props.initialValues }
    }
    return defaultValues
  })
  
  const [tiers, setTiers] = useState<Tier[]>(() => {
    if (props.initialTiers && props.initialTiers.length > 0) {
      return props.initialTiers
    }
    return [{ name: "", description: "", price: "", capacity: "", type: "general" }]
  })
  
  const [submitting, setSubmitting] = useState(false)

  // Update values when props change (for edit mode when data loads asynchronously)
  useEffect(() => {
    if (props.initialValues && Object.keys(props.initialValues).length > 0) {
      setValues((prev) => {
        // Only update if values actually changed
        const hasChanges = Object.keys(props.initialValues!).some(
          key => prev[key as keyof EventFormValues] !== props.initialValues![key as keyof EventFormValues]
        )
        if (hasChanges) {
          return { ...prev, ...props.initialValues }
        }
        return prev
      })
    }
  }, [props.initialValues])

  useEffect(() => {
    if (props.initialTiers && props.initialTiers.length > 0) {
      setTiers(props.initialTiers)
    }
  }, [props.initialTiers])

  // Validation for each step
  const stepValidation = useMemo(() => {
    return {
      1: Boolean(values.title && values.category && values.date && values.time && values.organiserName && values.endDate && values.endTime),
      2: Boolean(values.location && values.venue && values.city && values.country),
      3: Boolean(values.price !== "" && values.capacity !== ""),
      4: Boolean(values.salesStartDate && values.salesEndDate),
      5: Boolean(tiers.length > 0 && tiers.every((t) => t.name && t.price && t.capacity && t.type)),
    }
  }, [values, tiers])

  const isValid = useMemo(() => {
    return Object.values(stepValidation).every(valid => valid)
  }, [stepValidation])

  const handleChange =
    (field: keyof EventFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const addTier = () => {
    setTiers((prev) => [...prev, { name: "", description: "", price: "", capacity: "", type: "general" }])
  }

  const updateTier = (index: number, field: keyof Tier, value: string) => {
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)))
  }

  const removeTier = (index: number) => {
    setTiers((prev) => prev.filter((_, i) => i !== index))
  }

  const toIso = (d: string, t: string) => {
    if (!d || !t) return ""
    const iso = new Date(`${d}T${t}`).toISOString()
    return iso
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    try {
      setSubmitting(true)

      const payload = {
        name: values.title,
        description: values.description,
        organiserName: values.organiserName,
        startAt: toIso(values.date, values.time),
        endAt: toIso(values.endDate, values.endTime),
        salesPeriod: {
          start: toIso(values.salesStartDate, values.salesStartTime || "00:00"),
          end: toIso(values.salesEndDate, values.salesEndTime || "23:59"),
        },
        location: {
          venue: values.venue,
          address: values.address,
          city: values.city,
          state: values.state,
          country: values.country,
        },
        category: values.category,
        tags: values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        coverImageUrl: values.coverImageUrl || undefined,
        tiers: tiers.map((t) => ({
          name: t.name,
          description: t.description,
          price: Number(t.price || 0),
          capacity: Number(t.capacity || 0),
          type: t.type,
        })),
      }

      const isEdit = props.mode === "edit" && props.eventId
      const url = isEdit
        ? `/api/events/${props.eventId}`
        : `/api/events`
      const method = isEdit ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      })
      if (!res.ok) {
        const errorData: any = await res.json().catch(() => ({}))
        throw new Error(
          errorData?.error?.message || 
          errorData?.message || 
          errorData?.error || 
          `Failed to ${isEdit ? "update" : "create"} event`
        )
      }
      toast({
        title: isEdit ? "Event updated" : "Event scheduled",
        description: isEdit
          ? `${values.title} has been updated successfully.`
          : `${values.title} has been created successfully.`,
        variant: "success",
      })
      router.push("/dashboard")
    } catch (err: any) {
      toast({
        title: "Failed to schedule event",
        description: err?.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-rose-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b dark:border-gray-800">
            <h1 className="text-xl sm:text-2xl font-bold dark:text-white">
              {props.mode === "edit" ? "Edit Event" : "Schedule New Event"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {props.mode === "edit" 
                ? "Update your event details below." 
                : "Create an experience that matches your brand's vibe."}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                        currentStep === step.number
                          ? "bg-blue-600 text-white"
                          : currentStep > step.number
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {step.number}
                    </div>
                    <div className="mt-2 text-center hidden sm:block">
                      <p className={`text-xs font-medium ${currentStep === step.number ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step.number ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Event title</label>
                    <input
                      type="text"
                      value={values.title}
                      onChange={handleChange("title")}
                      placeholder="e.g., Holiday Pop-Up Experience"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Keep it short and descriptive.</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Organiser name</label>
                    <input
                      type="text"
                      value={values.organiserName}
                      onChange={handleChange("organiserName")}
                      placeholder="e.g., Naija Events Pro"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Experience type</label>
                    <select
                      value={values.category}
                      onChange={handleChange("category")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      {validCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Event Start</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Date</label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            value={values.date}
                            onChange={handleChange("date")}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Time</label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="time"
                            value={values.time}
                            onChange={handleChange("time")}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Event End</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Date</label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            value={values.endDate}
                            onChange={handleChange("endDate")}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Time</label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="time"
                            value={values.endTime}
                            onChange={handleChange("endTime")}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Location Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Location</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={values.location}
                        onChange={handleChange("location")}
                        placeholder="Physical address or virtual link"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Venue</label>
                    <input
                      type="text"
                      value={values.venue}
                      onChange={handleChange("venue")}
                      placeholder="e.g., Tafawa Balewa Square"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Address</label>
                    <input
                      type="text"
                      value={values.address}
                      onChange={handleChange("address")}
                      placeholder="Street address"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">City</label>
                    <input
                      type="text"
                      value={values.city}
                      onChange={handleChange("city")}
                      placeholder="e.g., Lagos"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">State</label>
                    <input
                      type="text"
                      value={values.state}
                      onChange={handleChange("state")}
                      placeholder="e.g., Lagos"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Country</label>
                    <input
                      type="text"
                      value={values.country}
                      onChange={handleChange("country")}
                      placeholder="e.g., Nigeria"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tickets & Capacity</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Ticket price</label>
                    <div className="relative">
                      <Ticket className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min={0}
                        value={values.price}
                        onChange={handleChange("price")}
                        placeholder="0 for free"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Set 0 to make it a free RSVP.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Capacity</label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min={0}
                        value={values.capacity}
                        onChange={handleChange("capacity")}
                        placeholder="Expected max attendees"
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Step 4: Sales Period */}
            {currentStep === 4 && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Period</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Sales Start</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Date</label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            value={values.salesStartDate}
                            onChange={handleChange("salesStartDate")}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Time (optional)</label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="time"
                            value={values.salesStartTime}
                            onChange={handleChange("salesStartTime")}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Sales End</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Date</label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            value={values.salesEndDate}
                            onChange={handleChange("salesEndDate")}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Time (optional)</label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="time"
                            value={values.salesEndTime}
                            onChange={handleChange("salesEndTime")}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Step 5: Details & Tiers */}
            {currentStep === 5 && (
              <>
                <section className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Branding & Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Event icon / emoji</label>
                      <input
                        type="text"
                        maxLength={2}
                        value={values.emoji}
                        onChange={handleChange("emoji")}
                        placeholder="e.g., 🎄"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Cover image URL</label>
                      <div className="relative">
                        <Image className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={values.coverImageUrl}
                          onChange={handleChange("coverImageUrl")}
                          placeholder="https://..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tags</label>
                      <div className="relative">
                        <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={values.tags}
                          onChange={handleChange("tags")}
                          placeholder="Comma-separated, e.g., afrobeat, concert, lagos"
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use commas to add multiple tags.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                    <textarea
                      rows={4}
                      value={values.description}
                      onChange={handleChange("description")}
                      placeholder="What should attendees expect?"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Highlight the vibe, agenda, speakers, and special perks.</p>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Tiers</h2>
                    <button
                      type="button"
                      onClick={addTier}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add tier
                    </button>
                  </div>
                  <div className="space-y-4">
                    {tiers.map((tier, index) => (
                      <div key={index} className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                            <input
                              type="text"
                              value={tier.name}
                              onChange={(e) => updateTier(index, "name", e.target.value)}
                              placeholder="Regular, VIP, VVIP"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Type</label>
                            <select
                              value={tier.type}
                              onChange={(e) => updateTier(index, "type", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="general">general</option>
                              <option value="vip">vip</option>
                              <option value="vvip">vvip</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Price</label>
                            <input
                              type="number"
                              min={0}
                              value={tier.price}
                              onChange={(e) => updateTier(index, "price", e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Capacity</label>
                            <input
                              type="number"
                              min={0}
                              value={tier.capacity}
                              onChange={(e) => updateTier(index, "capacity", e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                            <input
                              type="text"
                              value={tier.description}
                              onChange={(e) => updateTier(index, "description", e.target.value)}
                              placeholder="Short summary of this tier"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        {tiers.length > 1 && (
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeTier(index)}
                              className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove tier
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t dark:border-gray-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}
              </div>
              <div className="flex gap-3 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!stepValidation[currentStep as keyof typeof stepValidation]}
                    className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-white ${
                      !stepValidation[currentStep as keyof typeof stepValidation]
                        ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!isValid || submitting}
                    className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-white ${
                      !isValid || submitting ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? "Saving..." : "Save Event"}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}