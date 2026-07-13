"use client"

import { motion } from "framer-motion"
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboardModal } from "./DashboardModalProvider"

interface StatusRowProps {
  label: string
  status: "good" | "warning" | "error"
  value?: string
}

function StatusRow({ label, status, value }: StatusRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-none">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {value && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              status === "error"
                ? "bg-red-500/20 text-red-500 dark:text-red-400"
                : status === "warning"
                ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                : "bg-green-500/20 text-green-600 dark:text-green-400"
            }`}
          >
            {value}
          </span>
        )}
        {status === "good" && <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />}
        {status === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />}
        {status === "error" && <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />}
      </div>
    </div>
  )
}

export function ChannelStatusCard() {
  const { openModal } = useDashboardModal()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-base">Channel violations</h3>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-secondary">
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col">
        <StatusRow label="Active copyright strikes" status="error" value="2 of 3" />
        <StatusRow label="Community guidelines" status="good" />
        <StatusRow label="Monetization" status="good" />
        <StatusRow label="Verification" status="warning" />
        <StatusRow label="Active warnings" status="warning" value="1" />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full mt-1 text-xs"
        onClick={() => openModal("violations")}
      >
        View Details
      </Button>
    </motion.div>
  )
}
