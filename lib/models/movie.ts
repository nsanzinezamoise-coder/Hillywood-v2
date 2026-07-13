import mongoose, { Schema, Document, Model } from "mongoose"

export type Language = "Kinyarwanda" | "English" | "French"
export type ApprovalStatus = "pending" | "approved" | "rejected"

export interface IMovie extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  slug: string
  description: string
  synopsis?: string
  poster: string
  backdrop?: string
  trailer?: string
  videoUrl: string
  downloadUrl?: string
  duration: number // in minutes
  releaseYear: number
  languages: Language[]
  subtitles: Language[]
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
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const MovieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: [true, "Movie title is required"],
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
    synopsis: {
      type: String,
      maxlength: [2000, "Synopsis cannot exceed 2000 characters"],
      required: false,
    },
    poster: {
      type: String,
      required: [true, "Poster image is required"],
    },
    backdrop: {
      type: String,
      default: "",
      required: false,
    },
    trailer: {
      type: String,
      default: "",
      required: false,
    },
    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },
    downloadUrl: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    releaseYear: {
      type: Number,
      required: [true, "Release year is required"],
      min: [1900, "Release year must be after 1900"],
      max: [new Date().getFullYear() + 1, "Invalid release year"],
    },
    languages: {
      type: [String],
      enum: ["Kinyarwanda", "English", "French"],
      required: true,
    },
    subtitles: {
      type: [String],
      enum: ["Kinyarwanda", "English", "French"],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
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
      required: false,
    },
    producer: {
      type: String,
      trim: true,
      required: false,
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
// Create slug from title before saving
MovieSchema.pre("save", function () {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
})

// Index for search and filtering
MovieSchema.index({ title: "text", description: "text", tags: "text" })
MovieSchema.index({ category: 1, approvalStatus: 1 })
MovieSchema.index({ releaseYear: 1 })
MovieSchema.index({ featured: 1, approvalStatus: 1 })

const Movie: Model<IMovie> =
  mongoose.models.Movie || mongoose.model<IMovie>("Movie", MovieSchema)

export default Movie
