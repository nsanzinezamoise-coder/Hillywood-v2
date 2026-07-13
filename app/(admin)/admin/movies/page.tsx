import Link from "next/link"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie, Category } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { AdminMoviesList } from "@/components/admin/admin-movies-list"
import { Plus } from "lucide-react"

interface Props {
  searchParams: Promise<{
    status?: string
    page?: string
    search?: string
    category?: string
    sort?: string
    year?: string
  }>
}

async function getCategories() {
  await connectToDatabase()
  const categories = await Category.find().sort({ name: 1 }).lean()
  return JSON.parse(JSON.stringify(categories))
}

async function getMovies(
  status?: string,
  page: number = 1,
  search?: string,
  category?: string,
  sort?: string,
  year?: string
) {
  await connectToDatabase()

  const query: Record<string, unknown> = {}
  if (status && status !== "all") {
    query.approvalStatus = status
  }
  if (search) {
    query.title = { $regex: search, $options: "i" }
  }
  if (category && category !== "all") {
    query.category = category
  }
  if (year && year !== "all") {
    query.releaseYear = parseInt(year)
  }

  const limit = 20
  const skip = (page - 1) * limit

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 }
  if (sort === "highest_rated") sortOption = { rating: -1 }
  else if (sort === "most_viewed") sortOption = { views: -1 }
  else if (sort === "approved_date") sortOption = { approvedAt: -1 }
  else if (sort === "newest") sortOption = { createdAt: -1 }

  const [movies, total] = await Promise.all([
    Movie.find(query)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Movie.countDocuments(query),
  ])

  return {
    movies: JSON.parse(JSON.stringify(movies)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export default async function AdminMoviesPage({ searchParams }: Props) {
  const { status, page, search, category, sort, year } = await searchParams
  const [data, categories] = await Promise.all([
    getMovies(status, parseInt(page || "1"), search, category, sort, year),
    getCategories(),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Movies
          </h1>
          <p className="text-muted-foreground">
            Manage all movies in the library
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/movies/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Movie
          </Link>
        </Button>
      </div>

      <AdminMoviesList
        movies={data.movies}
        pagination={data.pagination}
        currentStatus={status || "all"}
        currentSearch={search || ""}
        categories={categories}
        currentCategory={category || "all"}
        currentSort={sort || "newest"}
        currentYear={year || "all"}
      />
    </div>
  )
}
