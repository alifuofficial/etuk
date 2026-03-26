'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Battery, 
  Gauge, 
  Ruler, 
  Timer, 
  Thermometer,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProductSpecs() {
  const { t } = useI18n();

  const specs = [
    { icon: Zap, label: 'Motor Power', value: '4000 W', color: 'text-yellow-400' },
    { icon: Battery, label: 'Battery', value: '7.6 KWh LiFePO4', color: 'text-green-400' },
    { icon: Gauge, label: 'Top Speed', value: '50+ KM/H', color: 'text-cyan-400' },
    { icon: Timer, label: 'Range', value: '180 KM', color: 'text-blue-400' },
    { icon: Ruler, label: 'Dimensions', value: '2660×1800×1360mm', color: 'text-purple-400' },
    { icon: Thermometer, label: 'Charge Time', value: '≤ 6 Hours', color: 'text-orange-400' },
  ];

  const features = [
    'GPS Tracking & Remote Connectivity',
    'Digital Cluster Display',
    'LED Headlights & Taillights',
    'Anti-Shock Absorbers',
    'Heavy-Duty Construction',
    'Spacious Cabin Design',
  ];

  return (
    <section id="products" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-4">
            Featured Product
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            ETUK Electric
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              3-Wheeler
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Heavy-duty electric vehicle designed for Ethiopian roads. 
            Perfect for passenger and cargo transport.
          </p>
        </div>

        {/* Product Showcase */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Vehicle Image */}
          <div className="relative">
            {/* Glow Background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[80px] animate-pulse" />
            </div>

            {/* Vehicle SVG */}
            <svg viewBox="0 0 500 350" className="w-full relative z-10 drop-shadow-[0_0_30px_rgba(0,255,255,0.2)]">
              <defs>
                <linearGradient id="prodBody" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#0e7490" />
                </linearGradient>
                <filter id="prodGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Shadow */}
              <ellipse cx="250" cy="310" rx="180" ry="20" fill="rgba(0,255,255,0.1)" />
              
              {/* Body */}
              <path d="M70 220 L120 150 L380 150 L430 220 L430 250 L70 250 Z" fill="url(#prodBody)" stroke="#22d3ee" strokeWidth="2" filter="url(#prodGlow)"/>
              <path d="M100 150 L140 90 L360 90 L400 150 Z" fill="#1e293b" stroke="#22d3ee" strokeWidth="2"/>
              
              {/* Windows */}
              <path d="M150 95 L165 145 L230 145 L230 95 Z" fill="#67e8f9" opacity="0.7"/>
              <path d="M240 95 L240 145 L335 145 L350 95 Z" fill="#67e8f9" opacity="0.7"/>
              
              {/* Lights */}
              <rect x="400" y="200" width="25" height="15" rx="3" fill="#00ffff" filter="url(#prodGlow)"/>
              <rect x="75" y="200" width="18" height="15" rx="3" fill="#ff4444"/>
              
              {/* Wheels */}
              <circle cx="150" cy="265" r="40" fill="#1e293b" stroke="#22d3ee" strokeWidth="3"/>
              <circle cx="150" cy="265" r="25" fill="#0f172a" stroke="#06b6d4" strokeWidth="2"/>
              <circle cx="150" cy="265" r="8" fill="#22d3ee"/>
              
              <circle cx="350" cy="265" r="40" fill="#1e293b" stroke="#22d3ee" strokeWidth="3"/>
              <circle cx="350" cy="265" r="25" fill="#0f172a" stroke="#06b6d4" strokeWidth="2"/>
              <circle cx="350" cy="265" r="8" fill="#22d3ee"/>
              
              {/* Text */}
              <text x="250" y="200" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">ETUK</text>
              <text x="250" y="220" textAnchor="middle" fill="#22d3ee" fontSize="10" letterSpacing="2">ELECTRIC</text>
            </svg>

            {/* Floating Badges */}
            <div className="absolute top-10 right-10 bg-black/60 backdrop-blur border border-cyan-500/30 rounded-lg px-3 py-2">
              <span className="text-cyan-400 font-bold">180 KM</span>
              <span className="text-gray-400 text-sm block">Range</span>
            </div>
            <div className="absolute bottom-20 left-10 bg-black/60 backdrop-blur border border-yellow-500/30 rounded-lg px-3 py-2">
              <span className="text-yellow-400 font-bold">4000W</span>
              <span className="text-gray-400 text-sm block">Motor</span>
            </div>
          </div>

          {/* Specs Grid */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">Technical Specifications</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {specs.map((spec, i) => (
                <div 
                  key={i} 
                  className="group bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <spec.icon className={`w-5 h-5 ${spec.color}`} />
                    <span className="text-gray-400 text-sm">{spec.label}</span>
                  </div>
                  <span className="text-xl font-bold text-white">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* Features List */}
            <div className="pt-6">
              <h4 className="text-lg font-semibold text-white mb-4">Key Features</h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-400">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6">
              <Link href="/become-agent">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-8 py-3 rounded-full">
                  Partner With Us
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
