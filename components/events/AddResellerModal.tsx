"use client"

import { useState, useEffect } from "react"
import { UserPlus, X, Loader2, Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AddResellerModalProps {
  isOpen: boolean
  onClose: () => void
  eventName: string
  eventId?: string
  eventSlug?: string
  mode?: "vendor" | "public"
  onSuccess?: () => void
}

interface ResellerResult {
  name: string
  email: string
  referralCode: string
  resellerLink: string
  status: string
}

export default function AddResellerModal({
  isOpen,
  onClose,
  eventId,
  eventSlug,
  eventName,
  mode = "vendor",
  onSuccess,
}: AddResellerModalProps) {
  const isPublic = mode === "public"
  const title = isPublic ? "Become a Reseller" : "Add Reseller"
  const submitLabel = isPublic ? "Submit Application" : "Add Reseller"
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<ResellerResult | null>(null)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  // Reset form whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setName("")
      setEmail("")
      setError("")
      setResult(null)
      setApplicationSubmitted(false)
      setCopied(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError("Please fill in both name and email.")
      return
    }

    if (isPublic) {
      if (!eventSlug) {
        setError("Event slug is required.")
        return
      }
      try {
        setSubmitting(true)
        setError("")
        const res = await fetch(`/api/events/resellers/requests/${eventSlug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim() }),
        })
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.message?.message || json.error || "Failed to submit application.")
        }
        setApplicationSubmitted(true)
      } catch (err: any) {
        console.log(err)
        setError(err.message || "Failed to submit application.")
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (!eventId) {
      setError("Event ID is required.")
      return
    }

    try {
      setSubmitting(true)
      setError("")
      const res = await fetch(`/api/events/${eventId}/resellers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || json.error || "Failed to add reseller.")
      setResult(json.data.reseller)
      onSuccess?.()
    } catch (err: any) {
      setError(err?.message || "Failed to add reseller.")
    } finally {
      setSubmitting(false)
    }
  }

  const copyLink = async () => {
    if (!result?.resellerLink) return
    await navigator.clipboard.writeText(result.resellerLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card text-foreground shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-base font-semibold">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {applicationSubmitted ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center dark:border-green-900 dark:bg-green-950/40">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Application submitted!</p>
                <p className="mt-2 text-sm text-green-600 dark:text-green-500">
                  Thanks, {name}. We&apos;ll review your application and get back to you at{" "}
                  <span className="font-medium">{email}</span>.
                </p>
              </div>
              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </div>
          ) : result ? (
            /* Success state */
            <div className="space-y-4">
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center dark:bg-green-950/40 dark:border-green-900">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Reseller added successfully!</p>
                <p className="mt-1 text-xs text-green-600 dark:text-green-500">
                  {result.name} · <span className="font-mono">{result.referralCode}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reseller Link</p>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
                  <span className="flex-1 truncate font-mono text-xs text-foreground">
                    {result.resellerLink}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={copyLink}
                      title="Copy link"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <a
                      href={result.resellerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open link"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
                {copied && (
                  <p className="text-xs text-green-600">Link copied!</p>
                )}
              </div>

              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </div>
          ) : (
            /* Form state */
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {isPublic ? (
                  <>
                    Sign up to sell tickets for{" "}
                    <span className="font-medium text-foreground">{eventName}</span> and
                    earn on every sale.
                  </>
                ) : (
                  <>
                    Add a reseller to{" "}
                    <span className="font-medium text-foreground">{eventName}</span>. They
                    will be able to sell tickets on your behalf.
                  </>
                )}
              </p>

              <div className="space-y-1.5">
                <label htmlFor={`${mode}-reseller-name`} className="block text-sm font-medium text-foreground">
                  Full Name
                </label>
                <input
                  id={`${mode}-reseller-name`}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  disabled={submitting}
                  className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor={`${mode}-reseller-email`} className="block text-sm font-medium text-foreground">
                  Email Address
                </label>
                <input
                  id={`${mode}-reseller-email`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  disabled={submitting}
                  className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isPublic ? "Submitting…" : "Adding…"}
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      {submitLabel}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
