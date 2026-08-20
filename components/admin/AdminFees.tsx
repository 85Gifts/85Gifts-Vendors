"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, Pencil, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { adminApi } from "@/lib/adminApi"
import { FeeConfig, FeeType } from "@/app/types/admin"

const SERVICE_TYPES = [
  "reminder_email",
  "ticket_sale",
  "event_publish",
  "event_creation",
  "ticket_export",
  "bulk_sms",
  "withdrawal",
]

interface FeeFormState {
  serviceType: string
  feeType: FeeType
  feeValue: string
  minFee: string
  maxFee: string
  currency: string
  description: string
}

const emptyForm: FeeFormState = {
  serviceType: "",
  feeType: "fixed",
  feeValue: "",
  minFee: "",
  maxFee: "",
  currency: "NGN",
  description: "",
}

export default function AdminFees() {
  const { toast } = useToast()

  const [configs, setConfigs] = useState<FeeConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<FeeConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FeeFormState>(emptyForm)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchConfigs = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await adminApi.feeConfigs()
      setConfigs(data)
    } catch (err: any) {
      setError(err?.message || "Failed to load fee configurations")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  const openCreate = () => {
    setForm(emptyForm)
    setShowCreate(true)
  }

  const openEdit = (config: FeeConfig) => {
    setForm({
      serviceType: config.serviceType,
      feeType: config.feeType,
      feeValue: String(config.feeValue ?? ""),
      minFee: config.minFee !== undefined ? String(config.minFee) : "",
      maxFee: config.maxFee !== undefined ? String(config.maxFee) : "",
      currency: config.currency || "NGN",
      description: config.description || "",
    })
    setEditing(config)
  }

  const validate = (): string | null => {
    if (!form.serviceType) return "Please select a service type"
    if (form.feeType === "percentage") {
      const value = Number(form.feeValue)
      if (!value || value <= 0 || value > 100) {
        return "Percentage must be between 1 and 100"
      }
    } else {
      const value = Number(form.feeValue)
      if (!value || value < 0) return "Fixed fee must be a non-negative number"
    }
    const minFee = form.minFee === "" ? undefined : Number(form.minFee)
    const maxFee = form.maxFee === "" ? undefined : Number(form.maxFee)
    if (minFee !== undefined && minFee < 0) return "Minimum fee cannot be negative"
    if (maxFee !== undefined && maxFee < 0) return "Maximum fee cannot be negative"
    if (minFee !== undefined && maxFee !== undefined && maxFee < minFee) {
      return "Maximum fee must be greater than or equal to minimum fee"
    }
    if (form.description.length > 300) return "Description must be 300 characters or fewer"
    return null
  }

  const handleSave = async () => {
    const validationError = validate()
    if (validationError) {
      toast({ title: "Validation failed", description: validationError, variant: "destructive" })
      return
    }

    setSaving(true)
    const payload: Record<string, unknown> = {
      serviceType: form.serviceType,
      feeType: form.feeType,
      feeValue: Number(form.feeValue),
      currency: form.currency || "NGN",
      description: form.description,
      minFee: form.minFee === "" ? undefined : Number(form.minFee),
      maxFee: form.maxFee === "" ? undefined : Number(form.maxFee),
    }

    try {
      if (editing) {
        const updated = await adminApi.updateFeeConfig(editing.serviceType, payload)
        setConfigs((prev) => prev.map((c) => (c.serviceType === updated.serviceType ? updated : c)))
        toast({ title: "Fee config updated", description: "Changes apply to future charges only.", variant: "success" })
      } else {
        const created = await adminApi.createFeeConfig(payload)
        setConfigs((prev) => [...prev, created])
        toast({ title: "Fee config created", description: "Fee configuration is now active.", variant: "success" })
      }
      setShowCreate(false)
      setEditing(null)
    } catch (err: any) {
      toast({ title: "Save failed", description: err?.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (config: FeeConfig) => {
    setTogglingId(config._id)
    try {
      const updated = await adminApi.toggleFeeConfig(config.serviceType, !config.isActive)
      setConfigs((prev) => prev.map((c) => (c._id === updated._id ? updated : c)))
      toast({
        title: updated.isActive ? "Fee config activated" : "Fee config deactivated",
        description: `${config.serviceType.replace(/_/g, " ")} charges ${updated.isActive ? "resumed" : "paused"}.`,
        variant: updated.isActive ? "success" : "default",
      })
    } catch (err: any) {
      toast({ title: "Toggle failed", description: err?.message, variant: "destructive" })
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Platform fees charged to vendors, one configuration per service type.
        </p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Fee Config
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Type</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="hidden md:table-cell">Caps</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No fee configurations yet. Create one to start charging vendors.
                </TableCell>
              </TableRow>
            ) : (
              configs.map((config) => (
                <TableRow key={config._id}>
                  <TableCell className="font-medium capitalize">{config.serviceType.replace(/_/g, " ")}</TableCell>
                  <TableCell className="capitalize">{config.feeType}</TableCell>
                  <TableCell>
                    {config.feeType === "percentage"
                      ? `${config.feeValue}%`
                      : new Intl.NumberFormat("en-NG", { style: "currency", currency: config.currency || "NGN" }).format(config.feeValue)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {config.minFee !== undefined || config.maxFee !== undefined
                      ? `Min ${config.minFee ?? "—"} · Max ${config.maxFee ?? "—"}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={config.isActive ? "text-green-600 bg-green-100" : "text-muted-foreground bg-muted"}>
                      {config.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" title="Edit" onClick={() => openEdit(config)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title={config.isActive ? "Deactivate" : "Activate"}
                        disabled={togglingId === config._id}
                        onClick={() => handleToggle(config)}
                      >
                        <Power className={`h-4 w-4 ${config.isActive ? "text-destructive" : "text-green-600"}`} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showCreate || Boolean(editing)} onOpenChange={(open) => {
        if (!open) {
          setShowCreate(false)
          setEditing(null)
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.serviceType.replace(/_/g, " ")} config` : "New fee configuration"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Changes apply to future charges only. Past records keep their original snapshot."
                : "Configure how this service is charged to vendors."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fee-service-type">Service type</Label>
              <Select
                value={form.serviceType}
                onValueChange={(v) => setForm((f) => ({ ...f, serviceType: v }))}
                disabled={Boolean(editing)}
              >
                <SelectTrigger id="fee-service-type" className="w-full">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fee-type">Fee type</Label>
                <Select value={form.feeType} onValueChange={(v) => setForm((f) => ({ ...f, feeType: v as FeeType }))}>
                  <SelectTrigger id="fee-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed (₦)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee-value">
                  {form.feeType === "percentage" ? "Fee % (1–100)" : "Fee amount (₦)"}
                </Label>
                <Input
                  id="fee-value"
                  type="number"
                  inputMode="decimal"
                  value={form.feeValue}
                  onChange={(e) => setForm((f) => ({ ...f, feeValue: e.target.value }))}
                  placeholder={form.feeType === "percentage" ? "5" : "2"}
                />
              </div>
            </div>

            {form.feeType === "percentage" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fee-min">Min fee (₦, optional)</Label>
                  <Input
                    id="fee-min"
                    type="number"
                    inputMode="decimal"
                    value={form.minFee}
                    onChange={(e) => setForm((f) => ({ ...f, minFee: e.target.value }))}
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee-max">Max fee (₦, optional)</Label>
                  <Input
                    id="fee-max"
                    type="number"
                    inputMode="decimal"
                    value={form.maxFee}
                    onChange={(e) => setForm((f) => ({ ...f, maxFee: e.target.value }))}
                    placeholder="5000"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fee-description">Description</Label>
              <textarea
                id="fee-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. ₦2 per reminder email sent by vendor"
                rows={3}
                maxLength={300}
                className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-auto w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">{form.description.length}/300</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditing(null) }} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editing ? "Update config" : "Create config"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}