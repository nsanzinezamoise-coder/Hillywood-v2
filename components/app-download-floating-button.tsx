"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X, Smartphone, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AppDownloadFloatingButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const handleDownload = () => {
    // Create an anchor element and trigger download
    const link = document.createElement('a')
    link.href = '/app-release.apk'
    link.download = 'app-release.apk'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Close the popup after download
    setIsOpen(false)
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
    setIsOpen(false) // Close popup when hiding/showing
  }

  // Don't render anything until after hydration
  if (!hasMounted) return null

  // Hide on shorts pages
  if (pathname?.startsWith("/shorts")) return null

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-card border border-primary/20 p-4 rounded-2xl shadow-2xl max-w-[280px] backdrop-blur-md relative overflow-hidden group"
          >
            {/* Animated background decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
            
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex gap-4 items-start">
              <div className="bg-primary/10 p-2 rounded-xl">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-sm">Download Mobile App</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Download the Hillywood app for the best viewing experience.
                  <br />
                  <span className="font-bold text-sm ">For Android devices</span>
                </p>
              </div>
            </div>

            <Button 
              onClick={handleDownload}
              className="w-full mt-4 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 group/btn"
            >
              <Download className="h-4 w-4 group-hover/btn:translate-y-0.5 transition-transform" />
              Download Now
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button with hide/show functionality */}
      <div 
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <AnimatePresence>
          {isVisible && (
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative flex items-center justify-center h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
                isOpen ? "bg-muted text-foreground" : "bg-primary text-white"
              )}
            >
              {/* Pulsing ring animation when closed */}
              {!isOpen && (
                <motion.span
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-primary/60 -z-10"
                />
              )}
              
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Download className="h-6 w-6" />
              )}

              {/* Badge */}
              {!isOpen && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-100"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-black"></span>
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Hide/Show toggle button */}
        <motion.button
          onClick={toggleVisibility}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "absolute -top-2 -right-2 p-1.5 rounded-full shadow-lg transition-all duration-200",
            isVisible 
              ? "bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground" 
              : "bg-primary text-white"
          )}
          title={isVisible ? "Hide button" : "Show button"}
        >
          {isVisible ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </motion.button>

        {/* Tooltip for hide/show button */}
        <AnimatePresence>
          {isHovering && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-popover text-popover-foreground text-xs py-1.5 px-2.5 rounded-lg shadow-lg border"
            >
              {isVisible ? "Download App" : "Download App"}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-popover border-r border-t" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}