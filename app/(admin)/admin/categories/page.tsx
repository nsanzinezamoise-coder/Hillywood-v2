"use client"

import React from "react"

import { useState } from "react"
import useSWR from "swr"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, FolderOpen, Eye } from "lucide-react"

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  movieCount?: number
  seriesCount?: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminCategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null)

  const { data, isLoading, mutate } = useSWR<{ categories: Category[] }>(
    "/api/admin/categories",
    fetcher
  )

  const resetForm = () => {
    setFormData({ name: "", description: "" })
    setEditingCategory(null)
  }

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || "",
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory._id}`
        : "/api/admin/categories"
      const method = editingCategory ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        mutate()
        setIsDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Failed to save category:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      mutate()
    } catch (error) {
      console.error("Failed to delete category:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">Manage movie categories and genres</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "New Category"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Drama, Comedy"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingCategory ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Movies</TableHead>
              <TableHead>Series</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
              ))
            ) : data?.categories?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FolderOpen className="h-8 w-8" />
                    <p>No categories yet</p>
                    <Button size="sm" onClick={() => handleOpenDialog()}>
                      Add your first category
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.categories?.map((category) => (
                <TableRow key={category._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {category.description || "No description"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.movieCount || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.seriesCount || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewingCategory(category)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(category._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewingCategory} onOpenChange={(open) => !open && setViewingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Category Description</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <h3 className="font-medium text-lg">{viewingCategory?.name}</h3>
            <div className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
              {viewingCategory?.description || "No description available."}
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setViewingCategory(null)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
