import { connectToDatabase } from "@/lib/mongodb"
import { Movie } from "@/lib/models"
import { ChannelContentPage } from "@/components/admin/channel-content-page"

interface Props {
  searchParams: Promise<{
    page?: string
  }>
}

async function getMovies(page: number = 1) {
  await connectToDatabase()

  const limit = 100
  const skip = (page - 1) * limit

  const [movies, total] = await Promise.all([
    Movie.find({})
      .select("title slug poster duration views approvalStatus createdAt description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Movie.countDocuments({}),
  ])

  return {
    movies: JSON.parse(JSON.stringify(movies)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  }
}

export default async function AdminMoviesPage({ searchParams }: Props) {
  const { page } = await searchParams
  const currentPage = parseInt(page || "1")
  const data = await getMovies(currentPage)

  return (
    <ChannelContentPage
      movies={data.movies}
      pagination={data.pagination}
      currentPage={currentPage}
    />
  )
}
