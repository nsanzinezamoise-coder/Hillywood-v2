"use client"

import { useEffect, useRef, useState, createContext, useContext } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "@/lib/auth-context"

export interface LiveCounts {
  total: number
  accounts: number
  visitors: number
}

interface LiveUsersContextType {
  liveCounts: LiveCounts
  isConnected: boolean
}

const LiveUsersContext = createContext<LiveUsersContextType>({
  liveCounts: { total: 0, accounts: 0, visitors: 0 },
  isConnected: false,
})

export function useLiveUsers() {
  return useContext(LiveUsersContext)
}

export function LiveUsersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)

  const [liveCounts, setLiveCounts] = useState<LiveCounts>({ total: 0, accounts: 0, visitors: 0 })
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // We fetch the API to initialize the socket server in Next.js backend
    fetch("/api/socket").then(() => {
      const socket = io({
        path: "/api/socketio",
        query: { userId: user?.id || "" },
        addTrailingSlash: false,
      })

      socketRef.current = socket

      socket.on("connect", () => {
        setIsConnected(true)
      })

      socket.on("live-users-update", (data: LiveCounts) => {
        setLiveCounts(data)
      })

      socket.on("disconnect", () => {
        setIsConnected(false)
      })
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [user?.id])

  return (
    <LiveUsersContext.Provider value={{ liveCounts, isConnected }}>
      {children}
    </LiveUsersContext.Provider>
  )
}
