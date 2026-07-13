"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"

interface Category {
    _id: string
    name: string
    slug: string
}

interface Short {
    _id?: string
    title: string
    videoUrl: string
    category: string
    tags: string[]
}

interface ShortFormProps {
    categories: Category[]
    short?: Short
}

export function ShortForm({ categories, short }: ShortFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState<Short>({
        title: short?.title || "",
        videoUrl: short?.videoUrl || "",
        category: short?.category || "",
        tags: short?.tags || [],
    })

    const [tagsInput, setTagsInput] = useState(short?.tags?.join(", ") || "")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const url = short?._id
                ? `/api/admin/shorts/${short._id}`
                : "/api/admin/shorts"

            const method = short?._id ? "PUT" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    tags: tagsInput
                        ? tagsInput.split(",").map((s) => s.trim().toLowerCase())
                        : formData.tags,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to save short ")
            }

            router.push("/admin/shorts")
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save short ")
        } finally {
            setIsLoading(false)
        }
    }

    const isEdit = !!short?._id

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto px-4 py-8">
            <div className="text-center space-y-2 mb-4">
                <h1 className="font-serif text-3xl font-bold text-foreground">
                    {isEdit ? "Edit Short Film" : "Add New Short Film"}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit
                        ? "Update short film details and media"
                        : "Upload a new short film to the library"}
                </p>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                    {error}
                </div>
            )}

            <Card>
                <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="Short title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="videoUrl">Video URL *</Label>
                        <Input
                            id="videoUrl"
                            type="url"
                            value={formData.videoUrl}
                            onChange={(e) =>
                                setFormData({ ...formData, videoUrl: e.target.value })
                            }
                            placeholder="Direct stream URL or MP4 link from Cloudflare/storage"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) =>
                                setFormData({ ...formData, category: value })
                            }
                            required
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            placeholder="funny, viral, short"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Comma-separated tags for search
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            {short?._id ? "Update" : "Create"} Short
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
