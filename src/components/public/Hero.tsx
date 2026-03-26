'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, ChevronRight, Play, Battery, Gauge, MapPin } from 'lucide-react';
import { useI18n } from '@/lib/i18n/useI18n';
import Link from 'next/link';

export default function Hero() {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Electric particles
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${particle.alpha})`;
        ctx.fill();

        // Connect nearby particles
        particles.slice(i + 1).forEach((p2) => {
          const dx = particle.x - p2.x;
          const dy = particle.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 * (1 - dist / 100)})`;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section id="home" className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-transparent to-blue-900/20" />

      {/* Electric Lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-pulse" />
        <div className="absolute top-2/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-pulse delay-500" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse delay-1000" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-0">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">100% Electric • Zero Emissions</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              <span className="block">Power Your</span>
              <span className="block bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Journey
              </span>
              <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-400 mt-2">
                With ETUK
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
              Ethiopia's first heavy-duty electric 3-wheeler. Engineered for African roads, 
              designed for the future. Join the electric revolution.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link href="/become-agent">
                <Button
                  size="lg"
                  className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-6 text-lg rounded-full overflow-hidden shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                >
                  <span className="relative z-10 flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Become an Agent
                  </span>
                  <ChevronRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#products">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white hover:border-cyan-500/50 px-8 py-6 text-lg rounded-full group"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:text-cyan-400 transition-colors" />
                  Explore Vehicles
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { icon: Gauge, value: '50+', label: 'KM/H Speed' },
                { icon: Battery, value: '180', label: 'KM Range' },
                { icon: MapPin, value: '11', label: 'Regions' },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                    <stat.icon className="w-5 h-5 text-cyan-400" />
                    <span className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <span className="text-sm text-gray-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Vehicle */}
          <div className="relative hidden lg:block">
            {/* Glow Effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />
            </div>

            {/* Vehicle SVG */}
            <div className="relative z-10">
              <svg viewBox="0 0 600 400" className="w-full drop-shadow-[0_0_50px_rgba(0,255,255,0.3)]">
                <defs>
                  <linearGradient id="bodyGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#0891b2" />
                    <stop offset="100%" stopColor="#0e7490" />
                  </linearGradient>
                  <linearGradient id="glassGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#67e8f9" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                  <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Ground Shadow */}
                <ellipse cx="300" cy="350" rx="200" ry="30" fill="rgba(0,255,255,0.1)" />
                
                {/* Main Body */}
                <path 
                  d="M100 250 L160 160 L480 160 L540 250 L540 280 L100 280 Z" 
                  fill="url(#bodyGlow)" 
                  stroke="#22d3ee" 
                  strokeWidth="2"
                  filter="url(#neonGlow)"
                />
                
                {/* Roof */}
                <path 
                  d="M140 160 L190 80 L420 80 L470 160 Z" 
                  fill="#1e293b" 
                  stroke="#22d3ee" 
                  strokeWidth="2"
                  filter="url(#neonGlow)"
                />

                {/* Windows */}
                <path 
                  d="M200 90 L220 150 L290 150 L290 90 Z" 
                  fill="url(#glassGlow)" 
                  opacity="0.8"
                />
                <path 
                  d="M300 90 L300 150 L380 150 L400 90 Z" 
                  fill="url(#glassGlow)" 
                  opacity="0.8"
                />

                {/* Headlights */}
                <rect 
                  x="505" y="220" width="30" height="20" rx="4" 
                  fill="#00ffff" 
                  filter="url(#strongGlow)"
                />
                <rect 
                  x="105" y="220" width="20" height="20" rx="4" 
                  fill="#ff4444"
                  filter="url(#neonGlow)"
                />

                {/* Wheels */}
                <g filter="url(#neonGlow)">
                  <circle cx="200" cy="300" r="50" fill="#1e293b" stroke="#22d3ee" strokeWidth="3"/>
                  <circle cx="200" cy="300" r="30" fill="#0f172a" stroke="#06b6d4" strokeWidth="2"/>
                  <circle cx="200" cy="300" r="10" fill="#22d3ee"/>
                  
                  <circle cx="420" cy="300" r="50" fill="#1e293b" stroke="#22d3ee" strokeWidth="3"/>
                  <circle cx="420" cy="300" r="30" fill="#0f172a" stroke="#06b6d4" strokeWidth="2"/>
                  <circle cx="420" cy="300" r="10" fill="#22d3ee"/>
                </g>

                {/* Electric Arc Effects */}
                <path 
                  d="M150 220 Q180 210 160 230 Q190 220 170 240" 
                  stroke="#00ffff" 
                  strokeWidth="2" 
                  fill="none"
                  opacity="0.6"
                  filter="url(#neonGlow)"
                >
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite"/>
                </path>

                {/* Brand */}
                <text 
                  x="300" y="220" 
                  textAnchor="middle" 
                  fill="#ffffff" 
                  fontSize="32" 
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  filter="url(#neonGlow)"
                >
                  ETUK
                </text>
                <text 
                  x="300" y="245" 
                  textAnchor="middle" 
                  fill="#22d3ee" 
                  fontSize="12"
                  fontFamily="sans-serif"
                  letterSpacing="4"
                >
                  ELECTRIC
                </text>
              </svg>
            </div>

            {/* Location Badge */}
            <div className="absolute bottom-10 right-10 bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-xl px-4 py-3 shadow-lg shadow-cyan-500/10">
              <div className="flex items-center gap-2 text-cyan-400">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Assembled in Modjo, Ethiopia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-cyan-500/50 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-cyan-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
