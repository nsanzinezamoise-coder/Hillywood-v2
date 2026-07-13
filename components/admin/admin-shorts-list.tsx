"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2, Eye, Check, X, MessageCircle } from "lucide-react"

interface Short {
    _id: string
    title: string
    slug: string
    views: number
    comments?: any[]
    approvalStatus: "pending" | "approved" | "rejected"
    category?: {
        name: string
        slug: string
    }
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface AdminShortsListProps {
    shorts: Short[]
    pagination: Pagination
    currentStatus: string
}

export function AdminShortsList({
    shorts,
    pagination,
    currentStatus,
}: AdminShortsListProps) {
    const router = useRouter()
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState<string | null>(null)

    // Dropdown menu item hover styles
    const dropdownItemClasses = "hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white cursor-pointer"

    const handleApprovalAction = async (
        shortId: string,
        action: "approve" | "reject"
    ) => {
        setIsLoading(shortId)
        try {
            const response = await fetch(`/api/admin/shorts/${shortId}/approval`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            })

            if (response.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to update approval status:", error)
        } finally {
            setIsLoading(null)
        }
    }

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams()
        if (status !== "all") params.set("status", status)
        router.push(`/admin/shorts${params.toString() ? `?${params}` : ""}`)
    }

    const handleDelete = async (shortId: string) => {
        if (!confirm("Are you sure you want to delete this short film?")) return

        setIsLoading(shortId)
        try {
            const response = await fetch(`/api/admin/shorts/${shortId}`, {
                method: "DELETE",
            })

            if (response.ok) {
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to delete short film:", error)
        } finally {
            setIsLoading(null)
        }
    }

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            case "pending":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
            case "rejected":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
        }
    }

    return (
        <div>
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <Select value={currentStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Shorts</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>

                <span className="text-sm text-muted-foreground">
                    Showing {shorts.length} of {pagination.total} shorts
                </span>
            </div>

            {/* Table */}
            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Short Film</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Comments</TableHead>
                            <TableHead>Views</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shorts.map((item) => (
                            <TableRow key={item._id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-medium line-clamp-1">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                /{item.slug}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{item.category?.name || "-"}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="h-3.5 w-3.5 text-blue-400" />
                                        {item.comments?.length || 0}
                                    </div>
                                </TableCell>
                                <TableCell>{item.views.toLocaleString()}</TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(item.approvalStatus)}`}
                                    >
                                        {item.approvalStatus}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={isLoading === item._id}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild className={dropdownItemClasses}>
                                                <Link href={`/shorts/${item.slug}`} target="_blank">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View
                                                </Link>
                                            </DropdownMenuItem>
                                            {user?.role === "admin" && (
                                                <>
                                                    <DropdownMenuItem asChild className={dropdownItemClasses}>
                                                        <Link href={`/admin/shorts/${item._id}/edit`}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {item.approvalStatus !== "approved" && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleApprovalAction(item._id, "approve")
                                                            }
                                                            className={dropdownItemClasses}
                                                        >
                                                            <Check className="h-4 w-4 mr-2" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                    )}
                                                    {item.approvalStatus !== "rejected" && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleApprovalAction(item._id, "reject")
                                                            }
                                                            className={dropdownItemClasses}
                                                        >
                                                            <X className="h-4 w-4 mr-2" />
                                                            Reject
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(item._id)}
                                                        className={`${dropdownItemClasses} text-destructive focus:text-destructive`}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                        (page) => (
                            <Button
                                key={page}
                                variant={page === pagination.page ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    const params = new URLSearchParams()
                                    if (currentStatus !== "all")
                                        params.set("status", currentStatus)
                                    if (page > 1) params.set("page", page.toString())
                                    router.push(
                                        `/admin/shorts${params.toString() ? `?${params}` : ""}`
                                    )
                                }}
                                className={page !== pagination.page ? "hover:bg-red-500 hover:text-white dark:hover:bg-red-600 dark:hover:text-white" : ""}
                            >
                                {page}
                            </Button>
                        )
                    )}


                </div>
            )}

            {shorts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No short films found</p>
                </div>
            )}
        </div>
    )
}