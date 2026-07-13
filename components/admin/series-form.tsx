"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
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
import { Loader2, Upload, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SeriesFormProps {
  categories: any[]
  isNewMovie?: boolean
  generatedTitle?: string
  selectedSeries?: any
  season?: number
  episode?: number
}

interface FormData {
  title: string
  slug: string
  description: string
  poster: string
  videoUrl: string
  downloadurl: string
  releaseYear: number | ""
  languages: string[]
  category: string
  cast: string[]
  director: string
  producer: string
  featured: boolean
  rating: number | ""
  ratingCount: number | ""
  views: number | ""
  approvalStatus: string
  seasons: number | ""
  episodes: number | ""
  duration: number | ""
  parentSeries?: string
}

const LANGUAGES = ["Kinyarwanda", "English", "French"]

export function SeriesForm({
  categories,
  isNewMovie = true,
  generatedTitle = "",
  selectedSeries = null,
  season = 1,
  episode = 1
}: SeriesFormProps) {
  const currentYear = new Date().getFullYear()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [formData, setFormData] = useState<FormData>(() => {
    const defaultData: FormData = {
      title: "",
      slug: "",
      description: "",
      poster: "",
      videoUrl: "",
      downloadurl: "",
      releaseYear: currentYear,
      languages: ["Kinyarwanda"],
      category: "",
      cast: [],
      director: "",
      producer: "",
      featured: false,
      rating: 0,
      ratingCount: 0,
      views: 0,
      approvalStatus: "pending",
      seasons: 1,
      episodes: 0,
      duration: 0,
      parentSeries: ""
    }

    if (generatedTitle) {
      const slug = generatedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      const initialData: FormData = {
        ...defaultData,
        title: generatedTitle,
        slug: slug,
        seasons: isNewMovie ? 1 : (Number(season) || 1),
        episodes: isNewMovie ? 0 : (Number(episode) || 0),
        duration: isNewMovie ? 0 : (Number(selectedSeries?.duration) || 0),
        parentSeries: selectedSeries?._id || "",
      }

      if (!isNewMovie && selectedSeries) {
        initialData.languages = selectedSeries.languages || ["Kinyarwanda"]
        initialData.category = selectedSeries.category?._id?.toString() || selectedSeries.category?.toString() || ""
        initialData.cast = selectedSeries.cast || []
        initialData.director = selectedSeries.director || ""
        initialData.producer = selectedSeries.producer || ""
        initialData.featured = selectedSeries.featured || false
        initialData.description = selectedSeries.description || ""
        initialData.poster = selectedSeries.poster || ""
        initialData.releaseYear = selectedSeries.releaseYear || currentYear
        initialData.videoUrl = selectedSeries.videoUrl || ""
        initialData.downloadurl = selectedSeries.downloadurl || ""
      }
      return initialData
    } else if (selectedSeries) {
      return {
        ...defaultData,
        ...selectedSeries,
        category: selectedSeries.category?._id?.toString() || selectedSeries.category?.toString() || "",
        duration: Number(selectedSeries.duration) || 0,
      }
    }
    return defaultData
  })

  const [castInput, setCastInput] = useState(() => {
    if (generatedTitle && !isNewMovie && selectedSeries) {
      return (selectedSeries.cast || []).join(", ")
    }
    if (selectedSeries && !generatedTitle) {
      return (selectedSeries.cast || []).join(", ")
    }
    return ""
  })

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const formTopRef = useRef<HTMLDivElement>(null)

  // Scroll to top when success message or error appears
  useEffect(() => {
    if (successMessage || error) {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [successMessage, error])

  // BUG FIX 1: Sync EVERYTHING whenever generatedTitle or selectedSeries changes
  useEffect(() => {
    if (generatedTitle) {
      const slug = generatedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      setFormData(prev => {
        const newData = {
          ...prev,
          title: generatedTitle,
          slug,
          seasons: season,
          episodes: episode
        }

        // If selecting an existing series to add episode, pick up its defaults
        if (!isNewMovie && selectedSeries) {
          const catId = selectedSeries.category?._id?.toString()
            || selectedSeries.category?.toString()
            || ""

          Object.assign(newData, {
            description: selectedSeries.description || prev.description,
            poster: selectedSeries.poster || prev.poster,
            videoUrl: selectedSeries.videoUrl || prev.videoUrl,
            downloadurl: selectedSeries.downloadurl || prev.downloadurl,
            releaseYear: selectedSeries.releaseYear || prev.releaseYear,
            languages: selectedSeries.languages || prev.languages,
            category: catId || prev.category,
            cast: selectedSeries.cast || prev.cast,
            director: selectedSeries.director || prev.director,
            producer: selectedSeries.producer || prev.producer,
            featured: selectedSeries.featured ?? prev.featured,
            duration: Number(selectedSeries.duration) || prev.duration,
            parentSeries: selectedSeries._id
          })
        }
        return newData
      })

      if (!isNewMovie && selectedSeries) {
        setCastInput((selectedSeries.cast || []).join(", "))
      }
    }
  }, [generatedTitle, selectedSeries, isNewMovie, season, episode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-generate slug from title when user types manually (no generatedTitle)
  useEffect(() => {
    if (formData.title && !generatedTitle && !slugManuallyEdited) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      setFormData(prev => ({
        ...prev,
        slug: slug
      }))
    }
  }, [formData.title, generatedTitle, slugManuallyEdited])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target

    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === "" ? "" : (parseFloat(value) || 0)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))

      // Track if slug is manually edited
      if (name === 'slug') {
        setSlugManuallyEdited(true)
      }
    }
  }

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    let downloadUrl = formData.downloadurl

    // Google Drive Link Detection & Conversion (matching movie form)
    const gDriveMatch = url.match(/file\/d\/([a-zA-Z0-9_-]+)/)
    if (gDriveMatch && gDriveMatch[1]) {
      const fileId = gDriveMatch[1]
      downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
    }

    setFormData(prev => ({
      ...prev,
      videoUrl: url,
      downloadurl: downloadUrl
    }))
  }

  const handleLanguageChange = (lang: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, lang]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        languages: prev.languages.filter(l => l !== lang)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const submissionData = {
        ...formData,
        releaseYear: Number(formData.releaseYear) || currentYear,
        rating: Number(formData.rating) || 0,
        ratingCount: Number(formData.ratingCount) || 0,
        views: Number(formData.views) || 0,
        seasons: Number(formData.seasons) || 1,
        episodes: Number(formData.episodes) || 0,
        duration: Number(formData.duration) || 0,
        cast: castInput ? castInput.split(",").map((s: string) => s.trim()) : formData.cast,
        parentSeries: !isNewMovie && selectedSeries && generatedTitle ? selectedSeries._id : formData.parentSeries
      }

      // If editing existing series (no generated title passed), use PUT
      const isEditing = !generatedTitle && selectedSeries && selectedSeries._id

      const response = await fetch(isEditing ? `/api/admin/series/${selectedSeries._id}` : '/api/admin/series', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEditing ? submissionData : { ...submissionData, ratingCount: 0, views: 0, approvalStatus: "pending" })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save series")
      }

      if (isEditing) {
        if (!formData.parentSeries) {
          const count = data.updatedEpisodesCount ?? 0
          if (count > 0) {
            setSuccessMessage(`Series updated successfully! ${count} related episode${count === 1 ? "" : "s"} were also synced (poster, description, category, cast & crew).`)
          } else {
            setSuccessMessage("Series updated successfully. No related episodes were found to sync.")
          }
        } else {
          setSuccessMessage("Episode updated successfully.")
        }
      }

      // Instead of relying on full router pushes immediately which hides the alert,
      // wait a bit, then refresh
      setTimeout(() => {
        router.push("/admin/series")
        router.refresh()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save series")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div ref={formTopRef} className="scroll-mt-24" />
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive relative">
          {error}
          <button
            type="button"
            onClick={() => setError("")}
            className="absolute top-2 right-2 text-destructive hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <Alert variant="default" className="border-green-500/50 text-green-700 bg-green-50 dark:bg-green-900/10 dark:text-green-400 relative">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            {successMessage}
          </AlertDescription>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="absolute top-2 right-2 text-green-600 dark:text-green-400 hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Basic Information</CardTitle>
                {generatedTitle && (
                  <Badge variant="secondary">
                    {isNewMovie ? 'New Series' : `Season ${season} Episode ${episode}`}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={!!generatedTitle}
                  placeholder={
                    generatedTitle
                      ? "Auto-generated from your selection"
                      : "Enter series title"
                  }
                  required
                  className={generatedTitle ? "bg-muted" : ""}
                />
                {!isNewMovie && selectedSeries && (
                  <p className="text-sm text-muted-foreground">
                    Updating: <span className="font-medium">{selectedSeries.title}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="url-friendly-slug"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Used in URLs. Auto-generated from title
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description (max 500 characters)"
                  maxLength={500}
                  required
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.description.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cast">Cast (comma-separated)</Label>
                <Input
                  id="cast"
                  value={castInput}
                  onChange={(e) => setCastInput(e.target.value)}
                  placeholder="Actor 1, Actor 2, Actor 3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="director">Director</Label>
                  <Input
                    id="director"
                    name="director"
                    value={formData.director}
                    onChange={handleInputChange}
                    placeholder="Director Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="producer">Producer</Label>
                  <Input
                    id="producer"
                    name="producer"
                    value={formData.producer}
                    onChange={handleInputChange}
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
                  name="poster"
                  type="url"
                  value={formData.poster}
                  onChange={handleInputChange}
                  placeholder="https://example.com/poster.jpg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  type="url"
                  value={formData.videoUrl}
                  onChange={handleVideoUrlChange}
                  placeholder="https://example.com/video.mp4 or Google Drive Link"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the direct URL to the video file or a Google Drive link.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="downloadurl">Download URL</Label>
                <Input
                  id="downloadurl"
                  name="downloadurl"
                  type="url"
                  value={formData.downloadurl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/download.mp4"
                />
                <p className="text-xs text-muted-foreground">
                  Direct URL for downloading the video file
                </p>
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
                    setFormData(prev => ({ ...prev, category: value }))
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
                    name="releaseYear"
                    type="number"
                    value={formData.releaseYear}
                    onChange={handleInputChange}
                    min={1900}
                    max={currentYear + 1}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min) *</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration === "" ? "" : formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="e.g. 45"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seasons">Seasons</Label>
                  <Input
                    id="seasons"
                    name="seasons"
                    type="number"
                    value={formData.seasons}
                    onChange={handleInputChange}
                    min="1"
                    disabled={!isNewMovie && !!generatedTitle}
                    className={!isNewMovie && !!generatedTitle ? "bg-muted" : ""}
                  />
                  {!isNewMovie && generatedTitle && (
                    <p className="text-xs text-muted-foreground">
                      Auto-set to Season {season}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="episodes">Episodes</Label>
                  <Input
                    id="episodes"
                    name="episodes"
                    type="number"
                    value={formData.episodes}
                    onChange={handleInputChange}
                    min="0"
                    disabled={!isNewMovie && !!generatedTitle}
                    className={!isNewMovie && !!generatedTitle ? "bg-muted" : ""}
                  />
                  {!isNewMovie && generatedTitle && (
                    <p className="text-xs text-muted-foreground">
                      Auto-set to Episode {episode}
                    </p>
                  )}
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

              {/* <div className="flex items-center gap-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, featured: !!checked }))
                  }
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Featured on homepage
                </label>
              </div> */}


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
                  {isNewMovie ? 'Create' : 'Update'} Series
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}