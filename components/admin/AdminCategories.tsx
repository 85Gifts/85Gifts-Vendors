"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { adminApi } from "@/lib/adminApi"
import type { Category, CategoryType } from "@/app/types/category"

const CATEGORY_TYPES: CategoryType[] = ["event", "product"]

export default function AdminCategories() {
  const { toast } = useToast()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterType, setFilterType] = useState<CategoryType | "all">("all")

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<CategoryType>("event")

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const typeFilter = filterType === "all" ? undefined : filterType
      const data = await adminApi.listCategories(typeFilter)
      setCategories(data)
    } catch (err: any) {
      setError(err?.message || "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }, [filterType])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openCreate = () => {
    setEditing(null)
    setName("")
    setType(filterType === "all" ? "event" : filterType)
    setShowCreate(true)
  }

  const openEdit = (category: Category) => {
    setShowCreate(false)
    setEditing(category)
    setName(category.name)
    setType(category.type)
  }

  const closeForm = () => {
    setShowCreate(false)
    setEditing(null)
    setName("")
    setType("event")
  }

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast({ title: "Name required", description: "Enter a category name.", variant: "destructive" })
      return
    }
    if (trimmed.length > 100) {
      toast({ title: "Name too long", description: "Use 100 characters or fewer.", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      if (editing) {
        const updated = await adminApi.updateCategory(editing._id, {
          name: trimmed,
          type,
        })
        closeForm()
        await fetchCategories()
        toast({
          title: "Category updated",
          description: `${updated.name} (${updated.type}) was saved.`,
          variant: "success",
        })
      } else {
        const created = await adminApi.createCategory({ name: trimmed, type })
        closeForm()
        await fetchCategories()
        toast({
          title: "Category created",
          description: `${created.name} is now available as a ${created.type} category.`,
          variant: "success",
        })
      }
    } catch (err: any) {
      toast({
        title: editing ? "Update failed" : "Create failed",
        description: err?.message || `Failed to ${editing ? "update" : "create"} category`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return
    setDeleting(true)
    try {
      await adminApi.deleteCategory(categoryToDelete._id)
      setCategoryToDelete(null)
      await fetchCategories()
      toast({
        title: "Category deleted",
        description: `"${categoryToDelete.name}" was removed. Existing events/products keep their stored category name.`,
        variant: "success",
      })
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err?.message || "Failed to delete category",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Categories created here appear in vendor event and product pickers.
        </p>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={(value) => setFilterType(value as CategoryType | "all")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {CATEGORY_TYPES.map((categoryType) => (
                <SelectItem key={categoryType} value={categoryType} className="capitalize">
                  {categoryType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>
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
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  {filterType === "all"
                    ? "No categories yet. Create one for events or products."
                    : `No ${filterType} categories yet.`}
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category._id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge className="capitalize bg-muted text-foreground">{category.type}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {category.createdAt
                      ? new Date(category.createdAt).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" title="Edit" onClick={() => openEdit(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Delete"
                        onClick={() => setCategoryToDelete(category)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={showCreate || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) closeForm()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the name and/or type. Existing events and products keep their stored category string."
                : "Send only a name and type. The admin who creates it is stored on the server."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Music"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">{name.trim().length}/100</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as CategoryType)}>
                <SelectTrigger id="category-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_TYPES.map((categoryType) => (
                    <SelectItem key={categoryType} value={categoryType} className="capitalize">
                      {categoryType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving
                ? editing
                  ? "Saving..."
                  : "Creating..."
                : editing
                  ? "Update category"
                  : "Create category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open && !deleting) setCategoryToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes &ldquo;{categoryToDelete?.name}&rdquo;. Events and products that
              already used this category name are not updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              variant="destructive"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
