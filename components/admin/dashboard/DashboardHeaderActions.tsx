"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  Radio,
  Edit3,
  X,
  CloudUpload,
  Film,
  Tv,
  Clapperboard,
  CheckCircle2,
  Loader2,
  ImageIcon,
  Type,
  AlignLeft,
  Link2,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// ─── Types ──────────────────────────────────────────────────────────────────
type ModalType = "upload" | "live" | "post" | null

// ─── Overlay backdrop ────────────────────────────────────────────────────────
function Backdrop({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
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
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none`}
    >
      <div
        className={`relative bg-[#212121] dark:bg-[#212121] text-white rounded-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden w-full ${wide ? "max-w-2xl" : "max-w-lg"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
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
  const fileRef = useRef<HTMLInputElement>(null)

  const contentTypes = [
    { key: "movie" as const, label: "Movie", icon: Film, desc: "Full-length feature film", href: "/admin/movies/new" },
    { key: "series" as const, label: "Series", icon: Tv, desc: "Multi-episode series", href: "/admin/series/new" },
    { key: "short" as const, label: "Short", icon: Clapperboard, desc: "Short-form content under 60s", href: "/admin/shorts/new" },
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
        {/* Step 1 – pick type */}
        {step === "select-type" && (
          <motion.div
            key="type"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 flex flex-col gap-3"
          >
            <p className="text-sm text-zinc-400 mb-2">What are you uploading?</p>
            {contentTypes.map((ct) => (
              <button
                key={ct.key}
                onClick={() => { setContentType(ct.key); setStep("drop") }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <ct.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{ct.label}</p>
                  <p className="text-xs text-zinc-400">{ct.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
              </button>
            ))}
          </motion.div>
        )}

        {/* Step 2 – drag & drop */}
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
              className="text-xs text-zinc-400 hover:text-white text-left w-fit"
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
                  ? "border-primary bg-primary/10"
                  : "border-white/15 hover:border-white/30 hover:bg-white/5"
              }`}
            >
              <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
                <CloudUpload className="h-8 w-8 text-zinc-300" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-white">Drag and drop {contentType} files to upload</p>
                <p className="text-sm text-zinc-400 mt-1">Your files will be private until you publish them</p>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white mt-2">
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

        {/* Step 3 – details */}
        {step === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2 text-xs text-zinc-400 bg-white/5 rounded-lg p-3">
              <Film className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{fileName}</span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Title (required)</label>
                <Input
                  placeholder={`Add a title for your ${contentType}`}
                  value={title}
                  onChange={(e) => setTitleVal(e.target.value)}
                  className="bg-white/5 border-white/15 text-white placeholder:text-zinc-600 focus:border-white/30"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                <Textarea
                  placeholder="Tell viewers about your content"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={4}
                  className="bg-white/5 border-white/15 text-white placeholder:text-zinc-600 focus:border-white/30 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-between mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep("drop")}
                className="text-zinc-400 hover:text-white"
              >
                Back
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
                disabled={!title.trim()}
                onClick={handleProcess}
              >
                Upload
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4 – processing */}
        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 flex flex-col items-center gap-6 py-14"
          >
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div className="w-full">
              <div className="flex justify-between text-xs text-zinc-400 mb-2">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
            </div>
            <p className="text-sm text-zinc-400">Processing {contentType} — please wait</p>
          </motion.div>
        )}

        {/* Step 5 – done */}
        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 flex flex-col items-center gap-4 py-14"
          >
            <div className="h-16 w-16 rounded-full bg-green-500/15 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-base font-semibold text-white">Upload complete!</p>
            <p className="text-sm text-zinc-400 text-center">
              Your {contentType} has been uploaded and is being processed.
            </p>
            <div className="flex gap-3 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-white/15 text-zinc-300 hover:text-white bg-transparent hover:bg-white/10"
              >
                Close
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={onClose}
              >
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
      <div className="p-6 flex flex-col gap-5">
        {/* Live indicator */}
        <div className={`flex items-center gap-3 p-3 rounded-xl ${isLive ? "bg-red-500/15 border border-red-500/30" : "bg-white/5 border border-white/10"}`}>
          <span className="relative flex h-3 w-3">
            <span className={`${isLive ? "animate-ping" : ""} absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? "bg-red-400" : "bg-zinc-600"}`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isLive ? "bg-red-500" : "bg-zinc-600"}`} />
          </span>
          <span className={`text-sm font-semibold ${isLive ? "text-red-400" : "text-zinc-400"}`}>
            {isLive ? "LIVE NOW" : "Not streaming"}
          </span>
        </div>

        <div>
          <label className="text-xs text-zinc-400 mb-1.5 block">Stream title</label>
          <Input
            placeholder="Enter your live stream title"
            value={streamTitle}
            onChange={(e) => setStreamTitle(e.target.value)}
            className="bg-white/5 border-white/15 text-white placeholder:text-zinc-600 focus:border-white/30"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 mb-1.5 block">Stream key</label>
          <div className="flex items-center gap-2">
            <Input
              type="password"
              value="hllw-live-xxxx-xxxx-xxxx"
              readOnly
              className="bg-white/5 border-white/15 text-zinc-300 font-mono text-sm"
            />
            <Button variant="outline" size="sm" className="shrink-0 border-white/15 text-zinc-300 bg-transparent hover:bg-white/10 hover:text-white">
              Copy
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Radio className="h-4 w-4 text-blue-400 shrink-0" />
          <p className="text-xs text-blue-300">
            Use OBS Studio or any RTMP-compatible encoder to stream to Hillywood.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-white/15 text-zinc-300 bg-transparent hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!streamTitle.trim()}
            onClick={() => setIsLive((v) => !v)}
            className={isLive
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-primary hover:bg-primary/90 text-white"}
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
        <div className="p-6 flex flex-col items-center gap-4 py-14">
          <div className="h-16 w-16 rounded-full bg-green-500/15 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-base font-semibold text-white">Post published!</p>
          <p className="text-sm text-zinc-400 text-center">Your post is now visible to your subscribers.</p>
          <Button size="sm" onClick={onClose} className="bg-primary hover:bg-primary/90 text-white mt-2">Done</Button>
        </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell title="Create post" onClose={onClose}>
      <div className="p-6 flex flex-col gap-4">
        {/* Post type tabs */}
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {postTypes.map((pt) => (
            <button
              key={pt.key}
              onClick={() => setPostType(pt.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                postType === pt.key ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <pt.icon className="h-3.5 w-3.5" />
              {pt.label}
            </button>
          ))}
        </div>

        {/* Avatar + textarea */}
        <div className="flex gap-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
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
            className="bg-transparent border-none resize-none text-white placeholder:text-zinc-600 focus-visible:ring-0 p-0 text-sm flex-1"
          />
        </div>

        {postType === "image" && (
          <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-white/15 hover:border-white/25 cursor-pointer transition-colors">
            <ImageIcon className="h-4 w-4 text-zinc-500" />
            <span className="text-xs text-zinc-500">Click to add image or GIF</span>
          </div>
        )}

        {postType === "poll" && (
          <div className="flex flex-col gap-2">
            {["Option 1", "Option 2"].map((opt, i) => (
              <Input key={i} placeholder={opt} className="bg-white/5 border-white/15 text-white placeholder:text-zinc-600" />
            ))}
            <button className="text-xs text-primary hover:text-primary/80 text-left mt-1">+ Add option</button>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
          <button className="text-zinc-500 hover:text-white transition-colors">
            <Link2 className="h-4 w-4" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-xs ${postText.length > 400 ? "text-red-400" : "text-zinc-500"}`}>
              {postText.length} / 500
            </span>
            <Button
              size="sm"
              disabled={!postText.trim() || postText.length > 500}
              onClick={() => setSubmitted(true)}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}

// ─── Main exported component ─────────────────────────────────────────────────
export function DashboardHeaderActions() {
  const [open, setOpen] = useState<ModalType>(null)
  const close = () => setOpen(null)

  return (
    <>
      {/* Header buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setOpen("upload")}
          className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          title="Upload"
        >
          <Upload className="h-5 w-5" />
        </button>
        <button
          onClick={() => setOpen("live")}
          className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          title="Go Live"
        >
          <Radio className="h-5 w-5" />
        </button>
        <button
          onClick={() => setOpen("post")}
          className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          title="Create Post"
        >
          <Edit3 className="h-5 w-5" />
        </button>
      </div>

      {/* Portaled modals */}
      <AnimatePresence>
        {open && (
          <>
            <Backdrop onClose={close} />
            {open === "upload" && <UploadModal onClose={close} />}
            {open === "live" && <GoLiveModal onClose={close} />}
            {open === "post" && <CreatePostModal onClose={close} />}
          </>
        )}
      </AnimatePresence>
    </>
  )
}
