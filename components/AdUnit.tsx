// components/AdUnit.tsx - Safe version
'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: string;
  className?: string;
}

export default function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  
  // This flag controls whether to show placeholder styling
  // BUT the AdSense code is ALWAYS in the HTML
  const SHOW_PLACEHOLDER = true;  // Change to false after approval

  useEffect(() => {
    // Only push to AdSense after approval
    if (!SHOW_PLACEHOLDER && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        try {
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
        } catch (error) {
          console.error('AdSense error:', error);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* ✅ REAL ADSENSE CODE - Always present for Google to see */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-2883274357629338"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      
      {/* ✅ Placeholder overlay - Only shows when SHOW_PLACEHOLDER is true */}
      {SHOW_PLACEHOLDER && (
        <div className="absolute inset-0 bg-black rounded-lg flex flex-col items-center justify-center pointer-events-none">
          {/* <div className="text-red-600 font-bold text-lg">ADVERTISEMENT</div>
          <div className="text-white text-sm">Space reserved for sponsors</div>
          <div className="text-gray-500 text-xs mt-2">Slot: {slot} | Waiting for Approval</div> */}
        </div>
      )}
    </div>
  );
}