"use client"

import React, { createContext, useContext, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, CheckCircle2, Film, Tv, Clapperboard, CloudUpload, Radio, AlignLeft, ImageIcon, Type, Link2, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// ─── Types ──────────────────────────────────────────────────────────────────
export type ModalType = 
  | "upload" 
  | "live" 
  | "post" 
  | "violations" 
  | "analytics" 
  | "comments" 
  | "subscribers" 
  | null

interface ModalContextType {
  openModal: (type: ModalType) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextType>({
  openModal: () => {},
  closeModal: () => {},
})

export function useDashboardModal() {
  return useContext(ModalContext)
}

// ─── Overlay backdrop ────────────────────────────────────────────────────────
function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]"
      onClick={onClose}
    />
  )
}

// ─── Modal shell ─────────────────────────────────────────────────────────────
function ModalShell({
  title,
  onClose,
  children,
  wide,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <motion.div
      key="modal"
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`fixed z-50 inset-0 flex items-center justify-center p-4 sm:p-6 pointer-events-none`}
    >
      <div
        className={`relative bg-card text-card-foreground border border-border rounded-xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden w-full ${wide ? "max-w-3xl" : "max-w-xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </motion.div>
  )
}

// ─── Generic Feature Coming Soon Modal ───────────────────────────────────────
function ComingSoonModal({ title, onClose, description }: { title: string, onClose: () => void, description: string }) {
  return (
    <ModalShell title={title} onClose={onClose}>
      <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
        <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">{title} Module</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {description}
          </p>
        </div>
        <Button onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    </ModalShell>
  )
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
type UploadStep = "select-type" | "drop" | "details" | "processing" | "done"

function UploadModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<UploadStep>("select-type")
  const [contentType, setContentType] = useState<"movie" | "series" | "short" | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState("")
  const [progress, setProgress] = useState(0)
  const [title, setTitleVal] = useState("")
  const [desc, setDesc] = useState("")
  const fileRef = React.useRef<HTMLInputElement>(null)

  const contentTypes = [
    { key: "movie" as const, label: "Movie", icon: Film, desc: "Full-length feature film" },
    { key: "series" as const, label: "Series", icon: Tv, desc: "Multi-episode series" },
    { key: "short" as const, label: "Short", icon: Clapperboard, desc: "Short-form content under 60s" },
  ]

  const handleFile = (file: File) => {
    setFileName(file.name)
    setStep("details")
  }

  const handleProcess = () => {
    setStep("processing")
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 18
      setProgress(Math.min(p, 100))
      if (p >= 100) {
        clearInterval(iv)
        setStep("done")
      }
    }, 250)
  }

  return (
    <ModalShell title="Upload content" onClose={onClose} wide>
      <AnimatePresence mode="wait">
        {step === "select-type" && (
          <motion.div
            key="type"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 flex flex-col gap-3"
          >
            <p className="text-sm text-muted-foreground mb-2">What are you uploading?</p>
            {contentTypes.map((ct) => (
              <button
                key={ct.key}
                onClick={() => { setContentType(ct.key); setStep("drop") }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:bg-secondary hover:border-primary/50 transition-all text-left group"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <ct.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{ct.label}</p>
                  <p className="text-xs text-muted-foreground">{ct.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            ))}
          </motion.div>
        )}

        {step === "drop" && (
          <motion.div
            key="drop"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 flex flex-col gap-4"
          >
            <button
              onClick={() => setStep("select-type")}
              className="text-xs text-muted-foreground hover:text-foreground text-left w-fit"
            >
              ← Change type
            </button>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const file = e.dataTransfer.files[0]
                if (file) handleFile(file)
              }}
              onClick={() => fileRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-4 py-16 px-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-secondary"
              }`}
            >
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                <CloudUpload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">Drag and drop {contentType} files to upload</p>
                <p className="text-sm text-muted-foreground mt-1">Your files will be private until you publish them</p>
              </div>
              <Button size="sm" className="mt-2">
                Select files
              </Button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </motion.div>
        )}

        {step === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2 text-xs bg-secondary rounded-lg p-3 border border-border">
              <Film className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate font-medium">{fileName}</span>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Title (required)</label>
                <Input
                  placeholder={`Add a title for your ${contentType}`}
                  value={title}
                  onChange={(e) => setTitleVal(e.target.value)}
                  className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                <Textarea
                  placeholder="Tell viewers about your content"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={4}
                  className="bg-card border-border text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button
                variant="ghost"
                onClick={() => setStep("drop")}
                className="text-muted-foreground"
              >
                Back
              </Button>
              <Button
                disabled={!title.trim()}
                onClick={handleProcess}
              >
                Upload
              </Button>
            </div>
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 flex flex-col items-center gap-6 py-14"
          >
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div className="w-full max-w-sm">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Processing {contentType} — please wait</p>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 flex flex-col items-center gap-4 py-14 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">Upload complete!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your {contentType} has been uploaded successfully.
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={onClose}>
                View in dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalShell>
  )
}

