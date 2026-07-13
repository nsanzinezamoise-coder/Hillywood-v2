"use client";

import { useState } from "react";
import {
    Bell,
    Film,
    Star,
    CreditCard,
    Shield,
    Clock,
    ChevronLeft,
    CheckCircle2,
    X,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    type: "release" | "account" | "system" | "rating";
    read: boolean;
}

const initialNotifications: Notification[] = [
    {
        id: "1",
        title: "New Movie Release: Imana Yanjye",
        description: "Explore the latest addition to our collection. Stream it in 4K now!",
        time: "2 hours ago",
        type: "release",
        read: false
    },
    {
        id: "2",
        title: "Subscription Renewed Successfully",
        description: "Your Premium plan has been renewed for another month. Enjoy unlimited streaming!",
        time: "1 day ago",
        type: "account",
        read: true
    },
    {
        id: "3",
        title: "Watchlist Update",
        description: "A movie in your watchlist 'Urugendo' is leaving soon. Watch it before it's gone.",
        time: "2 days ago",
        type: "release",
        read: true
    },
    {
        id: "4",
        title: "New Login Detected",
        description: "Your account was logged in from a new device in Kigali, Rwanda.",
        time: "3 days ago",
        type: "system",
        read: false
    }
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const router = useRouter();

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "release": return <Film className="w-5 h-5 text-red-400" />;
            case "account": return <CreditCard className="w-5 h-5 text-green-400" />;
            case "system": return <Shield className="w-5 h-5 text-blue-400" />;
            case "rating": return <Star className="w-5 h-5 text-yellow-500" />;
            default: return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <main className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/")}
                            className="text-foreground hover:bg-primary/10 cursor-pointer"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <h1 className="text-xl font-bold">Notifications</h1>
                    </div>
                    {notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            onClick={clearAll}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2 cursor-pointer"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </Button>
                    )}
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Notification Stats Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-transparent border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                <Bell className="w-5 h-5 text-red-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">Unread</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{notifications.filter(n => !n.read).length}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-transparent border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">Total</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{notifications.length}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-purple-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">Today</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">2</p>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {notifications.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/20"
                            >
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                    <Bell className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
                                <p className="text-muted-foreground">We'll notify you when something important happens.</p>
                            </motion.div>
                        ) : (
                            notifications.map((n) => (
                                <motion.div
                                    key={n.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`relative p-5 rounded-2xl border transition-all group ${n.read
                                        ? "bg-card border-border shadow-sm"
                                        : "bg-card border-primary/30 shadow-lg shadow-primary/5"
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${n.read ? "bg-muted" : "bg-primary/10"
                                            }`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-8">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-semibold truncate ${!n.read && "text-primary"}`}>
                                                    {n.title}
                                                </h3>
                                                {!n.read && (
                                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                {n.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {n.time}
                                                </span>
                                                {n.type === "release" && (
                                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                        New Content
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!n.read && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => markAsRead(n.id)}
                                                className="w-8 h-8 rounded-full bg-background border border-border hover:bg-green-500/10 text-green-500 shadow-sm cursor-pointer"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(n.id)}
                                            className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center hover:bg-destructive/10 text-destructive shadow-sm cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}
