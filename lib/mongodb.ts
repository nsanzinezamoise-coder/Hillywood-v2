import mongoose from "mongoose"


interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var myMongoose: MongooseCache | undefined
}

let cached = global.myMongoose

if (!cached) {
  cached = global.myMongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable")
  }

  if (cached!.conn) {
    return cached!.conn
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      // Pool sizing — keep connections alive across serverless invocations
      maxPoolSize: 10,
      minPoolSize: 2,
      // Fail fast if MongoDB is unreachable
      serverSelectionTimeoutMS: 5000,
      // Close idle sockets after 45s to avoid stale connections
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    }

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    throw e
  }

  return cached!.conn
}
