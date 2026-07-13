import mongoose, { Schema, Document, Model } from "mongoose"
import { Language, ApprovalStatus } from "./movie"

export interface ISeries extends Document {
    _id: mongoose.Types.ObjectId
    title: string
    slug: string
    description: string
    poster: string
    videoUrl?: string // Optional for series parent, maybe episodes have URLs
    downloadurl?: string
    releaseYear: number
    languages: Language[]
    category: mongoose.Types.ObjectId
    cast: string[]
    director?: string
    producer?: string
    rating: number
    ratingCount: number
    views: number
    featured: boolean
    approvalStatus: ApprovalStatus
    approvedBy?: mongoose.Types.ObjectId
    approvedAt?: Date
    seasons: number
    episodes: number
    duration: number // in minutes
    parentSeries?: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date
}

const SeriesSchema = new Schema<ISeries>(
    {
        title: {
            type: String,
            required: [true, "Series title is required"],
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
        description: {
            type: String,
            required: [true, "Description is required"],
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
        poster: {
            type: String,
            required: [true, "Poster image is required"],
        },
        videoUrl: {
            type: String, // Trailer or first episode? Keeping it optional or string for now
        },
        downloadurl: {
            type: String,
            default: "",
        },
        releaseYear: {
            type: Number,
            required: [true, "Release year is required"],
            min: [1900, "Release year must be after 1900"],
            max: [new Date().getFullYear() + 1, "Invalid release year"],
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },
        languages: {
            type: [String],
            default: ["Kinyarwanda"],
        },
        cast: [
            {
                type: String,
                trim: true,
            },
        ],
        director: {
            type: String,
            trim: true,
        },
        producer: {
            type: String,
            trim: true,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        ratingCount: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
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
        seasons: {
            type: Number,
            default: 1,
        },
        episodes: {
            type: Number,
            default: 0,
        },
        duration: {
            type: Number,
            default: 0,
        },
        parentSeries: {
            type: Schema.Types.ObjectId,
            ref: "Series",
        }
    },
    {
        timestamps: true,
    }
)

// Create slug from title before saving
SeriesSchema.pre("save", function () {
    if (this.isModified("title")) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
    }
})

SeriesSchema.index({ title: "text", description: "text" })
SeriesSchema.index({ category: 1, approvalStatus: 1 })
SeriesSchema.index({ releaseYear: 1 })
SeriesSchema.index({ featured: 1, approvalStatus: 1 })

if (mongoose.models.Series) {
    delete mongoose.models.Series;
}

const Series: Model<ISeries> = mongoose.model<ISeries>("Series", SeriesSchema)

export default Series
