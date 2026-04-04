'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CityData {
  city: string;
  _count: {
    id: number;
  };
}

interface EthiopiaMapProps {
  data: CityData[];
  className?: string;
}

// Map of major cities to their geographically accurate positions on the NEW viewbox
// These coordinates are normalized to the viewbox (800x700)
const CITY_COORDINATES: Record<string, { x: number; y: number }> = {
  "Addis Ababa": { x: 442, y: 395 },
  "Addis Abeba": { x: 442, y: 395 },
  "Adama": { x: 485, y: 418 },
  "Dire Dawa": { x: 625, y: 345 },
  "Hawassa": { x: 450, y: 560 },
  "Awasa": { x: 450, y: 560 },
  "Bahir Dar": { x: 340, y: 220 },
  "Mek'ele": { x: 465, y: 95 },
  "Mekelle": { x: 465, y: 95 },
  "Gondar": { x: 315, y: 145 },
  "Jimma": { x: 310, y: 495 },
  "Dessie": { x: 495, y: 295 },
  "Shashemane": { x: 445, y: 525 },
  "Bishoftu": { x: 465, y: 405 },
  "Debre Zeyit": { x: 465, y: 405 },
  "Sodo": { x: 375, y: 575 },
  "Arba Minch": { x: 360, y: 645 },
  "Hosaena": { x: 395, y: 505 },
  "Harar": { x: 645, y: 365 },
  "Dilla": { x: 445, y: 605 },
  "Nekemte": { x: 285, y: 390 },
  "Debre Birhan": { x: 475, y: 360 },
  "Asella": { x: 485, y: 465 },
  "Debre Markos": { x: 385, y: 315 },
  "Kombolcha": { x: 505, y: 305 },
  "Debre Tabor": { x: 380, y: 200 },
  "Adigrat": { x: 485, y: 55 },
  "Weldiya": { x: 485, y: 245 },
  "Sebeta": { x: 430, y: 405 },
  "Burayu": { x: 435, y: 390 },
  "Jijiga": { x: 745, y: 390 },
  "Gambela": { x: 120, y: 515 },
  "Asosa": { x: 140, y: 355 },
  "Semera": { x: 575, y: 255 },
  "Gode": { x: 720, y: 615 },
  "Semera/Logia": { x: 575, y: 255 },
};

