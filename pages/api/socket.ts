import { Server as SocketIOServer } from "socket.io"
import type { NextApiRequest, NextApiResponse } from "next"

// Extend the Next.js server type to include our socket.io instance
export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: any
  }
}

// In-memory tracking of connected users
const activeUsers = new Map<string, { userId: string | null; timestamp: number }>()

function getLiveCounts() {
  const users = Array.from(activeUsers.values())
  const accounts = new Set(users.filter((u) => u.userId).map((u) => u.userId)).size
  const visitors = users.filter((u) => !u.userId).length
  return {
    total: users.length,
    accounts,
    visitors,
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  // If Socket.IO is already running, just respond OK
  if ((res.socket as any).server.io) {
    res.status(200).json({ status: "Socket.IO already running" })
    return
  }

  console.log("⚡ Initializing Socket.IO server...")

  const io = new SocketIOServer((res.socket as any).server, {
    path: "/api/socketio",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingInterval: 5000,
    pingTimeout: 10000,
    addTrailingSlash: false,
  })

  io.on("connection", (socket) => {
    const userId = (socket.handshake.query.userId as string) || null
    activeUsers.set(socket.id, { userId, timestamp: Date.now() })

    // Broadcast updated counts to ALL connected clients
    io.emit("live-users-update", getLiveCounts())

    socket.on("disconnect", () => {
      activeUsers.delete(socket.id)
      io.emit("live-users-update", getLiveCounts())
    })
  })

  // Attach the io instance to the server so we don't re-init
  ;(res.socket as any).server.io = io

  res.status(200).json({ status: "Socket.IO initialized" })
}
