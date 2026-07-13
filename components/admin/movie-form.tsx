"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Upload } from "lucide-react"

interface Category {
  _id: string
  name: string
  slug: string
}

interface Movie {
  _id?: string
  title: string
  description: string
  synopsis?: string
  poster: string
  backdrop?: string
  trailer?: string
  videoUrl: string
  downloadUrl?: string
  duration: number
  releaseYear: number
  languages: string[]
  subtitles: string[]
  category: string
  cast: string[]
  director?: string
  producer?: string
  featured: boolean
  tags: string[]
}

interface MovieFormProps {
  categories: Category[]
  movie?: Movie
}

const LANGUAGES = ["Kinyarwanda", "English", "French"]

export function MovieForm({ categories, movie }: MovieFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState<Movie>({
    title: movie?.title || "",
    description: movie?.description || "",
    synopsis: movie?.synopsis || "",
    poster: movie?.poster || "",
    backdrop: movie?.backdrop || "",
    trailer: movie?.trailer || "",
    videoUrl: movie?.videoUrl || "",
    downloadUrl: movie?.downloadUrl || "",
    duration: movie?.duration || 90,
    releaseYear: movie?.releaseYear || new Date().getFullYear(),
    languages: movie?.languages || ["Kinyarwanda"],
    subtitles: movie?.subtitles || [],
    category: movie?.category || "",
    cast: movie?.cast || [],
    director: movie?.director || "",
    producer: movie?.producer || "",
    featured: movie?.featured || false,
    tags: movie?.tags || [],
  })

  const [castInput, setCastInput] = useState("")
  const [tagsInput, setTagsInput] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const url = movie?._id
        ? `/api/admin/movies/${movie._id}`
        : "/api/admin/movies"

      const method = movie?._id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cast: castInput
            ? castInput.split(",").map((s) => s.trim())
            : formData.cast,
          tags: tagsInput
            ? tagsInput.split(",").map((s) => s.trim().toLowerCase())
            : formData.tags,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save movie")
      }

      router.push("/admin/movies")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save movie")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageChange = (lang: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, languages: [...formData.languages, lang] })
    } else {
      setFormData({
        ...formData,
        languages: formData.languages.filter((l) => l !== lang),
      })
    }
  }

  const handleSubtitleChange = (lang: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, subtitles: [...formData.subtitles, lang] })
    } else {
      setFormData({
        ...formData,
        subtitles: formData.subtitles.filter((l) => l !== lang),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Movie title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description (max 500 characters)"
                  maxLength={500}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cast">Cast (comma-separated)</Label>
                <Input
                  id="cast"
                  value={castInput || formData.cast.join(", ")}
                  onChange={(e) => setCastInput(e.target.value)}
                  placeholder="Actor 1, Actor 2, Actor 3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="director">Director</Label>
                  <Input
                    id="director"
                    value={formData.director}
                    onChange={(e) =>
                      setFormData({ ...formData, director: e.target.value })
                    }
                    placeholder="Director Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="producer">Producer</Label>
                  <Input
                    id="producer"
                    value={formData.producer}
                    onChange={(e) =>
                      setFormData({ ...formData, producer: e.target.value })
                    }
                    placeholder="Producer Name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media URLs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="poster">Poster Image URL *</Label>
                <Input
                  id="poster"
                  type="url"
                  value={formData.poster}
                  onChange={(e) =>
                    setFormData({ ...formData, poster: e.target.value })
                  }
                  placeholder="https://example.com/poster.jpg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL *</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => {
                    const url = e.target.value
                    let downloadUrl = formData.downloadUrl

                    // Google Drive Link Detection & Conversion
                    const gDriveMatch = url.match(/file\/d\/([a-zA-Z0-9_-]+)/)
                    if (gDriveMatch && gDriveMatch[1]) {
                      const fileId = gDriveMatch[1]
                      downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
                    }

                    setFormData({
                      ...formData,
                      videoUrl: url,
                      downloadUrl: downloadUrl
                    })
                  }}
                  placeholder="https://example.com/movie.mp4 or Google Drive Link"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter the direct URL to the video file or a Google Drive link.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="downloadUrl">Download URL</Label>
                <Input
                  id="downloadUrl"
                  type="url"
                  value={formData.downloadUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, downloadUrl: e.target.value })
                  }
                  placeholder="https://example.com/download-movie.mp4"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
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


              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="releaseYear">Release Year *</Label>
                  <Input
                    id="releaseYear"
                    type="number"
                    value={isNaN(formData.releaseYear) ? "" : formData.releaseYear}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      setFormData({
                        ...formData,
                        releaseYear: isNaN(val) ? 0 : val,
                      })
                    }}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={isNaN(formData.duration) ? "" : formData.duration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      setFormData({
                        ...formData,
                        duration: isNaN(val) ? 0 : val,
                      })
                    }}
                    min={1}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Languages *</Label>
                <div className="space-y-2">
                  {LANGUAGES.map((lang) => (
                    <div key={lang} className="flex items-center gap-2">
                      <Checkbox
                        id={`lang-${lang}`}
                        checked={formData.languages.includes(lang)}
                        onCheckedChange={(checked) =>
                          handleLanguageChange(lang, !!checked)
                        }
                      />
                      <label htmlFor={`lang-${lang}`} className="text-sm">
                        {lang}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subtitles</Label>
                <div className="space-y-2">
                  {LANGUAGES.map((lang) => (
                    <div key={lang} className="flex items-center gap-2">
                      <Checkbox
                        id={`sub-${lang}`}
                        checked={formData.subtitles.includes(lang)}
                        onCheckedChange={(checked) =>
                          handleSubtitleChange(lang, !!checked)
                        }
                      />
                      <label htmlFor={`sub-${lang}`} className="text-sm">
                        {lang}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
{/* 
              <div className="flex items-center gap-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, featured: !!checked })
                  }
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Featured on homepage
                </label>
              </div> */}
              
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={tagsInput || formData.tags.join(", ")}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="drama, family, culture"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated tags for search
              </p>
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
                  {movie?._id ? "Update" : "Create"} Movie
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
