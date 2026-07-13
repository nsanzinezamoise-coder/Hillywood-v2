"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Globe, SlidersHorizontal, ArrowDown, ChevronDown,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
  Info, X, Check, Pencil, BarChart2, MessageSquare, Play,
  MoreVertical, Share2, Megaphone, Download, Sparkles, Trash2, Youtube,
} from "lucide-react"

// ─────────────────────────── Types ───────────────────────────

type FilterType =
  | "ageRestriction" | "brandAccess" | "claims"
  | "description" | "madeForKids" | "title" | "views" | "visibility"

interface ActiveFilter {
  type: FilterType
  chipLabel: string
  value: string | string[] | { min?: string; max?: string }
}

interface Movie {
  _id: string
  title: string
  slug: string
  poster: string
  duration: number
  views: number
  approvalStatus: "pending" | "approved" | "rejected"
  createdAt: string
  description: string
  commentCount?: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ChannelContentPageProps {
  movies: Movie[]
  pagination: Pagination
  currentPage: number
}

// ─────────────────────────── Constants ───────────────────────────

const TABS = [
  "Inspiration", "Videos", "Shorts", "Live", "Posts",
  "Playlists", "Podcasts", "Promotions", "Collaborations",
]

const FILTER_MENU_ITEMS: { type: FilterType; label: string }[] = [
  { type: "ageRestriction", label: "Age restriction" },
  { type: "brandAccess",    label: "Brand access"    },
  { type: "claims",         label: "Claims"          },
  { type: "description",    label: "Description"     },
  { type: "madeForKids",   label: "Made for kids"   },
  { type: "title",          label: "Title"           },
  { type: "views",          label: "Views"           },
  { type: "visibility",     label: "Visibility"      },
]

// ─────────────────────────── Helper components ────────────────────────────

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:00`
  return `${m}:00`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

// ─────────────────────────── Radio Modal ─────────────────────────────────

function RadioModal({
  title, options, currentValue, onApply, onClose,
}: {
  title: string
  options: string[]
  currentValue?: string
  onApply: (value: string, chipLabel: string) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<string>(currentValue ?? "")

  return (
    <div className="w-72 rounded-xl p-5 shadow-2xl border border-white/10" style={{ backgroundColor: "#212121" }}>
      <div className="flex items-center justify-between mb-5">
        <span className="text-base font-bold text-white">{title}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-0.5">
          <X size={17} />
        </button>
      </div>
      <div className="flex flex-col gap-3.5 mb-6">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => setSelected(opt)}
            className="flex items-center gap-3 group text-left"
          >
            <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              selected === opt ? "border-white" : "border-gray-500 group-hover:border-gray-300"
            }`}>
              {selected === opt && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className="text-sm text-white">{opt}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <button
          disabled={!selected}
          onClick={() => { if (selected) onApply(selected, `${title}: ${selected}`) }}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            selected
              ? "bg-white text-black hover:bg-gray-200 cursor-pointer"
              : "bg-[#3a3a3a] text-gray-500 cursor-default"
          }`}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────── Checkbox Modal ──────────────────────────────

function CheckboxModal({
  title, options, currentValue, onApply, onClose,
}: {
  title: string
  options: string[]
  currentValue?: string[]
  onApply: (value: string[], chipLabel: string) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<string[]>(currentValue ?? [])

  const toggle = (opt: string) =>
    setSelected((prev) => prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt])

  return (
    <div className="w-72 rounded-xl p-5 shadow-2xl border border-white/10" style={{ backgroundColor: "#212121" }}>
      <div className="flex items-center justify-between mb-5">
        <span className="text-base font-bold text-white">{title}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-0.5">
          <X size={17} />
        </button>
      </div>
      <div className="flex flex-col gap-3.5 mb-6">
        {options.map((opt) => {
          const checked = selected.includes(opt)
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className="flex items-center gap-3 group text-left"
            >
              <div className={`w-[18px] h-[18px] rounded-sm border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                checked ? "border-white bg-white" : "border-gray-500 group-hover:border-gray-300"
              }`}>
                {checked && <Check size={11} className="text-black" strokeWidth={3} />}
              </div>
              <span className="text-sm text-white">{opt}</span>
            </button>
          )
        })}
      </div>
      <div className="flex justify-end">
        <button
          disabled={selected.length === 0}
          onClick={() => {
            if (selected.length > 0)
              onApply(selected, `${title}: ${selected.join(", ")}`)
          }}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            selected.length > 0
              ? "bg-white text-black hover:bg-gray-200 cursor-pointer"
              : "bg-[#3a3a3a] text-gray-500 cursor-default"
          }`}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────── Title Modal ─────────────────────────────────

