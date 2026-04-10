'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

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
  className?: string;
}

// Map of major cities to their geographically accurate Latitude and Longitude
const CITY_GEO_COORDINATES: Record<string, [number, number]> = {
  // Major Cities & Varieties
  "addisababa": [9.0333, 38.7500],
  "adis ababa": [9.0333, 38.7500],
  "adama": [8.5414, 39.2689],
  "nazreth": [8.5414, 39.2689],
  "nazareth": [8.5414, 39.2689],
  "dire dawa": [9.6008, 41.8592],
  "diredawa": [9.6008, 41.8592],
  "hawassa": [7.0621, 38.4725],
  "awasa": [7.0621, 38.4725],
  "bahir dar": [11.5947, 37.3877],
  "bahirdar": [11.5947, 37.3877],
  "mekelle": [13.4867, 39.4678],
  "mekele": [13.4867, 39.4678],
  "mek'ele": [13.4867, 39.4678],
  "gondar": [12.6000, 37.4667],
  "gonder": [12.6000, 37.4667],
  "jimma": [7.6750, 36.8354],
  "jima": [7.6750, 36.8354],
  "dessie": [11.1333, 39.6333],
  "desie": [11.1333, 39.6333],
  "shashemane": [7.2000, 38.6000],
  "shashemene": [7.2000, 38.6000],
  "bishoftu": [8.7525, 38.9789],
  "debre zeyit": [8.7525, 38.9789],
  "debrezeit": [8.7525, 38.9789],
  "modjo": [8.5917, 39.1167],
  "mojo": [8.5917, 39.1167],
  "ziway": [7.9333, 38.7167],
  "batu": [7.9333, 38.7167],
  "negele": [5.3333, 39.5833],
  "chiro": [9.2000, 40.8667],
  "asebe teferi": [9.2000, 40.8667],
  "wolaita sodo": [6.8600, 37.7500],
  "wolayta sodo": [6.8600, 37.7500],
  "sodo": [6.8600, 37.7500],
  "hosaena": [7.5500, 37.8500],
  "hosaina": [7.5500, 37.8500],
  "hosanna": [7.5500, 37.8500],
  "moyale": [3.5167, 39.0500],
};

export default function EthiopiaMap({ className }: EthiopiaMapProps) {
  const [data, setData] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocationData();
  }, []);

  const fetchLocationData = async () => {
    try {
      const res = await fetch('/api/admin/locations');
      if (res.ok) {
        const result = await res.json();
        setData(result.agentsByCity || []);
      }
    } catch (error) {
      console.error('Failed to fetch location data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm overflow-hidden flex flex-col ${className}`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      </div>
    );
  }

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
