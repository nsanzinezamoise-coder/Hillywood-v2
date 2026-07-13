"use client"

import React, { useState } from "react"
import {
    Share2,
    Mail,
    MessageCircle,
    Facebook,
    Copy,
    Check,
    Instagram
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ShareActionsProps {
    title: string
    url: string
}

export function ShareActions({ title, url }: ShareActionsProps) {
    const [copied, setCopied] = useState(false)

    const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url
    const encodedUrl = encodeURIComponent(fullUrl)
    const encodedTitle = encodeURIComponent(`Watch ${title} on RWANDA CINEMA!`)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const shareLinks = [
        {
            name: "WhatsApp",
            icon: <MessageCircle className="h-4 w-4 text-[#25D366]" />,
            href: `https://api.whatsapp.com/send?text=${encodedTitle} ${encodedUrl}`,
        },
        {
            name: "Facebook",
            icon: <Facebook className="h-4 w-4 text-[#1877F2]" />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        },
        {
            name: "Email",
            icon: <Mail className="h-4 w-4 text-gray-500" />,
            href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
        },
    ]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                    <Share2 className="h-5 w-5" />
                    Share
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Share
                </div>
                {shareLinks.map((link) => (
                    <DropdownMenuItem key={link.name} asChild>
                        <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            {link.icon}
                            <span>{link.name}</span>
                        </a>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={handleCopy} className="flex items-center gap-3 cursor-pointer">
                    {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                    )}
                    <span>{copied ? "Copied!" : "Copy Link"}</span>
                </DropdownMenuItem>
                <div className="p-2 mt-1 border-t border-border bg-muted/30 rounded-b-md">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Instagram className="h-3 w-3" />
                        Copy link to share on Instagram
                    </p>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
