import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Series, Category } from "@/lib/models"
import { requireRole } from "@/lib/session"

export async function POST(request: NextRequest) {
    try {
        const session = await requireRole(["admin", "moderator"])

        const body = await request.json()
        console.log("Create series body:", JSON.stringify(body, null, 2))

        const {
            title,
            description,
            poster,
            videoUrl,
            downloadurl,
            releaseYear,
            category,
            cast,
            director,
            producer,
            languages,
            featured,
            seasons,
            episodes,
            duration,
            parentSeries,
        } = body

        // Validate required fields
        if (
            !title ||
            !description ||
            !poster ||
            !releaseYear ||
            !category ||
            !seasons
        ) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Verify category exists
        const categoryDoc = await Category.findById(category)
        if (!categoryDoc) {
            return NextResponse.json(
                { error: "Invalid category" },
                { status: 400 }
            )
        }

        // Create series
        const series = await Series.create({
            title,
            slug: title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
            description,
            poster,
            videoUrl,
            downloadurl: downloadurl || "",
            releaseYear,
            category,
            cast: cast || [],
            director: director || "",
            producer: producer || "",
            languages: languages || ["Kinyarwanda"],
            featured: featured === true || featured === "true",
            seasons: seasons || 1,
            episodes: episodes || 0,
            duration: Number(duration) || 0,
            parentSeries: parentSeries || null,
            approvalStatus: "pending",
        })

        console.log("Created series object:", JSON.stringify(series, null, 2))

        // Update category count (maybe we should track separately? for now just inc)
        await Category.findByIdAndUpdate(category, {
            $inc: { movieCount: 1 }, // Reusing movieCount or add seriesCount? Assuming movieCount is generic content count for now
        })

        if (parentSeries) {
            // Count ACTUAL episodes for this parent to ensure accuracy
            const actualCount = await Series.countDocuments({ parentSeries })
            await Series.findByIdAndUpdate(parentSeries, {
                episodes: actualCount
            })
        }

        return NextResponse.json({
            success: true,
            series,
        })
    } catch (error) {
        console.error("Create series error:", error)
        return NextResponse.json(
            { error: "Failed to create series" },
            { status: 500 }
        )
    }
}
