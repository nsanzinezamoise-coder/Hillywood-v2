import mongoose, { Schema, Document, Model } from "mongoose"

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId | null
  guestName?: string
  movie?: mongoose.Types.ObjectId
  series?: mongoose.Types.ObjectId
  rating: number
  comment: string
  likes: number
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    guestName: {
      type: String,
      required: false,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    movie: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: function () { return !this.series },
    },
    series: {
      type: Schema.Types.ObjectId,
      ref: "Series",
      required: function () { return !this.movie },
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Ensure one review per user per movie or per series, and allow multiple guest reviews (no unique index for guestName)
ReviewSchema.index(
  { user: 1, movie: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' }, movie: { $exists: true } } }
)
ReviewSchema.index(
  { user: 1, series: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' }, series: { $exists: true } } }
)

// Update movie or series rating when review is added
ReviewSchema.post("save", async function () {
  if (this.movie) {
    const Movie = mongoose.model("Movie")
    const reviews = await mongoose
      .model("Review")
      .find({ movie: this.movie })
      .select("rating")
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0
    await Movie.findByIdAndUpdate(this.movie, {
      rating: Math.round(avgRating * 10) / 10,
      ratingCount: reviews.length,
    })
  } else if (this.series) {
    const Series = mongoose.model("Series")
    const reviews = await mongoose
      .model("Review")
      .find({ series: this.series })
      .select("rating")
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0
    await Series.findByIdAndUpdate(this.series, {
      rating: Math.round(avgRating * 10) / 10,
      ratingCount: reviews.length,
    })
  }
})

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema)

export default Review
