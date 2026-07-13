"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Camera, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditProfileModal({ isOpen, onClose, onSuccess }: EditProfileModalProps) {
  const { user, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    currentPassword: "",
    avatar: "",
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        currentPassword: "",
        avatar: user.avatar || "",
      })
      setError("")
    }
  }, [isOpen, user])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    setIsUploadingAvatar(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64Image = reader.result as string
      setFormData(prev => ({ ...prev, avatar: base64Image }))
      setIsUploadingAvatar(false)
    }
    reader.onerror = () => {
      setError("Failed to read image file")
      setIsUploadingAvatar(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const updateData: any = {}
      
      if (formData.name.trim() && formData.name !== user?.name) {
        updateData.name = formData.name.trim()
      }
      
      if (formData.email.trim() && formData.email !== user?.email) {
        updateData.email = formData.email.trim()
      }
      
      if (formData.avatar && formData.avatar !== user?.avatar) {
        updateData.avatar = formData.avatar
      }
      
      if (formData.password) {
        if (!formData.currentPassword) {
          setError("Current password is required to change password")
          setIsLoading(false)
          return
        }
        updateData.password = formData.password
        updateData.currentPassword = formData.currentPassword
      }

      if (Object.keys(updateData).length === 0) {
        setError("No changes to save")
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      await refreshUser()
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background bg-card shadow-lg">
                {formData.avatar ? (
                  <Image 
                    src={formData.avatar} 
                    alt="Profile" 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {formData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-primary-foreground" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Tap to change profile photo
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Current Password (for password change) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
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
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.email.trim()}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
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
  )

  return createPortal(modalContent, document.body)
}