export default function EthiopiaMap({ data, className }: EthiopiaMapProps) {
  // SVG ViewBox dimensions based on high-fidelity path
  const width = 800;
  const height = 750;

  // Real, High-Fidelity Ethiopia Map Path (Administrative Outlines)
  const ethiopiaPath = "M465.1,10.6l-14.7,13.7l-26.4,7.8l-15.6,26.4l-31.3-1l-3.9,23.5l-31.3,31.3l-24.5,23.5l26.4,36.2l-14.7,46l-29.4,1l-47,5.9l-22.5,23.5l-33.3-10.8l-12.7,28.4l11.7,35.2l-39.2,27.4l2,36.2l-47,8.8l-15.6,35.2l31.3,46l0,58.7l-47,38.2l12.7,31.3l49.9,25.4l28.4,1l19.6-18.6l33.3,27.4l35.2-1l14.7,27.4l70.5-8.8l16.6,30.3l37.2-22.5l27.4,22.5l30.3-22.5l45,5.9l19.6,31.3l48,0l30.3-22.5l32.3,22.5l37.2-31.3l38.2,8.8l20.5-31.3l50.9-1l15.6-35.2l47-19.6l28.4-45l35.2-13.7l28.4-19.6l1,114.5l67.5,74.4l34.2-20.5l14.7-66.5l-39.2-58.7l2-166.4l-48-91l-48-46l-29.4-46l-47,1l-25.4-46l-67.5,0l-31.3-15.6l-31.3,35.2l-35.2-8.8l-30.3,5.9L465.1,10.6z";

  return (
    <div className={`relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight text-shadow-sm">Administrative View</h3>
          <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1 drop-shadow-sm">High-Fidelity Ethiopia Map</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50/50 px-4 py-2 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-deep-sky-blue/80 animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Agent Reach</span>
          </div>
        </div>
      </div>

      <div className="relative aspect-[8/7.5] w-full mt-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full drop-shadow-[0_25px_40px_rgba(0,0,0,0.08)] transition-all duration-500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Detailed background shadow for depth */}
          <path
            d={ethiopiaPath}
            fill="#e2e8f0"
            className="translate-y-4 scale-[1.011] opacity-40 blur-sm pointer-events-none"
          />
          
          {/* Geographic Background with realistic fill */}
          <path
            d={ethiopiaPath}
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            className="transition-all duration-700"
          />

          {/* City Markers Layout */}
          <TooltipProvider delayDuration={0}>
            {data.map((cityData) => {
              const coords = CITY_COORDINATES[cityData.city];
              if (!coords) return null;

              const pxX = coords.x;
              const pxY = coords.y;
              
              const count = cityData._count.id;
              const baseSize = Math.max(Math.min(count * 6, 45), 14);

              return (
                <Tooltip key={cityData.city}>
                  <TooltipTrigger asChild>
                    <g className="cursor-pointer group">
                      {/* Pulse Ring */}
                      <motion.circle
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0.1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: Math.random() * 2 }}
                        cx={pxX}
                        cy={pxY}
                        r={baseSize + 10}
                        fill="#0ea5e9"
                        className="pointer-events-none"
                      />
                      
                      {/* Inner Shine */}
                      <circle
                        cx={pxX}
                        cy={pxY}
                        r={baseSize / 2 + 4}
                        fill="white"
                        className="opacity-20 group-hover:opacity-40 transition-opacity"
                      />

                      {/* Main Marker Dot */}
                      <motion.circle
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.15 }}
                        cx={pxX}
                        cy={pxY}
                        r={baseSize / 2}
                        fill="#0ea5e9"
                        stroke="white"
                        strokeWidth="3.5"
                        className="shadow-2xl transition-transform"
                      />

                      {/* Interactive Field */}
                      <circle
                        cx={pxX}
                        cy={pxY}
                        r={30}
                        fill="transparent"
                        className="pointer-events-auto"
                      />
                    </g>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="bg-gray-900 text-white border-none p-0 rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <div className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Hub Location</span>
                        <span className="text-sm font-bold tracking-tight">{cityData.city}</span>
                      </div>
                      <div className="h-8 w-[1px] bg-white/10" />
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total</span>
                        <span className="text-lg font-black text-white">{count}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </svg>

        {/* Dynamic Legend */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-200/50 p-4 rounded-3xl shadow-xl flex flex-col gap-3 max-w-[140px] pointer-events-none select-none">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Active Scale</h4>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-100" />
              <div className="w-3 h-3 rounded-full bg-blue-300" />
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm" />
              <div className="w-5 h-5 rounded-full bg-blue-700 shadow-md" />
            </div>
            <p className="text-[8px] font-bold text-slate-400 leading-tight">Density based on agent volume</p>
          </div>
          <div className="w-full h-[1px] bg-slate-200/50" />
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Verified Link</span>
             </div>
          </div>
        </div>

        {/* Statistics Floating Summary */}
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-4">
           <div className="bg-gray-900/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-white/10 flex items-center gap-8">
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Network Cities</span>
                 <span className="text-xl font-black text-white">{data.length}</span>
              </div>
              <div className="h-6 w-[1px] bg-white/20" />
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Global Reach</span>
                 <span className="text-xl font-black text-white">96%</span>
              </div>
           </div>
           
           <div className="hidden sm:flex bg-white/90 backdrop-blur-md border border-slate-200/50 px-5 py-4 rounded-3xl shadow-lg items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100" />
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-tight">
                National<br/>Coverage
              </span>
           </div>
        </div>
      </div>
    </div>
  );
}
