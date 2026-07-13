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

        const downloadIds = user.downloads || []

        const movies = await Movie.find({ _id: { $in: downloadIds } })
            .populate({ path: "category", select: "name slug" })
            .lean()

        const series = await Series.find({ _id: { $in: downloadIds } })
            .populate({ path: "category", select: "name slug" })
            .lean()

        const downloadedMovies = movies.map((m: any) => ({ ...m, type: "movie" }))
        const downloadedSeries = series.map((s: any) => ({ ...s, type: "series" }))

        const idMap = new Map()
            ;[...downloadedMovies, ...downloadedSeries].forEach((i) => idMap.set(i._id.toString(), i))

        const sortedDownloads = downloadIds
            .map((id: any) => idMap.get(id.toString()))
            .filter(Boolean)

        return NextResponse.json({ downloads: sortedDownloads })
    } catch (error) {
        console.error("Error fetching downloads:", error)
        return NextResponse.json({ error: "Failed to fetch downloads" }, { status: 500 })
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
            if (!item) return NextResponse.json({ error: "Movie not found" }, { status: 404 })
        } else if (seriesId) {
            item = await Series.findById(seriesId)
            if (!item) return NextResponse.json({ error: "Series not found" }, { status: 404 })
        }

        if (!item) {
            return NextResponse.json({ error: "Content not found" }, { status: 404 })
        }

        const user = await User.findByIdAndUpdate(
            session.userId,
            { $addToSet: { downloads: item._id } },
            { new: true }
        )

        return NextResponse.json({ success: true, downloads: user?.downloads })
    } catch (error) {
        console.error("Error adding to downloads:", error)
        return NextResponse.json({ error: "Failed to add to downloads" }, { status: 500 })
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
            { $pull: { downloads: idToRemove } },
            { new: true }
        )

        return NextResponse.json({ success: true, downloads: user?.downloads })
    } catch (error) {
        console.error("Error removing from downloads:", error)
        return NextResponse.json({ error: "Failed to remove from downloads" }, { status: 500 })
    }
}
