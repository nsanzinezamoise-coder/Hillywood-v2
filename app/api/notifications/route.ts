import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie, Series, Short } from "@/lib/models"

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase()

        const { searchParams } = new URL(request.url)
        const limit = Math.min(20, Math.max(10, parseInt(searchParams.get("limit") || "10")))

        // Fetch the latest additions from all content types
        const [movies, series, shorts] = await Promise.all([
            Movie.find({ approvalStatus: "approved" }).sort({ createdAt: -1 }).limit(limit).lean(),
            Series.find({ approvalStatus: "approved" }).sort({ createdAt: -1 }).limit(limit).lean(),
            Short.find({ approvalStatus: "approved" }).sort({ createdAt: -1 }).limit(limit).lean(),
        ])

        // Combine and sort by creation date
        const notifications = [
            ...movies.map((m: any) => ({
                id: m._id,
                title: m.title,
                type: "movie",
                image: m.poster,
                createdAt: m.createdAt,
                link: `/movie/${m.slug}`,
                message: "New movie added"
            })),
            ...series.map((s: any) => ({
                id: s._id,
                title: s.title,
                type: "series",
                image: s.poster,
                createdAt: s.createdAt,
                link: `/serie/${s.slug}`,
                message: "New series added"
            })),
            ...shorts.map((s: any) => ({
                id: s._id,
                title: s.title,
                type: "short",
                image: s.poster,
                createdAt: s.createdAt,
                link: `/shorts/${s.slug}`,
                message: "New short film added"
            })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return NextResponse.json({ notifications: notifications.slice(0, limit) }, {
            headers: {
                "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
            },
        })
    } catch (error) {
        console.error("Notifications error:", error)
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        )
    }
}
