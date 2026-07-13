"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
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
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Star, 
  MoreHorizontal, 
  Trash2, 
  Eye, 
  Search as SearchIcon,
  Film,
  Tv,
  User,
  Users,
  MessageSquare,
} from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  avatar?: string
}

interface Movie {
  _id: string
  title: string
  slug: string
  poster: string
}

interface Series {
  _id: string
  title: string
  slug: string
  poster: string
}

interface Review {
  _id: string
  user: User | null
  guestName?: string
  movie?: Movie
  series?: Series
  rating: number
  comment: string
  likes: number
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Stats {
  averageRating: number
  totalReviews: number
  movieReviews: number
  seriesReviews: number
  userReviews: number
  guestReviews: number
}

interface AdminReviewsListProps {
  reviews: Review[]
  pagination: Pagination
  stats: Stats
  currentType: string
  currentSort: string
  currentSearch?: string
  currentMinRating?: string
}

export function AdminReviewsList({
  reviews,
  pagination,
  stats,
  currentType,
  currentSort,
  currentSearch = "",
  currentMinRating = "",
}: AdminReviewsListProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(currentSearch)
  const [ratingFilter, setRatingFilter] = useState(currentMinRating)

  // Dropdown menu item hover styles
  const dropdownItemClasses = "hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white cursor-pointer"

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      updateFilters()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const updateFilters = () => {
    const params = new URLSearchParams()
    if (currentType !== "all") params.set("type", currentType)
    if (currentSort !== "newest") params.set("sort", currentSort)
    if (ratingFilter && ratingFilter !== "all") params.set("minRating", ratingFilter)
    if (searchQuery.trim()) params.set("search", searchQuery.trim())
    if (pagination.page > 1) params.set("page", pagination.page.toString())
    
    router.push(`/admin/reviews${params.toString() ? `?${params}` : ""}`)
  }

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams()
    if (type !== "all") params.set("type", type)
    if (currentSort !== "newest") params.set("sort", currentSort)
    if (ratingFilter && ratingFilter !== "all") params.set("minRating", ratingFilter)
    if (searchQuery.trim()) params.set("search", searchQuery.trim())
    
    router.push(`/admin/reviews${params.toString() ? `?${params}` : ""}`)
  }

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams()
    if (currentType !== "all") params.set("type", currentType)
    if (sort !== "newest") params.set("sort", sort)
    if (ratingFilter && ratingFilter !== "all") params.set("minRating", ratingFilter)
    if (searchQuery.trim()) params.set("search", searchQuery.trim())
    
    router.push(`/admin/reviews${params.toString() ? `?${params}` : ""}`)
  }

  const handleRatingFilterChange = (rating: string) => {
    setRatingFilter(rating)
    const params = new URLSearchParams()
    if (currentType !== "all") params.set("type", currentType)
    if (currentSort !== "newest") params.set("sort", currentSort)
    if (rating && rating !== "all") params.set("minRating", rating)
    if (searchQuery.trim()) params.set("search", searchQuery.trim())
    
    router.push(`/admin/reviews${params.toString() ? `?${params}` : ""}`)
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return

    setIsLoading(reviewId)
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete review:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
            }`}
          />
        ))}
        <span className="ml-1 text-xs font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const getReviewType = (review: Review) => {
    if (review.movie) {
      return {
        icon: <Film className="h-4 w-4 text-blue-500" />,
        type: "Movie",
        title: review.movie.title,
        link: `/movie/${review.movie.slug}`
      }
    } else if (review.series) {
      return {
        icon: <Tv className="h-4 w-4 text-purple-500" />,
        type: "Series",
        title: review.series.title,
        link: `/series/${review.series.slug}`
      }
    }
    return {
      icon: null,
      type: "Unknown",
      title: "N/A",
      link: "#"
    }
  }

  const getReviewerInfo = (review: Review) => {
    if (review.user) {
      return {
        name: review.user.name,
        email: review.user.email,
        avatar: review.user.avatar,
        type: "User",
        icon: <User className="h-4 w-4 text-green-500" />
      }
    } else if (review.guestName) {
      return {
        name: review.guestName,
        email: null,
        avatar: null,
        type: "Guest",
        icon: <Users className="h-4 w-4 text-orange-500" />
      }
    }
    return {
      name: "Anonymous",
      email: null,
      avatar: null,
      type: "Unknown",
      icon: null
    }
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              {stats.movieReviews} movies · {stats.seriesReviews} series
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              out of 5 stars
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Reviews</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userReviews}</div>
            <p className="text-xs text-muted-foreground">
              from registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Guest Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.guestReviews}</div>
            <p className="text-xs text-muted-foreground">
              from anonymous users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-1 items-center gap-2 w-full max-w-sm mr-auto">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reviews by comment or guest name..."
              className="pl-8 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={currentType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="movie">Movies Only</SelectItem>
              <SelectItem value="series">Series Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ratingFilter} onValueChange={handleRatingFilterChange}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Min Rating" />
            </SelectTrigger>
            <SelectContent>
              {/* Fixed: Changed from empty string to "all" */}
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
              <SelectItem value="1">1+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <span className="text-sm text-muted-foreground shrink-0 hidden md:inline-block">
          Showing {reviews.length} of {pagination.total} reviews
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Reviewer</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => {
              const reviewType = getReviewType(review)
              const reviewer = getReviewerInfo(review)
              
              return (
                <TableRow key={review._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted overflow-hidden shrink-0">
                        {reviewer.avatar ? (
                          <Image
                            src={reviewer.avatar}
                            alt={reviewer.name}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-primary/10">
                            {reviewer.icon}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1 flex items-center gap-1">
                          {reviewer.name}
                          <span className="text-xs text-muted-foreground">
                            ({reviewer.type})
                          </span>
                        </p>
                        {reviewer.email && (
                          <p className="text-xs text-muted-foreground">
                            {reviewer.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px]">
                      <p className="text-sm line-clamp-2">{review.comment}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {reviewType.icon}
                      <div>
                        <p className="text-sm font-medium line-clamp-1">
                          {reviewType.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reviewType.type}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderStars(review.rating)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{review.likes}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isLoading === review._id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {review.movie && (
                          <DropdownMenuItem asChild className={dropdownItemClasses}>
                            <Link href={`/movie/${review.movie.slug}`} target="_blank">
                              <Eye className="h-4 w-4 mr-2" />
                              View Movie
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {review.series && (
                          <DropdownMenuItem asChild className={dropdownItemClasses}>
                            <Link href={`/series/${review.series.slug}`} target="_blank">
                              <Eye className="h-4 w-4 mr-2" />
                              View Series
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(review._id)}
                          className={`${dropdownItemClasses} text-destructive focus:text-destructive`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                variant={page === pagination.page ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams()
                  if (currentType !== "all") params.set("type", currentType)
                  if (currentSort !== "newest") params.set("sort", currentSort)
                  if (currentMinRating && currentMinRating !== "all") params.set("minRating", currentMinRating)
                  if (currentSearch) params.set("search", currentSearch)
                  if (page > 1) params.set("page", page.toString())
                  router.push(`/admin/reviews${params.toString() ? `?${params}` : ""}`)
                }}
                className={page !== pagination.page ? "hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white" : ""}
              >
                {page}
              </Button>
            )
          )}
        </div>
      )}

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reviews found</p>
        </div>
      )}
    </div>
  )
}