// ─── Go Live Modal ────────────────────────────────────────────────────────────
function GoLiveModal({ onClose }: { onClose: () => void }) {
  const [streamTitle, setStreamTitle] = useState("")
  const [isLive, setIsLive] = useState(false)

  return (
    <ModalShell title="Go Live" onClose={onClose}>
      <div className="p-6 flex flex-col gap-6">
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${isLive ? "bg-red-500/10 border-red-500/30" : "bg-secondary border-border"}`}>
          <span className="relative flex h-3.5 w-3.5">
            <span className={`${isLive ? "animate-ping" : ""} absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? "bg-red-500" : "bg-muted-foreground"}`} />
            <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isLive ? "bg-red-600" : "bg-muted-foreground"}`} />
          </span>
          <span className={`text-sm font-bold tracking-wide uppercase ${isLive ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
            {isLive ? "LIVE NOW" : "Not streaming"}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Stream title</label>
            <Input
              placeholder="Enter your live stream title"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Stream key</label>
            <div className="flex items-center gap-2">
              <Input
                type="password"
                value="hllw-live-xxxx-xxxx-xxxx"
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline" className="shrink-0">
                Copy
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
          <Radio className="h-5 w-5 shrink-0" />
          <p className="text-sm">
            Use OBS Studio or any RTMP-compatible encoder to stream to Hillywood.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!streamTitle.trim()}
            onClick={() => setIsLive((v) => !v)}
            variant={isLive ? "destructive" : "default"}
          >
            {isLive ? "End stream" : "Go Live"}
          </Button>
        </div>
      </div>
    </ModalShell>
  )
}

// ─── Create Post Modal ────────────────────────────────────────────────────────
function CreatePostModal({ onClose }: { onClose: () => void }) {
  const [postText, setPostText] = useState("")
  const [postType, setPostType] = useState<"text" | "image" | "poll">("text")
  const [submitted, setSubmitted] = useState(false)

  const postTypes = [
    { key: "text" as const, icon: AlignLeft, label: "Text" },
    { key: "image" as const, icon: ImageIcon, label: "Image" },
    { key: "poll" as const, icon: Type, label: "Poll" },
  ]

  if (submitted) {
    return (
      <ModalShell title="Create post" onClose={onClose}>
        <div className="p-8 flex flex-col items-center gap-4 py-16 text-center">
          <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">Post published!</p>
            <p className="text-sm text-muted-foreground mt-1">Your post is now visible to your subscribers.</p>
          </div>
          <Button onClick={onClose} className="mt-4 w-32">Done</Button>
        </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell title="Create post" onClose={onClose}>
      <div className="p-6 flex flex-col gap-5">
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          {postTypes.map((pt) => (
            <button
              key={pt.key}
              onClick={() => setPostType(pt.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                postType === pt.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <pt.icon className="h-4 w-4" />
              {pt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            H
          </div>
          <Textarea
            placeholder={
              postType === "text"
                ? "Share something with your subscribers..."
                : postType === "image"
                ? "Add a caption for your image..."
                : "Ask your subscribers a question..."
            }
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={5}
            className="bg-transparent border-none resize-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 p-0 text-base flex-1 min-h-[120px]"
          />
        </div>

        {postType === "image" && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-secondary/50">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Click to add image or GIF</span>
          </div>
        )}

        {postType === "poll" && (
          <div className="flex flex-col gap-3 pl-14">
            {["Option 1", "Option 2"].map((opt, i) => (
              <Input key={i} placeholder={opt} />
            ))}
            <button className="text-sm font-medium text-primary hover:text-primary/80 text-left mt-1 w-fit">
              + Add option
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-border mt-2">
          <button className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary">
            <Link2 className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <span className={`text-sm ${postText.length > 400 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
              {postText.length} / 500
            </span>
            <Button
              disabled={!postText.trim() || postText.length > 500}
              onClick={() => setSubmitted(true)}
              className="px-6"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}

// ─── Global Provider ──────────────────────────────────────────────────────────
export function DashboardModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  const openModal = (type: ModalType) => setActiveModal(type)
  const closeModal = () => setActiveModal(null)

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <AnimatePresence>
        {activeModal && (
          <>
            <Backdrop onClose={closeModal} />
            {activeModal === "upload" && <UploadModal onClose={closeModal} />}
            {activeModal === "live" && <GoLiveModal onClose={closeModal} />}
            {activeModal === "post" && <CreatePostModal onClose={closeModal} />}
            
            {/* Additional Modals requested by the user */}
            {activeModal === "violations" && (
              <ComingSoonModal 
                title="Channel Violations" 
                description="View your active copyright strikes, warnings, and community guidelines status in detail." 
                onClose={closeModal} 
              />
            )}
            {activeModal === "analytics" && (
              <ComingSoonModal 
                title="Channel Analytics" 
                description="Dive deep into your performance metrics, revenue tracking, and audience retention." 
                onClose={closeModal} 
              />
            )}
            {activeModal === "subscribers" && (
              <ComingSoonModal 
                title="Recent Subscribers" 
                description="Manage your audience, see who subscribed recently, and send them a welcome message." 
                onClose={closeModal} 
              />
            )}
            {activeModal === "comments" && (
              <ComingSoonModal 
                title="Manage Comments" 
                description="Reply, pin, delete, or use AI tools to manage your audience engagement." 
                onClose={closeModal} 
              />
            )}
          </>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  )
}
