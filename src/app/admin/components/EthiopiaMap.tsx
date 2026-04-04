'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Map of major cities to their relative coordinates on the SVG (0-100)
const CITY_COORDINATES: Record<string, { x: number; y: number }> = {
  "Addis Ababa": { x: 52, y: 53 },
  "Addis Abeba": { x: 52, y: 53 },
  "Adama": { x: 57, y: 56 },
  "Dire Dawa": { x: 74, y: 47 },
  "Hawassa": { x: 53, y: 72 },
  "Bahir Dar": { x: 38, y: 35 },
  "Mek'ele": { x: 55, y: 15 },
  "Mekelle": { x: 55, y: 15 },
  "Gondar": { x: 35, y: 24 },
  "Jimma": { x: 37, y: 64 },
  "Dessie": { x: 58, y: 41 },
  "Shashemane": { x: 52, y: 68 },
  "Bishoftu": { x: 55, y: 54 },
  "Sodo": { x: 44, y: 73 },
  "Arba Minch": { x: 42, y: 81 },
  "Hosaena": { x: 46, y: 65 },
  "Harar": { x: 77, y: 49 },
  "Dilla": { x: 53, y: 77 },
  "Nekemte": { x: 34, y: 52 },
  "Debre Birhan": { x: 56, y: 49 },
  "Asella": { x: 58, y: 62 },
  "Debre Markos": { x: 44, y: 45 },
  "Kombolcha": { x: 59, y: 43 },
  "Debre Tabor": { x: 43, y: 31 },
  "Adigrat": { x: 57, y: 10 },
  "Weldiya": { x: 57, y: 35 },
  "Sebeta": { x: 50, y: 54 },
  "Burayu": { x: 51, y: 52 },
  "Jijiga": { x: 86, y: 53 },
  "Gambela": { x: 12, y: 65 },
  "Asosa": { x: 15, y: 46 },
  "Semera": { x: 67, y: 32 },
  "Logia": { x: 67, y: 33 },
};

export default function EthiopiaMap({ data, className }: EthiopiaMapProps) {
  // SVG ViewBox dimensions
  const width = 800;
  const height = 700;

  // Ethiopia path (Simplified high-quality outline)
  const ethiopiaPath = "M446.5,73.5 L477,66.5 L500.5,84.5 L530,68.5 L558.5,84.5 L589.5,84.5 L607,117.5 L622.5,138 L656.5,189.5 L656.5,231 L699,231 L735,268.5 L735,312.5 L783,391 L783,467.5 L755.5,502.5 L735,532.5 L674.5,550 L644.5,571 L622.5,593 L622.5,630.5 L607,671.5 L567,651 L537.5,671.5 L490,671.5 L475.5,640 L446.5,651 L418,671.5 L346.5,671.5 L328,630.5 L286,630.5 L252,651 L205.5,630.5 L173.5,630.5 L160,593 L126,550 L77.5,550 L10,502.5 L10,480.5 L50.5,455.5 L77.5,435 L77.5,372.5 L62.5,335.5 L62.5,296.5 L106.5,278 L126,247 L126,196 L145.5,170.5 L183,189.5 L233.5,170.5 L252,148 L286,148 L308.5,117.5 L346.5,103.5 L382,103.5 L411.5,84.5 Z";

  return (
    <div className={`relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Distribution Map</h3>
          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time Agent Density</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-deep-sky-blue" />
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Approved Agents</span>
          </div>
        </div>
      </div>

      <div className="relative aspect-[8/7] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Shadow Map */}
          <path
            d={ethiopiaPath}
            fill="#f1f5f9"
            className="transition-all duration-700"
          />
          
          {/* Main Map Path */}
          <path
            d={ethiopiaPath}
            stroke="#e2e8f0"
            strokeWidth="2"
            fill="#ffffff"
            className="transition-all duration-700"
          />

          {/* City Markers */}
          {data.map((cityData) => {
            const coords = CITY_COORDINATES[cityData.city];
            if (!coords) return null;

            const pxX = (coords.x / 100) * width;
            const pxY = (coords.y / 100) * height;
            
            // Calculate size based on count (min 8, max 24)
            const count = cityData._count.id;
            const size = Math.min(Math.max(count * 5, 10), 40);

            return (
              <g key={cityData.city} className="cursor-pointer group">
                {/* Pulse Effect */}
                <motion.circle
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 3, delay: Math.random() * 2 }}
                  cx={pxX}
                  cy={pxY}
                  r={size + 8}
                  fill="#0ea5e9"
                />
                
                {/* Main Marker */}
                <motion.circle
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  cx={pxX}
                  cy={pxY}
                  r={size / 2}
                  fill="#0ea5e9"
                  stroke="white"
                  strokeWidth="3"
                  className="shadow-xl"
                />

                {/* Tooltip Hover Area */}
                <rect
                  x={pxX - 40}
                  y={pxY - 40}
                  width={80}
                  height={80}
                  fill="transparent"
                  className="pointer-events-auto"
                />

                {/* Custom Tooltip */}
                <foreignObject
                  x={pxX - 60}
                  y={pxY - (size / 2) - 45}
                  width="120"
                  height="40"
                  className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-900 px-3 py-1.5 rounded-full shadow-2xl border border-gray-800 flex items-center gap-2">
                       <span className="text-[9px] font-black text-white uppercase whitespace-nowrap tracking-tighter">
                        {cityData.city}
                      </span>
                      <div className="w-4 h-4 rounded-full bg-deep-sky-blue flex items-center justify-center">
                        <span className="text-[8px] font-black text-white">{count}</span>
                      </div>
                    </div>
                    <div className="w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-1" />
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* Legend / Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100 flex flex-col gap-2">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Hubs</p>
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              </div>
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-white bg-deep-sky-blue flex items-center justify-center">
              <span className="text-[7px] font-black text-white">+{data.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
