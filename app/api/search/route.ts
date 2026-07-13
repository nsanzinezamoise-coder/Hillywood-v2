import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie, Series, Short } from "@/lib/models"

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase()

        const { searchParams } = new URL(request.url)
        const query = searchParams.get("q")?.trim()

        if (!query) {
            return NextResponse.json({ results: [] }, {
                headers: {
                    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
                },
            })
        }
        const limit = Math.min(20, Math.max(10, parseInt(searchParams.get("limit") || "10")))

        const searchRegex = { $regex: query, $options: "i" }
        const searchQuery = {
            approvalStatus: "approved",
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { tags: searchRegex },
            ],
        }

        // Execute searches in parallel
        const [movies, series, shorts] = await Promise.all([
            Movie.find(searchQuery).populate("category", "name").limit(limit).lean(),
            Series.find(searchQuery).populate("category", "name").limit(limit).lean(),
            Short.find(searchQuery).populate("category", "name").limit(limit).lean(),
        ])

        // Combine and format results
        const results = [
            ...movies.map((m: any) => ({ ...m, type: "movie", link: `/movie/${m.slug}` })),
            ...series.map((s: any) => ({ ...s, type: "series", link: `/serie/${s.slug}` })),
            ...shorts.map((s: any) => ({ ...s, type: "short", link: `/shorts/${s.slug}` })),
        ]

        return NextResponse.json({ results }, {
            headers: {
                "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
            },
        })
    } catch (error) {
        console.error("Search error:", error)
        return NextResponse.json(
            { error: "Failed to perform search" },
            { status: 500 }
        )
    }
}
