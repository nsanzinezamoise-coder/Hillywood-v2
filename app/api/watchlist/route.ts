import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { User, Movie, Series } from "@/lib/models"
import { getSession } from "@/lib/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const user = await User.findById(session.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const watchlistIds = user.watchlist || []

    const movies = await Movie.find({ _id: { $in: watchlistIds } })
      .populate({ path: "category", select: "name slug" })
      .lean()

    const series = await Series.find({ _id: { $in: watchlistIds } })
      .populate({ path: "category", select: "name slug" })
      .lean()

    const watchlistMovies = movies.map((m: any) => ({ ...m, type: "movie" }))
    const watchlistSeries = series.map((s: any) => ({ ...s, type: "series" }))

    const idMap = new Map()
      // Avoid re-declaring 'item', use a different variable name or just arrow function parameter
      ;[...watchlistMovies, ...watchlistSeries].forEach((i) => idMap.set(i._id.toString(), i))

    const sortedWatchlist = watchlistIds
      .map((id: any) => idMap.get(id.toString()))
      .filter(Boolean)

    return NextResponse.json({ watchlist: sortedWatchlist })
  } catch (error) {
    console.error("Error fetching watchlist:", error)
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { movieId, seriesId } = await request.json()

    if (!movieId && !seriesId) {
      return NextResponse.json({ error: "Movie or Series ID required" }, { status: 400 })
    }

    await connectToDatabase()

    let item
    if (movieId) {
      item = await Movie.findById(movieId)
      if (!item) {
        return NextResponse.json({ error: "Movie not found" }, { status: 404 })
      }
    } else if (seriesId) {
      item = await Series.findById(seriesId)
      if (!item) {
        return NextResponse.json({ error: "Series not found" }, { status: 404 })
      }
    }

    if (!item) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    const user = await User.findByIdAndUpdate(
      session.userId,
      { $addToSet: { watchlist: item._id } },
      { new: true }
    )

    return NextResponse.json({ success: true, watchlist: user?.watchlist })
  } catch (error) {
    console.error("Error adding to watchlist:", error)
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get("movieId")
    const seriesId = searchParams.get("seriesId")
    const idToRemove = movieId || seriesId

    if (!idToRemove) {
      return NextResponse.json({ error: "Movie or Series ID required" }, { status: 400 })
    }

    await connectToDatabase()

    const user = await User.findByIdAndUpdate(
      session.userId,
      { $pull: { watchlist: idToRemove } },
      { new: true }
    )

    return NextResponse.json({ success: true, watchlist: user?.watchlist })
  } catch (error) {
    console.error("Error removing from watchlist:", error)
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 })
  }
}
