'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js/React
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CityData {
  city: string;
  _count: {
    id: number;
  };
}

interface LeafletMapProps {
  data: CityData[];
  geoCoordinates: Record<string, [number, number]>;
}

export default function LeafletMap({ data, geoCoordinates }: LeafletMapProps) {
  // Center of Ethiopia
  const center: [number, number] = [9.145, 40.4896];
  const zoom = 6;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', background: '#f8fafc' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {data.map((cityData) => {
          const normalizedCity = cityData.city.toLowerCase().trim();
          const coords = geoCoordinates[normalizedCity];
          
          if (!coords) {
            console.warn(`Map: No coordinates found for city "${cityData.city}" (Normalized: "${normalizedCity}")`);
            return null;
          }

          console.log(`Map: Pinned ${cityData.city} with ${cityData._count.id} approved agents.`);

          const count = cityData._count.id;
          return (
            <Marker 
              key={cityData.city} 
              position={coords}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={false}>
                <div className="flex items-center gap-3 p-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Hub Location</span>
                    <span className="text-sm font-bold tracking-tight text-slate-900">{cityData.city}</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-200" />
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</span>
                    <span className="text-lg font-black text-slate-900">{count}</span>
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
