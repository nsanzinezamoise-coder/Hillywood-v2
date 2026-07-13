import mongoose, { Schema, Document, Model } from "mongoose"
import { ApprovalStatus } from "./movie"

export interface IShortComment {
    user: mongoose.Types.ObjectId
    content: string
    createdAt: Date
}

export interface IShort extends Document {
    _id: mongoose.Types.ObjectId
    title: string
    slug: string
    videoUrl: string
    category: mongoose.Types.ObjectId
    views: number
    likes: number
    shares: number
    saves: number
    comments: IShortComment[]
    featured: boolean
    approvalStatus: ApprovalStatus
    approvedBy?: mongoose.Types.ObjectId
    approvedAt?: Date
    tags: string[]
    createdAt: Date
    updatedAt: Date
}

const CommentSchema = new Schema<IShortComment>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

const ShortSchema = new Schema<IShort>(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        videoUrl: {
            type: String,
            required: [true, "Video URL is required"],
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },
        views: {
            type: Number,
            default: 0,
        },
        likes: {
            type: Number,
            default: 0,
        },
        shares: {
            type: Number,
            default: 0,
        },
        saves: {
            type: Number,
            default: 0,
        },
        comments: [CommentSchema],
        featured: {
            type: Boolean,
            default: false,
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        approvedAt: {
            type: Date,
        },
        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],
    },
    {
        timestamps: true,
    }
)

// Create slug from title before saving
ShortSchema.pre("save", function () {
    if (this.isModified("title")) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
    }
})

ShortSchema.index({ title: "text", tags: "text" })
ShortSchema.index({ category: 1, approvalStatus: 1 })
ShortSchema.index({ featured: 1, approvalStatus: 1 })

// Delete model if it exists to allow for schema changes during development
if (mongoose.models && mongoose.models.Short) {
    delete mongoose.models.Short
}

const Short: Model<IShort> =
    mongoose.model<IShort>("Short", ShortSchema)

export default Short
