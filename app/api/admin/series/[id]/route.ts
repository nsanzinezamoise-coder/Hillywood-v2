import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Series, Category } from "@/lib/models"
import { requireAdmin } from "@/lib/session"

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAdmin()
        const { id } = await params
        const body = await request.json()
        console.log("Update series body:", JSON.stringify(body, null, 2))

        // Destructure to prevent overwriting protected fields if any
        const {
            title,
            slug,
            description,
            poster,
            videoUrl,
            downloadurl,
            releaseYear,
            languages,
            category,
            cast,
            director,
            producer,
            featured,
            seasons,
            episodes,
            duration,
            parentSeries,
        } = body

        if (!title || !description || !poster || !category) {
            return NextResponse.json(
                { error: "Missing required fields: title, description, poster and category are required" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        // Fetch existing series BEFORE update so we can compare old title
        const existingSeries = await Series.findById(id).lean() as { title?: string } | null
        const oldTitle = existingSeries?.title || ""

        // Verify category exists if changed
        if (category) {
            const categoryDoc = await Category.findById(category)
            if (!categoryDoc) {
                return NextResponse.json(
                    { error: "Invalid category" },
                    { status: 400 }
                )
            }
        }

        // Compute slug from submitted value or auto-generate from title
        const computedSlug = (slug && slug.trim())
            ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
            : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

        const series = await Series.findByIdAndUpdate(
            id,
            {
                title,
                slug: computedSlug,
                description,
                poster,
                videoUrl,
                downloadurl,
                releaseYear,
                languages: languages || [],
                category,
                cast: cast || [],
                director: director || "",
                producer: producer || "",
                featured: featured === true || featured === "true",
                seasons: seasons || 1,
                episodes: episodes || 0,
                duration: Number(duration) || 0,
                parentSeries: parentSeries || null,
            },
            { new: true }
        )

        // If this is a base series (no parent), update its child episodes
        let updatedEpisodesCount = 0
        if (!parentSeries) {
            // Fetch current children so we can update title/slug per-episode
            const children = await Series.find({ parentSeries: id }).lean() as Array<{ _id: unknown; title?: string }>

            // Escape special regex characters in oldTitle
            const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

            const childUpdateOps = children.map((child) => {
                // Replace old series name prefix in child title → new series name
                const oldChildTitle = child.title || ""
                const newChildTitle = oldTitle && oldChildTitle.toLowerCase().startsWith(oldTitle.toLowerCase())
                    ? title + oldChildTitle.slice(oldTitle.length)
                    : oldChildTitle.replace(
                        new RegExp(`^${escapeRegex(oldTitle)}`, "i"),
                        title
                    )
                const newChildSlug = newChildTitle
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "")

                return Series.findByIdAndUpdate(child._id, {
                    $set: {
                        title: newChildTitle,
                        slug: newChildSlug,
                        category,
                        languages: languages || [],
                        director: director || "",
                        producer: producer || "",
                        releaseYear,
                        cast: cast || [],
                        poster,
                        description,
                    }
                })
            })

            const results = await Promise.all(childUpdateOps)
            updatedEpisodesCount = results.filter(Boolean).length
        }

        console.log("Updated series object:", JSON.stringify(series, null, 2))

        if (!series) {
            return NextResponse.json(
                { error: "Series not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            series,
            updatedEpisodesCount,
        })
    } catch (error) {
        console.error("Update series error:", error)
        return NextResponse.json(
            { error: "Failed to update series" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAdmin()
        const { id } = await params

        await connectToDatabase()

        // Get series to decrement category count later if needed
        const series = await Series.findById(id)
        if (!series) {
            return NextResponse.json(
                { error: "Series not found" },
                { status: 404 }
            )
        }

        await Series.findByIdAndDelete(id)

        // Ideally decrement category count here

        return NextResponse.json({
            success: true,
            message: "Series deleted successfully"
        })

    } catch (error) {
        console.error("Delete series error:", error)
        return NextResponse.json(
            { error: "Failed to delete series" },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAdmin()
        const { id } = await params

        await connectToDatabase()

        const series = await Series.findById(id).lean()

        if (!series) {
            return NextResponse.json(
                { error: "Series not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(series)

    } catch (error) {
        console.error("Get series error:", error)
        return NextResponse.json(
            { error: "Failed to fetch series" },
            { status: 500 }
        )
    }
}
