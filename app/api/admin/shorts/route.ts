import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Short, Category } from "@/lib/models"
import { requireRole } from "@/lib/session"

export async function POST(request: NextRequest) {
    try {
        const session = await requireRole(["admin", "moderator"])

        const body = await request.json()
        const {
            title,
            videoUrl,
            category,
            featured,
            tags,
        } = body

        // Validate required fields
        if (
            !title ||
            !videoUrl ||
            !category
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

        // Create short
        const short = await Short.create({
            title,
            slug: title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
            videoUrl,
            category,
            featured: featured || false,
            tags: tags || [],
            approvalStatus: "pending",
        })

        // Update category movie count
        await Category.findByIdAndUpdate(category, {
            $inc: { movieCount: 1 },
        })

        return NextResponse.json({
            success: true,
            short,
        })
    } catch (error) {
        console.error("Create short error:", error)
        return NextResponse.json(
            { error: "Failed to create short film" },
            { status: 500 }
        )
    }
}
