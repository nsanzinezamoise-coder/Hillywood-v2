"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { MovieCard } from "@/components/movie-card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter, X, Loader2 } from "lucide-react"

interface Category {
  _id: string
  name: string
  slug: string
}

interface Movie {
  _id: string
  title: string
  slug: string
  description: string
  poster: string
  duration?: number
  releaseYear: number
  rating: number
  ratingCount: number
  language: string[]
  category?: {
    name: string
    slug: string
  }
}

interface BrowseContentProps {
  categories: Category[]
}

const YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i
)

const LANGUAGES = ["Kinyarwanda", "English", "French"]


const SORT_OPTIONS = [
  { value: "latest", label: "Latest Uploaded" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "rating", label: "Highest Rated" },
  { value: "views", label: "Most Viewed" },
  { value: "title", label: "Title A-Z" },
]

export function BrowseContent({ categories }: BrowseContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters from URL (removed searchQuery)
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams?.get("category") || ""
  )
  const [selectedLanguage, setSelectedLanguage] = useState(
    searchParams?.get("language") || ""
  )
  const [selectedYear, setSelectedYear] = useState(
    searchParams?.get("year") || ""
  )
  const [sortBy, setSortBy] = useState(searchParams?.get("sort") || "latest")

  const [showFilters, setShowFilters] = useState(false)

  const fetchMovies = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      if (reset) setIsLoading(true)
      else setIsLoadingMore(true)

      try {
        const params = new URLSearchParams()
        params.set("page", pageNum.toString())
        params.set("limit", "12")

        if (selectedCategory) params.set("category", selectedCategory)
        if (selectedLanguage) params.set("language", selectedLanguage)
        if (selectedYear) params.set("year", selectedYear)
        if (sortBy) params.set("sort", sortBy)

        const response = await fetch(`/api/movies?${params.toString()}`)
        const data = await response.json()

        if (reset) {
          setMovies(data.movies)
        } else {
          setMovies((prev) => [...prev, ...data.movies])
        }

        setHasMore(data.pagination.hasMore)
        setTotal(data.pagination.total)
        setPage(pageNum)
      } catch (error) {
        console.error("Failed to fetch movies:", error)
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [
      selectedCategory,
      selectedLanguage,
      selectedYear,
      sortBy,
    ]
  )

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams()

    if (selectedCategory) params.set("category", selectedCategory)
    if (selectedLanguage) params.set("language", selectedLanguage)
    if (selectedYear) params.set("year", selectedYear)
    if (sortBy && sortBy !== "latest") params.set("sort", sortBy)

    const queryString = params.toString()
    router.push(`/movies${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    })
  }, [
    router,
    selectedCategory,
    selectedLanguage,
    selectedYear,
    sortBy,
  ])

  // Fetch movies when filters change
  useEffect(() => {
    fetchMovies(1, true)
    updateURL()
  }, [
    selectedCategory,
    selectedLanguage,
    selectedYear,
    sortBy,
  ])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          fetchMovies(page + 1, false)
        }
      },
      { threshold: 0.0 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoading, isLoadingMore, page, fetchMovies])

  const clearFilters = () => {
    setSelectedCategory("")
    setSelectedLanguage("")
    setSelectedYear("")
    setSortBy("latest")
  }

  const hasActiveFilters =
    selectedCategory ||
    selectedLanguage ||
    selectedYear

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-1 mb-5">
        {/* Search */}


        {/* Filter Toggle (Mobile) */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-primary" />
          )}
        </Button>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center gap-3">

          <div className="relative flex-15">
            <h5>Filter Here :</h5>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {showFilters && (
        <div className="lg:hidden grid grid-cols-2 gap-3 mb-6 p-4 bg-card rounded-lg border border-border">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="col-span-2">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="col-span-2 bg-transparent"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All Filters
            </Button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="mb-6 text-sm text-muted-foreground">
        {total > 0 ? (
          <span>
            Showing {movies.length} of {total} results
          </span>
        ) : isLoading ? (
          <span>Loading...</span>
        ) : (
          <span>No results found</span>
        )}
      </div>

      {/* Movie Grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      ) : !isLoading ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground mb-4">
            No movies found matching your criteria.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : null}

      {/* Loading State Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 mt-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-muted rounded-lg" />
              <div className="mt-3 h-4 bg-muted rounded w-3/4" />
              <div className="mt-2 h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Loading More Indicator / Observer Anchor */}
      <div
        ref={loadMoreRef}
        className={`mt-10 py-10 flex justify-center items-center w-full ${!hasMore && 'hidden'}`}
      >
        {isLoadingMore && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Loading more movies...</p>
          </div>
        )}
      </div>

      {!hasMore && movies.length > 0 && !isLoading && (
        <div className="mt-10 py-10 text-center border-t border-border/50">
          <p className="text-sm text-muted-foreground italic">You've reached the end of the list</p>
        </div>
      )}
    </div>
  )
}
