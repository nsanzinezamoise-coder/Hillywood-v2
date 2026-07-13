import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Movie, Series, Short } from "@/lib/models"

export async function POST(request: NextRequest) {
    try {
        const { id, type } = await request.json()

        if (!id || !type) {
            return NextResponse.json(
                { error: "ID and Type (movie/series) are required" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        if (type === "movie") {
            await Movie.findByIdAndUpdate(id, { $inc: { views: 1 } })
        } else if (type === "series") {
            await Series.findByIdAndUpdate(id, { $inc: { views: 1 } })
        } else if (type === "short") {
            await Short.findByIdAndUpdate(id, { $inc: { views: 1 } })
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("View increment error:", error)
        return NextResponse.json(
            { error: "Failed to increment view" },
            { status: 500 }
        )
    }
}