import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Short } from "@/lib/models"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await connectToDatabase()

        const short = await Short.findById(id)
            .populate("comments.user", "name avatar")
            .lean()

        if (!short) {
            return NextResponse.json({ error: "Short not found" }, { status: 404 })
        }

        // Return the comments array
        return NextResponse.json(short.comments || [])
    } catch (error) {
        console.error("Fetch short comments error:", error)
        return NextResponse.json(
            { error: "Failed to fetch comments" },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { comment, user } = body

        if (!user) {
            return NextResponse.json(
                { error: "Login required to post comments" },
                { status: 401 }
            )
        }

        if (!comment || comment.trim().length < 2) {
            return NextResponse.json(
                { error: "Comment is too short" },
                { status: 400 }
            )
        }

        await connectToDatabase()

        const short = await Short.findById(id)
        if (!short) {
            return NextResponse.json(
                { error: "Short film not found" },
                { status: 404 }
            )
        }

        // Add to comments array
        const newComment = {
            user: user,
            content: comment.trim(),
            createdAt: new Date()
        }

        short.comments.push(newComment as any)
        await short.save()

        // Populate and return the newly added comment for immediate UI update
        // We can't easily populate after push/save without re-fetching or manual mapping
        // But for response success, returning the basic comment is fine or we re-fetch.

        return NextResponse.json({
            success: true,
            comment: newComment
        })
    } catch (error) {
        console.error("Post short comment error:", error)
        return NextResponse.json(
            { error: "Failed to post comment" },
            { status: 500 }
        )
    }
}