function TitleModal({
  currentValue, onApply, onClose,
}: {
  currentValue?: string
  onApply: (value: string, chipLabel: string) => void
  onClose: () => void
}) {
  const [text, setText] = useState(currentValue ?? "")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const enabled = text.trim().length > 0

  return (
    <div className="w-72 rounded-xl p-5 shadow-2xl border border-white/10" style={{ backgroundColor: "#212121" }}>
      <div className="flex items-center justify-between mb-5">
        <span className="text-base font-bold text-white">Title</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-0.5">
          <X size={17} />
        </button>
      </div>
      <div className="mb-6">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && enabled) onApply(text.trim(), `Title: ${text.trim()}`)
          }}
          placeholder="Enter title keyword"
          className="w-full bg-transparent border-b border-gray-600 focus:border-white outline-none text-white text-sm py-2 placeholder:text-gray-500 transition-colors"
        />
      </div>
      <div className="flex justify-end">
        <button
          disabled={!enabled}
          onClick={() => { if (enabled) onApply(text.trim(), `Title: ${text.trim()}`) }}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            enabled
              ? "bg-white text-black hover:bg-gray-200 cursor-pointer"
              : "bg-[#3a3a3a] text-gray-500 cursor-default"
          }`}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────── Views Modal ─────────────────────────────────

function ViewsModal({
  currentValue, onApply, onClose,
}: {
  currentValue?: { min?: string; max?: string }
  onApply: (value: { min?: string; max?: string }, chipLabel: string) => void
  onClose: () => void
}) {
  const [min, setMin] = useState(currentValue?.min ?? "")
  const [max, setMax] = useState(currentValue?.max ?? "")

  const enabled = min.trim() !== "" || max.trim() !== ""

  const chipLabel = () => {
    if (min && max) return `Views: ${min}–${max}`
    if (min) return `Views: ${min}+`
    return `Views: 0–${max}`
  }

  return (
    <div className="w-72 rounded-xl p-5 shadow-2xl border border-white/10" style={{ backgroundColor: "#212121" }}>
      <div className="flex items-center justify-between mb-5">
        <span className="text-base font-bold text-white">Views</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-0.5">
          <X size={17} />
        </button>
      </div>
      <div className="flex gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-2">Min views</label>
          <input
            type="number" min={0} value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="0"
            className="w-full bg-[#2a2a2a] border border-gray-600 focus:border-white outline-none text-white text-sm px-3 py-2 rounded-lg transition-colors placeholder:text-gray-600"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-2">Max views</label>
          <input
            type="number" min={0} value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="∞"
            className="w-full bg-[#2a2a2a] border border-gray-600 focus:border-white outline-none text-white text-sm px-3 py-2 rounded-lg transition-colors placeholder:text-gray-600"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          disabled={!enabled}
          onClick={() => {
            if (enabled) onApply(
              { min: min || undefined, max: max || undefined },
              chipLabel()
            )
          }}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            enabled
              ? "bg-white text-black hover:bg-gray-200 cursor-pointer"
              : "bg-[#3a3a3a] text-gray-500 cursor-default"
          }`}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────── Empty State ─────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-4xl select-none">
        📭
      </div>
      <p className="text-base text-muted-foreground">No matching videos</p>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  tooltip,
  onClick,
}: {
  icon: any
  tooltip: string
  onClick: () => void
}) {
  return (
    <div className="relative group">
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        className="w-9 h-9 rounded-full flex items-center justify-center text-[#e0e0e0] hover:bg-[#3f3f3f] hover:text-white transition-colors cursor-pointer"
      >
        <Icon size={20} />
      </button>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-300 pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-[#616161] text-white text-[11px] py-1 px-2 rounded z-50 whitespace-nowrap shadow-lg">
        {tooltip}
      </div>
    </div>
  )
}

// ─────────────────────────── SharePrivatelyDialog ──────────────────────────

function SharePrivatelyDialog({ onClose }: { onClose: () => void }) {
  const [invitees, setInvitees]     = useState("")
  const [notifyEmail, setNotifyEmail] = useState(false)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.72)" }}
      onClick={onClose}
    >
      <div
        className="w-[520px] rounded-2xl shadow-2xl p-6 flex flex-col gap-5"
        style={{ backgroundColor: "#212121", border: "1px solid rgba(255,255,255,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white">Share video privately</h2>
        <p className="text-sm leading-relaxed" style={{ color: "#aaa", marginTop: "-8px" }}>
          You can invite others to view your private video by entering in their email addresses
          below. Invitees must sign in to their Google Account to view your private video.
        </p>
        <div
          className="rounded-lg border focus-within:border-blue-500 transition-colors"
          style={{ backgroundColor: "#2a2a2a", borderColor: "#555" }}
        >
          <textarea
            value={invitees}
            onChange={(e) => setInvitees(e.target.value)}
            placeholder="Invitees"
            rows={5}
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 px-4 py-3 resize-none focus:outline-none rounded-lg"
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.checked)}
            className="w-4 h-4 accent-white cursor-pointer"
          />
          <span className="text-sm text-white">Notify via email</span>
        </label>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-sm font-medium text-white border border-gray-600 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────── SaveOrPublishModal ──────────────────────────

function SaveOrPublishModal({
  movieId,
  currentVisibility,
  onClose,
  onSave,
}: {
  movieId: string
  currentVisibility: string
  onClose: () => void
  onSave: (visibility: string) => void
}) {
  const [selected, setSelected]               = useState(currentVisibility)
  const [scheduleOpen, setScheduleOpen]       = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  // ── Schedule date/time state ──────────────────────────────
  const pad = (n: number) => String(n).padStart(2, "0")
  const now = new Date()
  const isoToday = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const [scheduleDate, setScheduleDate]     = useState(isoToday)
  const [scheduleHour, setScheduleHour]     = useState("12")
  const [scheduleMin, setScheduleMin]       = useState("00")
  const [scheduleAmPm, setScheduleAmPm]     = useState<"AM" | "PM">("AM")
  const [showTzInfo, setShowTzInfo]         = useState(false)
  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone

  const displayDate = scheduleDate
    ? new Date(scheduleDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : "Select date"

  const visibilityOptions = [
    { value: "private",  label: "Private"  },
    { value: "unlisted", label: "Unlisted" },
    { value: "public",   label: "Public"   },
  ]

  return (
    <>
      {/* transparent backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* panel */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 w-[420px] flex flex-col gap-2">

        {/* ── Save or publish card */}
        <div className="rounded-2xl border border-white/10 shadow-2xl overflow-hidden" style={{ backgroundColor: "#212121" }}>
          <button
            onClick={() => setScheduleOpen(false)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="text-base font-semibold text-white">Save or publish</span>
            <ChevronDown size={18} className={`text-white transition-transform ${scheduleOpen ? "" : "rotate-180"}`} />
          </button>

          {!scheduleOpen && (
            <div className="px-5 pb-5 flex flex-col gap-1">
              {visibilityOptions.map((opt) => (
                <div key={opt.value}>
                  <label
                    className="flex items-center gap-3 cursor-pointer group py-2"
                    onClick={() => setSelected(opt.value)}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selected === opt.value ? "border-white" : "border-gray-500 group-hover:border-gray-300"
                      }`}
                    >
                      {selected === opt.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm text-white">{opt.label}</span>
                  </label>

                  {/* Share privately pill – visible only when Private is selected */}
                  {opt.value === "private" && selected === "private" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowShareDialog(true) }}
                      className="ml-8 mb-2 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-white cursor-pointer transition-colors hover:bg-white/10"
                      style={{ backgroundColor: "#3a3a3a", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <line x1="19" y1="8" x2="19" y2="14"/>
                        <line x1="22" y1="11" x2="16" y2="11"/>
                      </svg>
                      Share privately
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Schedule card */}
        <div className="rounded-2xl border border-white/10 shadow-2xl overflow-hidden" style={{ backgroundColor: "#212121" }}>
          <button
            onClick={() => setScheduleOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="text-base font-semibold text-white">Schedule</span>
            <ChevronDown size={18} className={`text-white transition-transform ${scheduleOpen ? "rotate-180" : ""}`} />
          </button>

          {scheduleOpen && (
            <div className="px-5 pb-5">
              <p className="text-sm font-semibold text-white mb-4">Schedule as public</p>

              <div className="flex items-center flex-wrap gap-2 mb-3">
                {/* Date picker */}
                <div className="relative">
                  <button
                    className="flex items-center gap-2 bg-transparent border border-gray-600 rounded px-3 py-1.5 text-sm text-white hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => (document.getElementById(`sd-${movieId}`) as HTMLInputElement | null)?.showPicker?.()}
                  >
                    <span>{displayDate}</span>
                    <ChevronDown size={13} className="text-gray-400" />
                  </button>
                  <input
                    id={`sd-${movieId}`}
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full cursor-pointer"
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                {/* Time – hour : minute AM/PM */}
                <div className="flex items-center border border-gray-600 rounded overflow-hidden text-sm text-white hover:border-gray-400 transition-colors">
                  <input
                    type="number" min={1} max={12}
                    value={scheduleHour}
                    onChange={(e) => setScheduleHour(e.target.value.padStart(2, "0"))}
                    className="w-10 bg-transparent text-center py-1.5 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="text-gray-400 select-none">:</span>
                  <input
                    type="number" min={0} max={59}
                    value={scheduleMin}
                    onChange={(e) => setScheduleMin(e.target.value.padStart(2, "0"))}
                    className="w-10 bg-transparent text-center py-1.5 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setScheduleAmPm((v) => v === "AM" ? "PM" : "AM")}
                    className="px-2 py-1.5 text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer select-none border-l border-gray-600"
                  >
                    {scheduleAmPm}
                  </button>
                </div>

                {/* Time zone */}
                <div className="relative">
                  <button
                    onClick={() => setShowTzInfo((v) => !v)}
                    className="border border-gray-600 rounded px-3 py-1.5 text-sm text-white hover:border-gray-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    Time zone
                    <span className="w-4 h-4 rounded-full border border-gray-500 text-xs flex items-center justify-center text-gray-400 flex-shrink-0">?</span>
                  </button>
                  {showTzInfo && (
                    <div
                      className="absolute top-full left-0 mt-1.5 z-10 rounded-lg px-3 py-2 text-xs text-white shadow-xl whitespace-nowrap"
                      style={{ backgroundColor: "#333", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      {tzName}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Video will be <span className="font-semibold text-white">private</span> before publishing
              </p>
            </div>
          )}
        </div>

        {/* ── Footer buttons */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-sm font-medium text-white border border-gray-600 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(scheduleOpen ? "scheduled" : selected)}
            className="px-5 py-2 rounded-full text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors cursor-pointer"
          >
            {scheduleOpen ? "Schedule" : "Save"}
          </button>
        </div>
      </div>

      {/* Share privately dialog – rendered on top of everything */}
      {showShareDialog && (
        <SharePrivatelyDialog onClose={() => setShowShareDialog(false)} />
      )}
    </>
  )
}

// ─────────────────────────── Main Component ───────────────────────────────

export function ChannelContentPage({ movies, pagination, currentPage }: ChannelContentPageProps) {
  const router = useRouter()

  // ── UI state ──────────────────────────────────────────────
  const [activeTab, setActiveTab]     = useState("Videos")
  const [checkedIds, setCheckedIds]   = useState<Set<string>>(new Set())
  const [showBanner, setShowBanner]   = useState(true)
  const rowsPerPage = 30

  // ── Hover / Options row states ────────────────────────────
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)
  const [openOptionsMenuRowId, setOpenOptionsMenuRowId] = useState<string | null>(null)

  // ── Visibility column states ──────────────────────────────
  const [visibilityHoverRowId, setVisibilityHoverRowId] = useState<string | null>(null)
  const [visibilityModalRowId, setVisibilityModalRowId] = useState<string | null>(null)
  const [movieVisibility, setMovieVisibility] = useState<Record<string, string>>({})

  // ── Filter state ──────────────────────────────────────────
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [filterInputText, setFilterInputText] = useState("")
  const [showMenu, setShowMenu]           = useState(false)
  const [openModal, setOpenModal]         = useState<FilterType | null>(null)
  const filterRef                         = useRef<HTMLDivElement>(null)
  const inputRef                          = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowMenu(false)
        setOpenModal(null)
      }
      // Close options menu if clicking outside of any options container
      const target = e.target as HTMLElement
      if (!target.closest(".options-menu-container")) {
        setOpenOptionsMenuRowId(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // ── Filter helpers ────────────────────────────────────────
  const getFilterValue = (type: FilterType) =>
    activeFilters.find((f) => f.type === type)?.value

  const applyFilter = (type: FilterType, value: ActiveFilter["value"], chipLabel: string) => {
    setActiveFilters((prev) => [
      ...prev.filter((f) => f.type !== type),
      { type, chipLabel, value },
    ])
    setOpenModal(null)
    setShowMenu(false)
    setFilterInputText("")
  }

  const removeFilter = (type: FilterType) => {
    setActiveFilters((prev) => prev.filter((f) => f.type !== type))
  }

  const openFilterModal = (type: FilterType) => {
    setOpenModal(type)
    setShowMenu(false)
  }

  const filteredMenuItems = useMemo(() => {
    return FILTER_MENU_ITEMS.filter((item) =>
      item.label.toLowerCase().includes(filterInputText.toLowerCase())
    )
  }, [filterInputText])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (filterInputText.trim()) {
        applyFilter("title", filterInputText.trim(), `Title: ${filterInputText.trim()}`)
      }
    }
  }

  // ── Client-side filtering ─────────────────────────────────
  const filteredMovies = useMemo(() => {
    if (activeFilters.length === 0) return movies

    return movies.filter((movie) =>
      activeFilters.every((filter) => {
        switch (filter.type) {
          case "title": {
            const q = (filter.value as string).toLowerCase()
            return movie.title.toLowerCase().includes(q)
          }
          case "description": {
            const has = movie.description && movie.description.trim().length > 0
            return filter.value === "Has description" ? has : !has
          }
          case "visibility": {
            const sel = filter.value as string[]
            const map: Record<string, string> = {
              Public: "approved", Private: "rejected",
              Pending: "pending", Unlisted: "unlisted", Scheduled: "scheduled",
            }
            return sel.some((s) => map[s] === movie.approvalStatus)
          }
          case "views": {
            const { min, max } = filter.value as { min?: string; max?: string }
            if (min && movie.views < parseInt(min)) return false
            if (max && movie.views > parseInt(max)) return false
            return true
          }
          // Fields that don't exist in movie model → always empty
          case "ageRestriction":
          case "brandAccess":
          case "claims":
          case "madeForKids":
            return false
          default:
            return true
        }
      })
    )
  }, [movies, activeFilters])

  // ── Checkbox / row ────────────────────────────────────────
  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setCheckedIds(
      checkedIds.size === filteredMovies.length && filteredMovies.length > 0
        ? new Set()
        : new Set(filteredMovies.map((m) => m._id))
    )
  }

  const goToPage = (page: number) => router.push(`/admin/movies?page=${page}`)

  const start = pagination.total === 0 ? 0 : (currentPage - 1) * pagination.limit + 1
  const end   = Math.min(currentPage * pagination.limit, pagination.total)

  // ── Modal rendering helper ────────────────────────────────
  const renderModal = () => {
    if (!openModal) return null
    const close = () => setOpenModal(null)

    switch (openModal) {
      case "ageRestriction":
        return <RadioModal title="Age restriction" options={["Viewers over 18", "None"]}
          currentValue={getFilterValue("ageRestriction") as string}
          onApply={(v, l) => applyFilter("ageRestriction", v, l)} onClose={close} />

      case "brandAccess":
        return <CheckboxModal title="Brand access" options={["Shared", "For review"]}
          currentValue={getFilterValue("brandAccess") as string[]}
          onApply={(v, l) => applyFilter("brandAccess", v, l)} onClose={close} />

      case "claims":
        return <CheckboxModal title="Claims" options={["Claimed", "Disputed", "No claims"]}
          currentValue={getFilterValue("claims") as string[]}
          onApply={(v, l) => applyFilter("claims", v, l)} onClose={close} />

      case "description":
        return <RadioModal title="Description" options={["Has description", "No description"]}
          currentValue={getFilterValue("description") as string}
          onApply={(v, l) => applyFilter("description", v, l)} onClose={close} />

      case "madeForKids":
        return <RadioModal title="Made for kids" options={["Yes", "No"]}
          currentValue={getFilterValue("madeForKids") as string}
          onApply={(v, l) => applyFilter("madeForKids", v, l)} onClose={close} />

      case "title":
        return <TitleModal
          currentValue={getFilterValue("title") as string}
          onApply={(v, l) => applyFilter("title", v, l)} onClose={close} />

      case "views":
        return <ViewsModal
          currentValue={getFilterValue("views") as { min?: string; max?: string }}
          onApply={(v, l) => applyFilter("views", v, l)} onClose={close} />

      case "visibility":
        return <CheckboxModal title="Visibility" options={["Public", "Unlisted", "Private", "Scheduled"]}
          currentValue={getFilterValue("visibility") as string[]}
          onApply={(v, l) => applyFilter("visibility", v, l)} onClose={close} />

      default: return null
    }
  }

  // ─────────────────────────── Render ───────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">

      {/* ── Page Title ── */}
      <h1 className="text-3xl font-bold text-foreground mb-6">Channel content</h1>

      {/* ── Tab Bar ── */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => {
          const isActive = tab === activeTab
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={[
                "px-4 py-3 text-base whitespace-nowrap transition-colors -mb-px",
                isActive
                  ? "font-semibold text-foreground border-b-2 border-foreground"
                  : "font-normal text-muted-foreground border-b-2 border-transparent hover:text-foreground",
              ].join(" ")}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* ── Info Banner ── */}
      {showBanner && (
        <div className="flex items-center justify-between gap-3 bg-muted rounded-lg px-4 py-3 my-4">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full border border-muted-foreground flex items-center justify-center">
              <Info size={12} className="text-muted-foreground" />
            </span>
            <span className="text-base text-foreground">
              The improved Content tab helps you track video performance, earnings, and notices in one place
            </span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button className="text-base font-medium px-4 py-1.5 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity whitespace-nowrap">
              Check it out
            </button>
            <button onClick={() => setShowBanner(false)}
              className="text-base font-medium px-4 py-1.5 rounded-full border border-foreground text-foreground bg-transparent hover:bg-accent transition-colors whitespace-nowrap">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Filter Row + Popover/Modal ── */}
      <div ref={filterRef} className="relative">

        {/* Filter trigger row */}
        <div className="flex flex-wrap items-center gap-2 py-2.5 border-b border-border min-h-[46px]">
          {/* Funnel icon — always visible */}
          <button
            onClick={() => {
              setShowMenu((v) => !v)
              setOpenModal(null)
              inputRef.current?.focus()
            }}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            title="Filter"
          >
            <SlidersHorizontal size={18} />
          </button>

          {/* Chips */}
          {activeFilters.map((filter) => (
            <span
              key={filter.type}
              className="flex items-center gap-1 h-8 pl-3 pr-2 rounded-full border border-border bg-muted text-sm text-foreground"
            >
              <button
                onClick={() => openFilterModal(filter.type)}
                className="max-w-[220px] truncate hover:underline text-left"
                title={filter.chipLabel}
              >
                {filter.chipLabel}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeFilter(filter.type) }}
                className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                title="Remove filter"
              >
                <X size={13} />
              </button>
            </span>
          ))}

          {/* Typeable Input field */}
          <input
            ref={inputRef}
            type="text"
            value={filterInputText}
            onChange={(e) => {
              setFilterInputText(e.target.value)
              setShowMenu(true)
              setOpenModal(null)
            }}
            onFocus={() => {
              setShowMenu(true)
              setOpenModal(null)
            }}
            onKeyDown={handleKeyDown}
            placeholder={activeFilters.length === 0 ? "Filter" : "Add filter..."}
            className="bg-transparent border-none outline-none text-base text-foreground placeholder:text-muted-foreground min-w-[120px] flex-1 py-1"
          />

          {/* Clear all button */}
          {activeFilters.length > 0 && (
            <button
              onClick={() => {
                setActiveFilters([])
                setFilterInputText("")
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 ml-auto"
              title="Clear all filters"
            >
              Clear all
            </button>
          )}
        </div>

        {/* ── Main filter menu (popover) ── */}
        {showMenu && !openModal && (
          <div
            className="absolute left-0 top-full mt-1 z-50 rounded-xl overflow-hidden shadow-2xl border border-white/10 py-1"
            style={{ backgroundColor: "#212121", width: "160px" }}
          >
            {filteredMenuItems.map((item) => (
              <button
                key={item.type}
                onClick={() => {
                  openFilterModal(item.type)
                  setFilterInputText("")
                }}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#3f3f3f] transition-colors block truncate"
                style={{ fontWeight: 400 }}
              >
                {item.label}
              </button>
            ))}
            {filteredMenuItems.length === 0 && (
              <div className="px-3 py-2 text-xs text-gray-500 italic">No matches</div>
            )}
          </div>
        )}

        {/* ── Per-filter modal card ── */}
        {openModal && (
          <div className="absolute left-0 top-full mt-1 z-50">
            {renderModal()}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="w-full">
        {/* Header Row — always visible */}
        <div className="grid grid-cols-[40px_1fr_100px_130px_160px_80px_100px] items-center py-2.5 border-b border-border gap-2">
          <div className="flex justify-center">
            <input
              type="checkbox"
              checked={checkedIds.size === filteredMovies.length && filteredMovies.length > 0}
              onChange={toggleAll}
              className="w-4 h-4 cursor-pointer accent-primary"
            />
          </div>
          <span className="text-sm text-muted-foreground tracking-wide">Video</span>
          <span className="text-sm text-muted-foreground tracking-wide">Notices</span>
          <span className="text-sm text-muted-foreground tracking-wide">Visibility</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-foreground tracking-wide">Date</span>
            <ArrowDown size={13} className="text-foreground" />
          </div>
          <span className="text-sm text-muted-foreground tracking-wide text-right">Views</span>
          <span className="text-sm text-muted-foreground tracking-wide text-right">Comments</span>
        </div>

        {/* Data Rows or Empty State */}
        {filteredMovies.length === 0 ? (
          <EmptyState />
        ) : (
          filteredMovies.map((movie) => {
            const isHovered = hoveredRowId === movie._id
            const isMenuOpen = openOptionsMenuRowId === movie._id
            const showHoverActions = isHovered || isMenuOpen

            return (
              <div
                key={movie._id}
                onMouseEnter={() => setHoveredRowId(movie._id)}
                onMouseLeave={() => setHoveredRowId(null)}
                className={[
                  "grid grid-cols-[40px_1fr_100px_130px_160px_80px_100px] items-center py-4 border-b border-border gap-2 transition-colors duration-150 cursor-default",
                  checkedIds.has(movie._id) ? "bg-muted" : "",
                ].join(" ")}
                style={{
                  backgroundColor: isMenuOpen ? "#2a2a2a" : isHovered ? "#2a2a2a" : undefined
                }}
              >
                {/* Checkbox */}
                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={checkedIds.has(movie._id)}
                    onChange={() => toggleCheck(movie._id)}
                    className="w-4 h-4 cursor-pointer accent-primary"
                  />
                </div>

                {/* Thumbnail + Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0 w-[120px] h-[68px] rounded overflow-hidden bg-muted">
                    <Image
                      src={movie.poster || "/placeholder.svg"}
                      alt={movie.title} fill sizes="120px"
                      className="object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[11px] font-semibold px-1 py-px rounded-sm">
                      {formatDuration(movie.duration)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 relative">
                    <Link
                      href={`/admin/movies/${movie._id}/edit`}
                      className="block text-base font-medium text-foreground truncate hover:underline"
                      title={movie.title}
                    >
                      {movie.title}
                    </Link>

                    {/* Description vs Action bar Container */}
                    <div className="h-9 mt-1 relative flex items-center">
                      {/* Action Bar container */}
                      <div
                        className={`absolute inset-0 flex items-center gap-3 transition-opacity duration-200 bg-transparent ${
                          showHoverActions ? "opacity-100 z-10" : "opacity-0 -z-10 pointer-events-none"
                        }`}
                      >
                        <ActionButton icon={Pencil} tooltip="Details" onClick={() => console.log("Navigate to Details edit page")} />
                        <ActionButton icon={BarChart2} tooltip="Analytics" onClick={() => console.log("Navigate to Analytics page")} />
                        <ActionButton icon={MessageSquare} tooltip="Comments" onClick={() => console.log("Navigate to Comments page")} />
                        <ActionButton icon={Youtube} tooltip="View on YouTube" onClick={() => console.log("Navigate to View on YouTube")} />
                        
                        {/* Three vertical dots trigger */}
                        <div className="relative options-menu-container group">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenOptionsMenuRowId(isMenuOpen ? null : movie._id)
                            }}
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-[#e0e0e0] hover:bg-[#3f3f3f] hover:text-white transition-colors cursor-pointer ${
                              isMenuOpen ? "bg-[#3f3f3f]" : ""
                            }`}
                          >
                            <MoreVertical size={20} />
                          </button>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-300 pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-[#616161] text-white text-[11px] py-1 px-2 rounded z-50 whitespace-nowrap shadow-lg">
                            Options
                          </div>

                          {/* Options popover menu */}
                          {isMenuOpen && (
                            <div
                              className="absolute left-8 top-full z-50 rounded-lg overflow-hidden shadow-2xl border border-white/10 py-1 bg-[#212121] w-[220px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => { console.log("Edit title and description"); setOpenOptionsMenuRowId(null) }}
                                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#3f3f3f] transition-colors flex items-center gap-4"
                              >
                                <Pencil size={18} className="text-gray-300" />
                                <span>Edit title and description</span>
                              </button>
                              <button
                                onClick={() => { console.log("Get shareable link"); setOpenOptionsMenuRowId(null) }}
                                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#3f3f3f] transition-colors flex items-center gap-4"
                              >
                                <Share2 size={18} className="text-gray-300" />
                                <span>Get shareable link</span>
                              </button>
                              <button
                                onClick={() => { console.log("Promote"); setOpenOptionsMenuRowId(null) }}
                                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#3f3f3f] transition-colors flex items-center gap-4"
                              >
                                <Megaphone size={18} className="text-gray-300" />
                                <span>Promote</span>
                              </button>
                              <button
                                onClick={() => { console.log("Download"); setOpenOptionsMenuRowId(null) }}
                                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#3f3f3f] transition-colors flex items-center gap-4"
                              >
                                <Download size={18} className="text-gray-300" />
                                <span>Download</span>
                              </button>
                              <button
                                onClick={() => { console.log("Brainstorm video ideas"); setOpenOptionsMenuRowId(null) }}
                                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#3f3f3f] transition-colors flex items-center gap-4"
                              >
                                <Sparkles size={18} className="text-gray-300" />
                                <span>Brainstorm video ideas</span>
                              </button>
                              <div className="border-t border-white/5 my-1" />
                              <button
                                onClick={() => { console.log("Delete forever"); setOpenOptionsMenuRowId(null) }}
                                className="w-full text-left px-4 py-2.5 text-sm text-[#f28b82] hover:bg-[#3f3f3f] transition-colors flex items-center gap-4"
                              >
                                <Trash2 size={18} className="text-[#f28b82]" />
                                <span>Delete forever</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Video description text */}
                      <div
                        className={`absolute inset-0 flex items-center transition-opacity duration-200 ${
                          showHoverActions ? "opacity-0 -z-10 pointer-events-none" : "opacity-100 z-10"
                        }`}
                      >
                        {movie.description ? (
                          <span className="block text-sm text-muted-foreground truncate w-full" title={movie.description}>
                            {movie.description}
                          </span>
                        ) : (
                          <span className="block text-sm text-muted-foreground italic">No description</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notices */}
                <span className="text-base text-muted-foreground">—</span>

                {/* Visibility */}
                <div
                  className="relative flex items-center gap-1.5 cursor-pointer select-none"
                  onMouseEnter={() => setVisibilityHoverRowId(movie._id)}
                  onMouseLeave={() => setVisibilityHoverRowId(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    setVisibilityHoverRowId(null)
                    setVisibilityModalRowId(movie._id)
                  }}
                >
                  <Globe size={16} className="text-foreground flex-shrink-0" />
                  <span className="text-base text-foreground">
                    {({
                      private:   "Private",
                      unlisted:  "Unlisted",
                      scheduled: "Scheduled",
                    } as Record<string, string>)[movieVisibility[movie._id]] ?? "Public"}
                  </span>
                  <ChevronDown size={14} className="text-muted-foreground" />

                  {/* hover tooltip */}
                  {visibilityHoverRowId === movie._id && (
                    <div
                      className="absolute left-0 top-full mt-2 z-30 w-72 rounded-xl shadow-2xl p-4 pointer-events-none"
                      style={{ backgroundColor: "#212121", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <p className="text-sm font-semibold text-white mb-1.5">
                        You set this video to {({
                          private:   "private",
                          unlisted:  "unlisted",
                          scheduled: "scheduled",
                        } as Record<string, string>)[movieVisibility[movie._id]] ?? "public"}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: "#aaa" }}>
                        This video can be viewed by everyone on Hillywood, provided there are no notices affecting the video
                      </p>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div>
                  <p className="text-base text-foreground">{formatDate(movie.createdAt)}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Published</p>
                </div>

                {/* Views */}
                <p className="text-base text-foreground text-right">{movie.views.toLocaleString()}</p>

                {/* Comments */}
                <p
                  className="text-base text-right transition-colors duration-150 cursor-pointer"
                  style={{
                    color: showHoverActions ? "#3ea6ff" : "inherit"
                  }}
                >
                  {movie.commentCount ?? 0}
                </p>
              </div>
            )
          })
        )}
      </div>

      {/* ── Pagination Footer ── */}
      <div className="flex items-center justify-end gap-5 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-base text-muted-foreground">Rows per page:</span>
          <div className="flex items-center gap-0.5 cursor-pointer">
            <span className="text-base font-semibold text-foreground">{rowsPerPage}</span>
            <ChevronDown size={16} className="text-muted-foreground" />
          </div>
        </div>

        <span className="text-base text-muted-foreground">
          {pagination.total === 0 ? "0–0 of 0" : `${start}–${end} of ${pagination.total}`}
        </span>

        <div className="flex items-center gap-0.5">
          <button disabled={currentPage <= 1} onClick={() => goToPage(1)}
            className="p-1.5 text-foreground disabled:opacity-30 hover:text-muted-foreground transition-opacity" title="First page">
            <ChevronsLeft size={19} />
          </button>
          <button disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}
            className="p-1.5 text-foreground disabled:opacity-30 hover:text-muted-foreground transition-opacity" title="Previous page">
            <ChevronLeft size={19} />
          </button>
          <button disabled={currentPage >= pagination.totalPages} onClick={() => goToPage(currentPage + 1)}
            className="p-1.5 text-foreground disabled:opacity-30 hover:text-muted-foreground transition-opacity" title="Next page">
            <ChevronRight size={19} />
          </button>
          <button disabled={currentPage >= pagination.totalPages} onClick={() => goToPage(pagination.totalPages)}
            className="p-1.5 text-foreground disabled:opacity-30 hover:text-muted-foreground transition-opacity" title="Last page">
            <ChevronsRight size={19} />
          </button>
        </div>
      </div>

      {/* ── Visibility Save/Publish Modal ── */}
      {visibilityModalRowId && (
        <SaveOrPublishModal
          movieId={visibilityModalRowId}
          currentVisibility={movieVisibility[visibilityModalRowId] ?? "public"}
          onClose={() => setVisibilityModalRowId(null)}
          onSave={(vis) => {
            setMovieVisibility((prev) => ({ ...prev, [visibilityModalRowId]: vis }))
            setVisibilityModalRowId(null)
          }}
        />
      )}
    </div>
  )
}
