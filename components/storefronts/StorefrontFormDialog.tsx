"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { storefrontApi } from "@/lib/storefrontApi"
import type {
  Storefront,
  StorefrontLayout,
} from "@/app/types/storefront"

interface StorefrontFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storefront?: Storefront | null
  onSaved: (storefront: Storefront) => void
}

interface FormState {
  name: string
  description: string
  slug: string
  banner: string
  theme: string
  layout: StorefrontLayout
}

type FormErrors = Partial<Record<keyof FormState, string>>

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  slug: "",
  banner: "",
  theme: "",
  layout: "grid",
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function StorefrontFormDialog({
  open,
  onOpenChange,
  storefront,
  onSaved,
}: StorefrontFormDialogProps) {
  const { toast } = useToast()
  const isEdit = Boolean(storefront)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return

    setForm(
      storefront
        ? {
            name: storefront.name,
            description: storefront.description ?? "",
            slug: storefront.slug,
            banner: storefront.displaySettings?.banner ?? "",
            theme: storefront.displaySettings?.theme ?? "",
            layout: storefront.displaySettings?.layout ?? "grid",
          }
        : EMPTY_FORM
    )
    setErrors({})
    setFormError("")
  }, [open, storefront])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const validate = (): boolean => {
    const next: FormErrors = {}
    const name = form.name.trim()
    const description = form.description.trim()
    const slug = form.slug.trim()
    const banner = form.banner.trim()
    const theme = form.theme.trim()

    if (!name) next.name = "A storefront name is required."
    else if (name.length > 200) next.name = "Keep the name under 200 characters."

    if (description.length > 1000) {
      next.description = "Keep the description under 1,000 characters."
    }

    if (!isEdit && slug) {
      if (slug.length > 200) {
        next.slug = "Keep the slug under 200 characters."
      } else if (!SLUG_PATTERN.test(slug)) {
        next.slug = "Use lowercase letters, numbers and single hyphens only."
      }
    }

    if (banner && !/^https?:\/\//i.test(banner)) {
      next.banner = "Enter a full http:// or https:// image URL."
    }

    if (theme.length > 100) {
      next.theme = "Keep the theme under 100 characters."
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")
    if (!validate()) return

    setSaving(true)
    try {
      const name = form.name.trim()
      const description = form.description.trim()
      const payload = {
        name,
        description,
        displaySettings: {
          banner: form.banner.trim(),
          theme: form.theme.trim(),
          layout: form.layout,
        },
      }

      let saved = storefront
        ? await storefrontApi.update(storefront._id, payload)
        : await storefrontApi.create({
            ...payload,
            slug: form.slug.trim() || undefined,
          })

      if (!saved && storefront) {
        saved = {
          ...storefront,
          name,
          description,
          displaySettings: payload.displaySettings,
        }
      }

      if (!saved) {
        throw new Error(
          "The storefront was saved but the server response was incomplete. Refresh the page."
        )
      }

      toast({
        title: isEdit ? "Storefront updated" : "Storefront created",
        description: isEdit
          ? `${saved.name} has been updated.`
          : `${saved.name} is ready to add products.`,
        variant: "success",
      })
      onSaved(saved)
      onOpenChange(false)
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save the storefront."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto p-4 sm:max-w-2xl sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit storefront" : "Create a storefront"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update how this storefront appears. The public link slug cannot be changed."
              : "Storefronts group products under a shareable link. You can request approval to publish after adding products."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="storefront-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="storefront-name"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              maxLength={200}
              placeholder="e.g. Lagos Tech Summit Store"
              aria-invalid={Boolean(errors.name)}
              autoFocus
            />
            <div className="flex items-center justify-between gap-2">
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-muted-foreground">
                {form.name.trim().length}/200
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storefront-description">Description</Label>
            <Textarea
              id="storefront-description"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="A short introduction shown on the storefront."
              aria-invalid={Boolean(errors.description)}
            />
            <div className="flex items-center justify-between gap-2">
              {errors.description ? (
                <p className="text-xs text-destructive">{errors.description}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-muted-foreground">
                {form.description.trim().length}/1,000
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storefront-slug">Slug</Label>
            <Input
              id="storefront-slug"
              value={form.slug}
              onChange={(event) => update("slug", event.target.value)}
              disabled={isEdit}
              placeholder="auto-generated-from-name"
              aria-invalid={Boolean(errors.slug)}
            />
            <p className="text-xs text-muted-foreground">
              {isEdit
                ? "The slug is permanent once the storefront is created."
                : "Optional. Leave blank to generate it from the name. Lowercase letters, numbers and hyphens only."}
            </p>
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="storefront-banner">Banner image URL</Label>
              <Input
                id="storefront-banner"
                value={form.banner}
                onChange={(event) => update("banner", event.target.value)}
                placeholder="https://..."
                aria-invalid={Boolean(errors.banner)}
              />
              {errors.banner && (
                <p className="text-xs text-destructive">{errors.banner}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="storefront-theme">Theme</Label>
              <Input
                id="storefront-theme"
                value={form.theme}
                onChange={(event) => update("theme", event.target.value)}
                maxLength={100}
                placeholder="e.g. warm"
                aria-invalid={Boolean(errors.theme)}
              />
              {errors.theme && (
                <p className="text-xs text-destructive">{errors.theme}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="storefront-layout">Product layout</Label>
            <Select
              value={form.layout}
              onValueChange={(value) =>
                update("layout", value as StorefrontLayout)
              }
            >
              <SelectTrigger id="storefront-layout" className="w-full sm:w-56">
                <SelectValue placeholder="Choose a layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {formError}
            </div>
          )}

          <DialogFooter className="flex-row flex-wrap justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create storefront"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
