'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import LeafletMap with SSR disabled as it requires window
const LeafletMap = dynamic(() => import('./LeafletMapContent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 flex items-center justify-center rounded-2xl animate-pulse">
      <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Loading Map Visualization...</p>
    </div>
  )
});

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

// Map of major cities to their geographically accurate Latitude and Longitude
const CITY_GEO_COORDINATES: Record<string, [number, number]> = {
  "Addis Ababa": [9.0333, 38.7500],
  "Addis Abeba": [9.0333, 38.7500],
  "Adama": [8.5414, 39.2689],
  "Dire Dawa": [9.6008, 41.8592],
  "Hawassa": [7.0621, 38.4725],
  "Awasa": [7.0621, 38.4725],
  "Bahir Dar": [11.5947, 37.3877],
  "Mek'ele": [13.4867, 39.4678],
  "Mekelle": [13.4867, 39.4678],
  "Gondar": [12.6000, 37.4667],
  "Jimma": [7.6750, 36.8354],
  "Dessie": [11.1333, 39.6333],
  "Shashemane": [7.2000, 38.6000],
  "Bishoftu": [8.7525, 38.9789],
  "Debre Zeyit": [8.7525, 38.9789],
  "Sodo": [6.8600, 37.7500],
  "Arba Minch": [6.0333, 37.5500],
  "Hosaena": [7.5500, 37.8500],
  "Harar": [9.3111, 42.1278],
  "Dilla": [6.4100, 38.3100],
  "Nekemte": [9.0833, 36.5500],
  "Debre Birhan": [9.6833, 39.5333],
  "Asella": [7.9500, 39.1167],
  "Debre Markos": [10.3333, 37.7333],
  "Kombolcha": [11.0833, 39.7333],
  "Debre Tabor": [11.8500, 38.0167],
  "Adigrat": [14.2778, 39.4611],
  "Weldiya": [11.8333, 39.6000],
  "Sebeta": [8.9167, 38.6167],
  "Burayu": [9.0500, 38.6500],
  "Jijiga": [9.3500, 42.8000],
  "Gambela": [8.2500, 34.5833],
  "Asosa": [10.0667, 34.5333],
  "Semera": [11.7917, 41.0000],
  "Gode": [5.9500, 43.5500],
  "Semera/Logia": [11.7917, 41.0000],
};

export default function EthiopiaMap({ data, className }: EthiopiaMapProps) {
  return (
    <div className={`relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight text-shadow-sm">Administrative View</h3>
          <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1 drop-shadow-sm">Interactive Leaflet Map</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50/50 px-4 py-2 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-deep-sky-blue/80 animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Agent Reach</span>
          </div>
        </div>
      </div>

      <div className="relative flex-1 w-full mt-4 min-h-[300px]">
        <LeafletMap data={data} geoCoordinates={CITY_GEO_COORDINATES} />
        
        {/* Dynamic Legend */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-200/50 p-4 rounded-3xl shadow-xl flex flex-col gap-3 max-w-[140px] pointer-events-none select-none z-[1000]">
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
        </div>

      </div>

      {/* Statistics Summary */}
      <div className="mt-8 flex items-center justify-between gap-4 px-2">
         <div className="flex items-center gap-8">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Network Cities</span>
               <span className="text-xl font-black text-gray-900 italic">{data.length}</span>
            </div>
            <div className="h-8 w-[1px] bg-gray-100" />
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Global Reach</span>
               <span className="text-xl font-black text-gray-900 italic">96%</span>
            </div>
         </div>
         
         <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100/50">
            <div className="flex -space-x-2">
              {[1, 2].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
              ))}
            </div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter leading-tight italic">
              National<br/>Coverage
            </span>
         </div>
      </div>
    </div>
  );
}
