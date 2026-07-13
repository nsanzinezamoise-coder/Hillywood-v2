"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { useAuth } from "@/lib/auth-context"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MoreVertical, Shield, User, Ban, Crown } from "lucide-react"
import { format } from "date-fns"

interface UserData {
  _id: string
  name: string
  email: string
  avatar?: string
  role: "user" | "admin" | "moderator"
  subscription: {
    tier: "free" | "basic" | "premium"
    status: "active" | "cancelled" | "expired"
  }
  isActive: boolean
  createdAt: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminUsersPage() {
  const { user: currentUser, refreshUser } = useAuth()
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [subscriptionFilter, setSubscriptionFilter] = useState("all")

  const { data, isLoading, mutate } = useSWR<{ users: UserData[] }>(
    `/api/admin/users?search=${search}&role=${roleFilter}&subscription=${subscriptionFilter}`,
    fetcher
  )

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      mutate()

      // If updating current user's role, refresh the auth context
      if (currentUser?.id === userId) {
        await refreshUser()
      }
    } catch (error) {
      console.error("Failed to update role:", error)
    }
  }

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      mutate()
    } catch (error) {
      console.error("Failed to toggle status:", error)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        )
      case "moderator":
        return (
          <Badge className="bg-red-500/10/10 text-accent-foreground border-accent/20">
            <Shield className="w-3 h-3 mr-1" />
            Moderator
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <User className="w-3 h-3 mr-1" />
            User
          </Badge>
        )
    }
  }

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case "premium":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Premium</Badge>
      case "basic":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Basic</Badge>
      default:
        return <Badge variant="outline">Free</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Subscription" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="free">Free</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : (!data || !data.users || data.users.length === 0) ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  {data ? "No users found" : "Error loading users"}
                </TableCell>
              </TableRow>
            ) : (
              data?.users?.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getSubscriptionBadge(user.subscription?.tier || "free")}</TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Suspended</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {currentUser?.role === "admin" && (
                          <>
                            <DropdownMenuItem onClick={() => handleRoleChange(user._id, "admin")}>
                              <Crown className="w-4 h-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(user._id, "moderator")}>
                              <Shield className="w-4 h-4 mr-2" />
                              Make Moderator
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(user._id, "user")}>
                              <User className="w-4 h-4 mr-2" />
                              Make User
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className={user.isActive ? "text-destructive" : ""}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          {user.isActive ? "Suspend User" : "Activate User"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
