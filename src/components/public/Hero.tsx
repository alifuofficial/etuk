'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, ChevronRight, Play, Battery, Gauge, MapPin } from 'lucide-react';
import { useI18n } from '@/lib/i18n/useI18n';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 191, 255, ${particle.alpha})`;
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
            ctx.strokeStyle = `rgba(0, 191, 255, ${0.1 * (1 - dist / 100)})`;
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
    <section id="home" className="relative min-h-[90vh] bg-white overflow-hidden flex flex-col justify-center pt-32 lg:pt-40">
      {/* Background Typography - Simplified for clarity */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden">
        <h2 className="text-[25vw] font-black text-slate-50 leading-none tracking-tighter uppercase blur-[1px]">
          ETUK
        </h2>
      </div>

      {/* Animated Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-10" />

      {/* Grid & Glows */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,191,255,0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* Dynamic Glows */}
      <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-deep-sky-blue/[0.03] rounded-full blur-[150px] animate-glow" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16 items-center py-20 lg:py-0">
          
          {/* Main Content (7 Columns) */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-3 bg-deep-sky-blue/10 border border-deep-sky-blue/20 rounded-full px-5 py-2 mb-8">
                <Zap className="w-4 h-4 text-deep-sky-blue" />
                <span className="text-deep-sky-blue text-[10px] font-black uppercase tracking-[0.2em]">{t('hero.badge')}</span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 mb-8 leading-[0.9] tracking-tighter">
                {t('hero.titleTop')}<br />
                <span className="text-deep-sky-blue italic">{t('hero.titleBottom')}</span>
              </h1>

              <div className="max-w-xl mx-auto lg:mx-0">
                <p className="text-xl text-slate-500 mb-12 leading-relaxed font-medium">
                  {t('hero.description')}
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                  <Link href="/become-agent">
                    <Button
                      size="lg"
                      className="bg-deep-sky-blue hover:bg-slate-900 text-white font-black px-12 py-8 text-xl rounded-2xl shadow-xl shadow-deep-sky-blue/20 transition-all hover:-translate-y-1"
                    >
                      {t('hero.cta')}
                    </Button>
                  </Link>
                  <Link href="/#heritage">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="text-slate-900 hover:text-deep-sky-blue px-12 py-8 text-xl rounded-2xl border border-slate-100"
                    >
                      {t('hero.learnMore')}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual Piece (5 Columns) */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <img 
                src="/images/tuk-side.png" 
                alt="ETUK Hero" 
                className="w-full h-auto drop-shadow-[0_40px_80px_rgba(0,191,255,0.15)] relative z-20"
              />
              
              {/* Simple Feature Tags similar to competitor but more premium */}
              <div className="absolute -top-10 -right-4 bg-white/90 backdrop-blur-md border border-slate-100 p-4 rounded-2xl shadow-xl z-30 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-deep-sky-blue animate-pulse" />
                  <span className="text-xs font-black text-slate-900">{t('hero.motorTag')}</span>
                </div>
              </div>
              <div className="absolute bottom-10 -left-10 bg-slate-900 text-white p-4 rounded-2xl shadow-xl z-30 animate-float [animation-delay:1s]">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-deep-sky-blue" />
                  <span className="text-xs font-black uppercase tracking-widest">{t('hero.chargeTag')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
