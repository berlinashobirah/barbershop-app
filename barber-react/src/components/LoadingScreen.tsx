import React from 'react'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Glowing Rotating Circle (Outer) */}
        <div className="absolute inset-0 rounded-full border-[3px] border-[#eac249]/20"></div>
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#eac249] border-r-[#eac249] animate-[spin_1.5s_linear_infinite] shadow-[0_0_20px_rgba(234,194,73,0.5)]"></div>
        
        {/* Inner reverse rotating circle */}
        <div className="absolute inset-4 rounded-full border border-[#eac249]/10"></div>
        <div className="absolute inset-4 rounded-full border border-transparent border-l-[#eac249]/50 border-b-[#eac249]/50 animate-[spin_2s_linear_infinite_reverse]"></div>

        {/* Central Logo Box */}
        <div className="relative w-32 h-32 flex items-center justify-center transform -rotate-45">
          {/* Comb SVG (Static) */}
          <svg className="absolute w-24 h-24 text-[#eac249]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15,50 L85,50 L85,60 L15,60 Z" fill="none" strokeLinejoin="round"/>
            {/* Teeth of the comb */}
            <line x1="20" y1="50" x2="20" y2="35" strokeLinecap="round" />
            <line x1="25" y1="50" x2="25" y2="35" strokeLinecap="round" />
            <line x1="30" y1="50" x2="30" y2="35" strokeLinecap="round" />
            <line x1="35" y1="50" x2="35" y2="35" strokeLinecap="round" />
            <line x1="40" y1="50" x2="40" y2="35" strokeLinecap="round" />
            <line x1="45" y1="50" x2="45" y2="35" strokeLinecap="round" />
            <line x1="50" y1="50" x2="50" y2="35" strokeLinecap="round" />
            <line x1="55" y1="50" x2="55" y2="35" strokeLinecap="round" />
            <line x1="60" y1="50" x2="60" y2="35" strokeLinecap="round" />
            <line x1="65" y1="50" x2="65" y2="35" strokeLinecap="round" />
            <line x1="70" y1="50" x2="70" y2="35" strokeLinecap="round" />
            <line x1="75" y1="50" x2="75" y2="35" strokeLinecap="round" />
            <line x1="80" y1="50" x2="80" y2="35" strokeLinecap="round" />
          </svg>

          {/* Scissors SVG (Animated) */}
          <svg className="absolute w-28 h-28 text-[#eac249] overflow-visible transform rotate-90" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
            {/* Pivot Point */}
            <circle cx="50" cy="50" r="3" fill="#131313" stroke="currentColor"/>
            
            {/* Top Blade Group (animated to cut down) */}
            <g className="origin-[50px_50px] animate-[cutTop_0.8s_ease-in-out_infinite]">
              {/* Blade */}
              <path d="M50,48 L95,42 L95,48 Z" fill="none" strokeLinejoin="round"/>
              {/* Handle */}
              <path d="M50,48 L35,38" />
              {/* Ring */}
              <circle cx="28" cy="34" r="8" />
              <circle cx="28" cy="34" r="4" />
              {/* Finger rest */}
              <path d="M20,34 C16,34 14,36 12,40" strokeLinecap="round" />
            </g>

            {/* Bottom Blade Group (animated to cut up) */}
            <g className="origin-[50px_50px] animate-[cutBottom_0.8s_ease-in-out_infinite]">
              {/* Blade */}
              <path d="M50,52 L95,58 L95,52 Z" fill="none" strokeLinejoin="round"/>
              {/* Handle */}
              <path d="M50,52 L35,62" />
              {/* Ring */}
              <circle cx="28" cy="66" r="8" />
              <circle cx="28" cy="66" r="4" />
            </g>
          </svg>
        </div>
      </div>

      {/* Text Container */}
      <div className="absolute mt-64 flex flex-col items-center">
        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#eac249] to-transparent mt-3 opacity-50"></div>
      </div>

      <style>{`
        @keyframes cutTop {
          0%, 100% { transform: rotate(-20deg); }
          50% { transform: rotate(0deg); }
        }
        @keyframes cutBottom {
          0%, 100% { transform: rotate(20deg); }
          50% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  )
}
