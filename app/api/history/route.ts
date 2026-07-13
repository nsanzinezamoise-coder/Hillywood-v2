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

    const user = await User.findById(session.userId).lean()
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const historyData = user.watchHistory || []

    const movieIds = historyData.filter((h: any) => h.movie).map((h: any) => h.movie)
    const seriesIds = historyData.filter((h: any) => h.series).map((h: any) => h.series)

    const movies = await Movie.find({ _id: { $in: movieIds } })
      .populate({ path: "category", select: "name slug" })
      .lean()

    const series = await Series.find({ _id: { $in: seriesIds } })
      .populate({ path: "category", select: "name slug" })
      .lean()

    const moviesMap = new Map()
    movies.forEach((m: any) => moviesMap.set(m._id.toString(), { ...m, type: "movie" }))
    const seriesMap = new Map()
    series.forEach((s: any) => seriesMap.set(s._id.toString(), { ...s, type: "series" }))

    const formattedHistory = historyData.map((h: any) => {
      let item = null
      if (h.movie) item = moviesMap.get(h.movie.toString())
      if (h.series) item = seriesMap.get(h.series.toString())
      if (!item) return null

      return {
        _id: item._id, // item id
        title: item.title,
        poster: item.poster,
        slug: item.slug,
        type: item.type,
        watchedAt: h.watchedAt,
        progress: h.progress
      }
    }).filter(Boolean).sort((a: any, b: any) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime())

    return NextResponse.json({ history: formattedHistory })
  } catch (error) {
    console.error("Error fetching watch history:", error)
    return NextResponse.json({ error: "Failed to fetch watch history" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { movieId, seriesId, progress = 0 } = await request.json()

    if (!movieId && !seriesId) {
      return NextResponse.json({ error: "Movie or Series ID required" }, { status: 400 })
    }

    await connectToDatabase()
    
    const user = await User.findById(session.userId)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const existingIndex = user.watchHistory.findIndex((h: any) => 
      (movieId && h.movie && h.movie.toString() === movieId) ||
      (seriesId && h.series && h.series.toString() === seriesId)
    )

    if (existingIndex !== -1) {
      user.watchHistory[existingIndex].watchedAt = new Date()
      user.watchHistory[existingIndex].progress = progress
    } else {
      user.watchHistory.push({
        movie: movieId ? movieId : undefined,
        series: seriesId ? seriesId : undefined,
        watchedAt: new Date(),
        progress
      })
    }

    await user.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating watch history:", error)
    return NextResponse.json({ error: "Failed to update watch history" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const clearAll = searchParams.get("clearAll")

    await connectToDatabase()

    if (clearAll === "true") {
      await User.findByIdAndUpdate(
        session.userId,
        { $set: { watchHistory: [] } }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 })
  }
}
