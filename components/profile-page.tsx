"use client";

import { useState, useEffect, useRef } from "react";
import {
    User,
    Settings,
    Download,
    Heart,
    Clock,
    Bell,
    Globe,
    CreditCard,
    Shield,
    LogOut,
    ChevronRight,
    ChevronLeft,
    Play,
    Edit3,
    Camera,
    Star,
    Trash2,
    Wifi,
    WifiOff,
    Check,
    X,
    Eye,
    EyeOff,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface UserProfile {
    name: string;
    email: string;
    avatar: string;
    role: string;
    plan: string;
    joinedDate: string;
    watchTime: string;
    moviesWatched: number;
    downloads: number;
}

const defaultProfile: UserProfile = {
    name: "Loading...",
    email: "...",
    avatar: "",
    role: "user",
    plan: "Premium", // Default or fetched if available
    joinedDate: "January 2024",
    watchTime: "156 hours",
    moviesWatched: 47,
    downloads: 12,
};


type TabType = "overview" | "downloads" | "history" | "Watch list";

export default function ProfilePage() {
    const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("downloads");
    const [notifications, setNotifications] = useState(true);
    const [autoPlay, setAutoPlay] = useState(true);
    const [downloadWifi, setDownloadWifi] = useState(true);
    const [hdPlayback, setHdPlayback] = useState(true);
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(false);
    
    // Downloads and History State
    const [downloads, setDownloads] = useState<any[]>([]);
    const [isLoadingDownloads, setIsLoadingDownloads] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeTab === "Watch list" && watchlist.length === 0) {
            fetchWatchlist();
        } else if (activeTab === "downloads" && downloads.length === 0) {
            fetchDownloads();
        } else if (activeTab === "history" && history.length === 0) {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchDownloads = async () => {
        setIsLoadingDownloads(true);
        try {
            const res = await fetch("/api/downloads");
            const data = await res.json();
            if (res.ok) {
                setDownloads(data.downloads || []);
            }
        } catch (error) {
            console.error("Failed to fetch downloads:", error);
        } finally {
            setIsLoadingDownloads(false);
        }
    };

    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const res = await fetch("/api/history");
            const data = await res.json();
            if (res.ok) {
                setHistory(data.history || []);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const fetchWatchlist = async () => {
        setIsLoadingWatchlist(true);
        try {
            const res = await fetch("/api/watchlist");
            const data = await res.json();
            if (res.ok) {
                setWatchlist(data.watchlist || []);
            }
        } catch (error) {
            console.error("Failed to fetch watchlist:", error);
        } finally {
            setIsLoadingWatchlist(false);
        }
    };

    const handleRemoveFromWatchlist = async (id: string, type: string) => {
        try {
            const res = await fetch(`/api/watchlist?${type}Id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setWatchlist(prev => prev.filter(item => item._id !== id));
            }
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    const handleRemoveFromDownloads = async (id: string, type: string) => {
        try {
            const res = await fetch(`/api/downloads?${type}Id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setDownloads(prev => prev.filter(item => item._id !== id));
            }
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    const handleClearHistory = async () => {
        try {
            const res = await fetch(`/api/history?clearAll=true`, {
                method: "DELETE",
            });
            if (res.ok) {
                setHistory([]);
            }
        } catch (error) {
            console.error("Failed to clear history", error);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push("/");
        }
    };

    const [isUploading, setIsUploading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { user, refreshUser } = useAuth();

    // Edit modal form state
    const [editFormData, setEditFormData] = useState({
        name: "",
        email: "",
        password: "",
        currentPassword: "",
        avatar: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [editError, setEditError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleEditSuccess = () => {
        if (user) {
            setUserProfile(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
                avatar: user.avatar || prev.avatar,
            }));
        }
    };

    // Initialize form when modal opens
    useEffect(() => {
        if (isEditModalOpen && user) {
            setEditFormData({
                name: user.name || "",
                email: user.email || "",
                password: "",
                currentPassword: "",
                avatar: user.avatar || "",
            });
            setEditError("");
        }
    }, [isEditModalOpen, user]);

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditError("");
        setIsSaving(true);

        try {
            const updateData: any = {};

            if (editFormData.name.trim() && editFormData.name !== user?.name) {
                updateData.name = editFormData.name.trim();
            }

            if (editFormData.email.trim() && editFormData.email !== user?.email) {
                updateData.email = editFormData.email.trim();
            }

            if (editFormData.avatar && editFormData.avatar !== user?.avatar) {
                updateData.avatar = editFormData.avatar;
            }

            if (editFormData.password) {
                if (!editFormData.currentPassword) {
                    setEditError("Current password is required to change password");
                    setIsSaving(false);
                    return;
                }
                updateData.password = editFormData.password;
                updateData.currentPassword = editFormData.currentPassword;
            }

            if (Object.keys(updateData).length === 0) {
                setEditError("No changes to save");
                setIsSaving(false);
                return;
            }

            const response = await fetch("/api/auth/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update profile");
            }

            await refreshUser();
            handleEditSuccess();
            setIsEditModalOpen(false);
        } catch (err: any) {
            setEditError(err.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setEditError("Image size must be less than 10MB");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setEditError("Please select an image file");
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Image = reader.result as string;
            setEditFormData(prev => ({ ...prev, avatar: base64Image }));
            setIsUploading(false);
        };
        reader.onerror = () => {
            setEditError("Failed to read image file");
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (optional but recommended for base64)
            if (file.size > 2 * 1024 * 1024) {
                alert("File too large. Please select an image under 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result as string;

                // Optimistic UI update
                setUserProfile(prev => ({ ...prev, avatar: base64Image }));

                setIsUploading(true);
                try {
                    const response = await fetch("/api/auth/profile", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ avatar: base64Image }),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to save image");
                    }

                    await refreshUser(); // Sync header
                    console.log("Profile image saved to database");
                } catch (error) {
                    console.error("Upload failed", error);
                    alert("Failed to save profile image. Please try again.");
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (user) {
            setUserProfile(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                role: user.role || prev.role,
                avatar: user.avatar || prev.avatar || "",
            }));
        } else {
            // Reset to defaults when user logs out
            setUserProfile(defaultProfile);
        }
    }, [user]);

    useEffect(() => {
        // Fetch stats separately if needed, but for now we have them in the initial state
        setLoading(false);
    }, []);

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [

        { id: "downloads", label: "Downloads", icon: <Download className="w-4 h-4" /> },
        { id: "history", label: "Watch History", icon: <Clock className="w-4 h-4" /> },
        { id: "Watch list", label: "Watch list", icon: <Heart className="w-4 h-4" /> },

    ];

    return (
        <main className="min-h-screen bg-background text-foreground">


            <div className="max-w-6xl mx-auto px-4 py-8">

                <div className="absolute top-24 right-4">
                    <Button
                        variant="ghost"
                        className="  text-muted-foreground hover:bg-red-500/10 hover:text-foreground cursor-pointer"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Logout
                    </Button>
                </div>
                {/* Profile Header */}
                <div className="relative mb-8">

                    <div className="h-32 rounded-3xl bg-gradient-to-r from-red-600/20 via-cyan-500/20 to-red-600/20 overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80')] bg-cover bg-center opacity-30" />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-8 px-4 sm:px-8">
                        <div className="relative group">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-background bg-card shadow-xl ring-2 ring-primary/20 relative">
                                {userProfile.avatar && userProfile.avatar !== "/placeholder.svg" ? (
                                    <Image
                                        src={userProfile.avatar}
                                        alt={userProfile.name}
                                        fill
                                        className="object-cover"
                                        unoptimized={userProfile.avatar.startsWith('data:')}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                                        <span className="text-3xl font-bold text-primary-foreground">
                                            {userProfile.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    fileInputRef.current?.click()
                                }}
                                disabled={isUploading}
                                className={`absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center border-4 border-background text-white shadow-xl transition-all cursor-pointer z-10 ${isUploading ? "bg-muted cursor-not-allowed" : "bg-primary hover:bg-primary/90 hover:scale-110"
                                    }`}
                            >
                                {isUploading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Camera className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        <div className="flex-1 text-center sm:text-left sm:pb-2">
                            <div className="flex items-center justify-center sm:justify-start gap-2 h-10">
                                <h1 className="text-2xl font-bold text-foreground">{userProfile.name}</h1>
                                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-cyan-500 text-xs font-semibold text-white shadow-sm">
                                    {userProfile.plan}
                                </span>
                            </div>
                            <p className="text-muted-foreground text-sm mt-1">{userProfile.email}</p>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    console.log("Edit Profile button clicked!")
                                    setIsEditModalOpen(true)
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                                onMouseUp={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto"
                                style={{
                                    cursor: 'pointer',
                                    minWidth: '140px',
                                    pointerEvents: 'auto',
                                    userSelect: 'none',
                                    WebkitTapHighlightColor: 'transparent',
                                    touchAction: 'manipulation',
                                    position: 'relative',
                                    zIndex: 10,
                                    border: 'none',
                                    outline: 'none'
                                }}
                                aria-label="Edit Profile"
                                tabIndex={0}
                                role="button"
                            >
                                <Edit3 className="w-4 h-4" style={{ pointerEvents: 'none' }} />
                                <span style={{ pointerEvents: 'none' }}>Edit Profile</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${activeTab === tab.id
                                ? "bg-primary text-primary-foreground font-semibold shadow-md"
                                : "bg-card text-muted-foreground border border-border hover:bg-red-500/10 hover:text-foreground"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "downloads" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">Downloaded Movies & Series</h2>
                                <p className="text-sm text-muted-foreground">{downloads.length} items</p>
                            </div>
                        </div>

                        {isLoadingDownloads ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        ) : downloads.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground">
                                You haven't downloaded anything yet.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {downloads.map((item) => (
                                    <div key={item._id} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border group">
                                        <div className="relative w-20 h-28 rounded-xl overflow-hidden flex-shrink-0">
                                            <Image src={item.poster || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Play className="w-8 h-8 text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg">{item.title}</h3>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary">
                                                    {item.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/${item.type === 'movie' ? 'movie' : 'serie'}/${item.slug}`}>
                                                <Button size="sm" className="bg-white text-black hover:bg-white/90 gap-2">
                                                    <Play className="w-4 h-4 fill-current" />
                                                    Watch
                                                </Button>
                                            </Link>
                                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleRemoveFromDownloads(item._id, item.type)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "history" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Watch History</h2>
                            {history.length > 0 && (
                                <Button variant="ghost" onClick={handleClearHistory} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Clear All
                                </Button>
                            )}
                        </div>

                        {isLoadingHistory ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground">
                                Your watch history is empty.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {history.map((record, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border group hover:border-primary/30 transition-all">
                                        <div className="relative w-20 h-28 rounded-xl overflow-hidden flex-shrink-0">
                                            <Image src={record.poster || "/placeholder.svg"} alt={record.title} fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Play className="w-8 h-8 text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg">{record.title}</h3>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary">
                                                    {record.type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{new Date(record.watchedAt).toLocaleString()}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-red-500"
                                                        style={{ width: `${record.progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-white/60">{record.progress}%</span>
                                            </div>
                                        </div>
                                        <Link href={`/${record.type === 'movie' ? 'movie' : 'serie'}/${record.slug}`}>
                                            <Button size="sm" className="bg-white text-black hover:bg-white/90 gap-2">
                                                <Play className="w-4 h-4 fill-current" />
                                                {record.progress < 100 ? "Resume" : "Replay"}
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "Watch list" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">My Watchlist</h2>
                            <span className="text-sm text-muted-foreground">{watchlist.length} items</span>
                        </div>
                        {isLoadingWatchlist ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        ) : watchlist.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground">
                                Your watchlist is empty.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {watchlist.map((item) => (
                                    <div key={item._id} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border group hover:border-primary/30 transition-all">
                                        <div className="relative w-20 h-28 rounded-xl overflow-hidden flex-shrink-0">
                                            <Image src={item.poster || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Play className="w-8 h-8 text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg">{item.title}</h3>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary">
                                                    {item.type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                                        </div>
                                        <Link href={`/${item.type === 'movie' ? 'movie' : 'serie'}/${item.slug}`}>
                                            <Button size="sm" className="bg-white text-black hover:bg-white/90 gap-2">
                                                <Play className="w-4 h-4 fill-current" />
                                                Watch
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRemoveFromWatchlist(item._id, item.type)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setIsEditModalOpen(false)
                        }
                    }}
                    style={{ zIndex: 9999 }}
                >
                    <div className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-semibold text-foreground">Edit Profile</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background bg-card shadow-lg relative">
                                        {editFormData.avatar && editFormData.avatar !== "/placeholder.svg" ? (
                                            <Image
                                                src={editFormData.avatar}
                                                alt="Profile"
                                                fill
                                                className="object-cover"
                                                unoptimized={editFormData.avatar.startsWith('data:')}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-primary-foreground">
                                                    {editFormData.name.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {isUploading ? (
                                            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        ) : (
                                            <Camera className="w-5 h-5 text-primary-foreground" />
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                    Tap to change profile photo
                                </p>
                            </div>

                            {/* Error Message */}
                            {editError && (
                                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                                    <p className="text-sm text-destructive">{editError}</p>
                                </div>
                            )}

                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Name</label>
                                <input
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Email</label>
                                <input
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            {/* Current Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={editFormData.currentPassword}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="Enter current password (required to change password)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={editFormData.password}
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                                        className="w-full px-4 py-3 pr-12 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="Enter new password (leave empty to keep current)"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Leave empty if you don't want to change your password
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsEditModalOpen(false)}
                                    disabled={isSaving}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving || !editFormData.name.trim() || !editFormData.email.trim()}
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}