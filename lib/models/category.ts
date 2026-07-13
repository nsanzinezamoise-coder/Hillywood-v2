import mongoose, { Schema, Document, Model } from "mongoose"

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId
  name: string
  slug: string
  description?: string
  image?: string
  movieCount: number
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
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
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
      type: String,
      default: "",
    },
    movieCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Create slug from name before saving
// Create slug from name before saving
CategorySchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }
})

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema)

export default Category
