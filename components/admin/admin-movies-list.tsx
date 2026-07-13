"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Edit, MoreHorizontal, Trash2, Eye, Check, X, Star, Search as SearchIcon, SlidersHorizontal } from "lucide-react"

interface Movie {
  _id: string
  title: string
  slug: string
  poster: string
  releaseYear: number
  duration: number
  rating: number
  views: number
  approvalStatus: "pending" | "approved" | "rejected"
  approvedAt?: Date
  category?: {
    _id: string
    name: string
    slug: string
  }
  createdAt: string
}

interface Category {
  _id: string
  name: string
  slug: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface AdminMoviesListProps {
  movies: Movie[]
  pagination: Pagination
  currentStatus: string
  currentSearch?: string
  categories: Category[]
  currentCategory: string
  currentSort: string
  currentYear: string
}

export function AdminMoviesList({
  movies,
  pagination,
  currentStatus,
  currentSearch = "",
  categories,
  currentCategory,
  currentSort,
  currentYear,
}: AdminMoviesListProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(currentSearch)
  const [yearInput, setYearInput] = useState(currentYear === "all" ? "" : currentYear)

  const dropdownItemClasses =
    "hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white cursor-pointer"

  const buildParams = (overrides: Record<string, string> = {}) => {
    const base: Record<string, string> = {
      status: currentStatus,
      search: searchQuery.trim(),
      category: currentCategory,
      sort: currentSort,
      year: yearInput.trim() || "all",
    }
    const merged = { ...base, ...overrides }
    const params = new URLSearchParams()
    if (merged.status && merged.status !== "all") params.set("status", merged.status)
    if (merged.search) params.set("search", merged.search)
    if (merged.category && merged.category !== "all") params.set("category", merged.category)
    if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort)
    if (merged.year && merged.year !== "all") params.set("year", merged.year)
    return params.toString()
  }

  const navigate = (overrides: Record<string, string> = {}) => {
    const qs = buildParams(overrides)
    router.push(`/admin/movies${qs ? `?${qs}` : ""}`)
  }

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => navigate({ search: searchQuery.trim() }), 500)
    return () => clearTimeout(t)
  }, [searchQuery]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced year
  useEffect(() => {
    const t = setTimeout(() => navigate({ year: yearInput.trim() || "all" }), 600)
    return () => clearTimeout(t)
  }, [yearInput]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprovalAction = async (
    movieId: string,
    action: "approve" | "reject"
  ) => {
    setIsLoading(movieId)
    try {
      const response = await fetch(`/api/admin/movies/${movieId}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (response.ok) router.refresh()
    } catch (error) {
      console.error("Failed to update approval status:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleDelete = async (movieId: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) return
    setIsLoading(movieId)
    try {
      const response = await fetch(`/api/admin/movies/${movieId}`, {
        method: "DELETE",
      })
      if (response.ok) router.refresh()
    } catch (error) {
      console.error("Failed to delete movie:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <div>
      {/* ── Filter Bar ── */}
      <div className="space-y-3 mb-6">
        {/* Row 1: Search */}
        <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 w-full max-w-sm">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search movies by title..."
              className="pl-8 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        {/* Row 2: Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="font-medium">Filters:</span>
          </div>

          {/* Sort */}
          <Select
            value={currentSort}
            onValueChange={(v) => navigate({ sort: v })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="highest_rated">Highest Rated</SelectItem>
              <SelectItem value="most_viewed">Most Viewed</SelectItem>
              <SelectItem value="approved_date">Approved Date</SelectItem>
            </SelectContent>
          </Select>

          {/* Category */}
          <Select
            value={currentCategory}
            onValueChange={(v) => navigate({ category: v })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Approval Status */}
          <Select
            value={currentStatus}
            onValueChange={(v) => navigate({ status: v })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Year */}
          <Input
            type="number"
            placeholder="Year (e.g. 2024)"
            className="w-[150px] bg-background"
            value={yearInput}
            min={1900}
            max={new Date().getFullYear() + 1}
            onChange={(e) => setYearInput(e.target.value)}
          />

          {/* Clear filters */}
          {(currentStatus !== "all" || currentCategory !== "all" || currentSort !== "newest" || (yearInput && yearInput !== "all") || searchQuery) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearchQuery("")
                setYearInput("")
                router.push("/admin/movies")
              }}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear filters
            </Button>
          )}

          <span className="text-sm text-muted-foreground ml-auto hidden md:inline-block">
            {movies.length} of {pagination.total} movies
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Movie</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approved Date</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movies.map((movie) => (
              <TableRow key={movie._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-12 rounded bg-muted overflow-hidden shrink-0">
                      <Image
                        src={movie.poster || "/placeholder.svg"}
                        alt={movie.title}
                        width={48}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{movie.title}</p>
                      <p className="text-xs text-muted-foreground">/{movie.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{movie.category?.name || "-"}</TableCell>
                <TableCell>{movie.releaseYear}</TableCell>
                <TableCell>{formatDuration(movie.duration)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {movie.rating.toFixed(1)}
                  </div>
                </TableCell>
                <TableCell>{movie.views.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(movie.approvalStatus)}`}>
                    {movie.approvalStatus}
                  </span>
                </TableCell>
                <TableCell>
                  {movie.approvedAt ? new Date(movie.approvedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }) : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isLoading === movie._id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild className={dropdownItemClasses}>
                        <Link href={`/movie/${movie.slug}`} target="_blank">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      {user?.role === "admin" && (
                        <>
                          <DropdownMenuItem asChild className={dropdownItemClasses}>
                            <Link href={`/admin/movies/${movie._id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {movie.approvalStatus !== "approved" && (
                            <DropdownMenuItem
                              onClick={() => handleApprovalAction(movie._id, "approve")}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {movie.approvalStatus !== "rejected" && (
                            <DropdownMenuItem
                              onClick={() => handleApprovalAction(movie._id, "reject")}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(movie._id)}
                            className={`${dropdownItemClasses} text-destructive focus:text-destructive`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === pagination.page ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const qs = buildParams({ page: page.toString() })
                router.push(`/admin/movies${qs ? `?${qs}` : ""}`)
              }}
              className={
                page !== pagination.page
                  ? "hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white"
                  : ""
              }
            >
              {page}
            </Button>
          ))}
        </div>
      )}

      {movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No movies found</p>
        </div>
      )}
    </div>
  )
}