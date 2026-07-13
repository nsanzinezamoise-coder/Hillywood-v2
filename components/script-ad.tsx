"use client"

import { useEffect, useRef } from 'react'

interface ScriptAdProps {
  id: string
}

export function ScriptAd({ id }: ScriptAdProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

    // Skip ad loading on mobile to prevent history API conflicts
    if (window.innerWidth < 768) {
      return
    }

    // Clean up previous scripts if any
    if (containerRef.current) {
      try {
        containerRef.current.innerHTML = ''
        
        const scriptConfig = document.createElement('script')
        scriptConfig.type = 'text/javascript'
        scriptConfig.innerHTML = `
          atOptions = {
            'key' : '97b4426178963f039a83a25bb37b3574',
            'format' : 'iframe',
            'height' : 370,
            'width' : 400,
            'params' : {}
          };
        `
        
        const scriptInvoke = document.createElement('script')
        scriptInvoke.type = 'text/javascript'
        scriptInvoke.src = "https://www.highperformanceformat.com/97b4426178963f039a83a25bb37b3574/invoke.js"
        scriptInvoke.async = true
        scriptInvoke.onerror = () => {
          console.warn('Ad script failed to load')
        }

        containerRef.current.appendChild(scriptConfig)
        containerRef.current.appendChild(scriptInvoke)
      } catch (error) {
        console.warn('Failed to load ads:', error)
      }
    }
  }, [id])

  return (
    <div 
      className="flex flex-col items-center justify-center rounded-xl bg-black shadow-none relative overflow-hidden"
      style={{ width: '400px', height: '370px' }}
    >
      <div id={id} ref={containerRef} className="bg-black flex items-center justify-center w-full h-full">
        {/* Ad will be injected here into the inner container */}
      </div>
      <div className="absolute bottom-1 right-2 pointer-events-none">
        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest opacity-20">Advertisement</p>
      </div>
    </div>
  )
}
