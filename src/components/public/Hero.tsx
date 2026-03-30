'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/useI18n';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

// Static particles data - generated once
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 20 + 10,
  delay: Math.random() * 5,
}));

function HeroContent() {
  const { t } = useI18n();
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-3 bg-deep-sky-blue/10 border border-deep-sky-blue/20 rounded-full px-5 py-2 mb-8"
      >
        <Zap className="w-4 h-4 text-deep-sky-blue" />
        <span className="text-deep-sky-blue text-[10px] font-black uppercase tracking-[0.2em]">{t('hero.badge')}</span>
      </motion.div>

      {/* Title */}
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight"
      >
        {t('hero.titleTop')}<br />
        <span className="text-deep-sky-blue">{t('hero.titleBottom')}</span>
      </motion.h1>

      {/* Description */}
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-lg sm:text-xl text-slate-500 mb-8 leading-relaxed max-w-xl"
      >
        {t('hero.description')}
      </motion.p>

      {/* CTA Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link href="/become-agent">
          <Button
            size="lg"
            className="bg-deep-sky-blue hover:bg-deep-sky-blue-dark text-white font-bold px-8 py-6 text-lg rounded-xl shadow-lg shadow-deep-sky-blue/20 transition-all hover:-translate-y-0.5"
          >
            {t('hero.cta')}
          </Button>
        </Link>
        <Link href="/#heritage">
          <Button
            size="lg"
            variant="outline"
            className="border-slate-200 text-slate-700 hover:text-deep-sky-blue hover:border-deep-sky-blue/30 px-8 py-6 text-lg rounded-xl transition-all"
          >
            {t('hero.learnMore')}
          </Button>
        </Link>
      </motion.div>
    </>
  );
}

function HeroImage() {
  const { t } = useI18n();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-2xl"
    >
      {/* Decorative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-deepSkyBlue/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative aspect-square sm:aspect-[4/3] w-full">
        {/* Secondary Image for Depth */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 0.4, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute -right-8 top-12 w-3/4 h-3/4 opacity-40 z-0 grayscale"
        >
          <Image
            src="/images/tuk-side.png"
            alt="Side View"
            fill
            className="object-contain"
          />
        </motion.div>

        {/* Main Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full h-full z-10"
        >
          <Image
            src="/images/tuk-front.png"
            alt="ETUK Electric 3-Wheeler"
            fill
            priority
            className="object-contain drop-shadow-[0_20px_50px_rgba(3,105,161,0.3)]"
          />
        </motion.div>
      </div>
      
      {/* Floating Feature Tags */}
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-[20%] -right-4 bg-white/80 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl z-20 hidden sm:block"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Ready to Drive</span>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-4">100% Electric</span>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute top-[15%] -left-4 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl z-20 hidden sm:block border border-slate-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-deepSkyBlue/20 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-deepSkyBlue" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-deepSkyBlue uppercase tracking-[0.2em] leading-none mb-1">Performance</p>
            <p className="text-sm font-black tracking-tight italic">4000W POWER</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ParticlesBackground() {
  const prefersReducedMotion = useReducedMotion();
  
  if (prefersReducedMotion) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-deepSkyBlue/40 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function Hero() {
  return (
    <section id="home" className="relative min-h-screen lg:min-h-[90vh] bg-white overflow-hidden flex items-center pt-24 pb-12 sm:pb-20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 via-white to-sky-50/30" />
      
      {/* Refined Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(3,105,161,0.2) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(3,105,161,0.2) 1.5px, transparent 1.5px)`,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Radial Mask for Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)] opacity-80" />
      
      {/* Floating Particles */}
      <ParticlesBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          {/* Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <HeroContent />
          </div>

          {/* Image Presentation */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <HeroImage />
          </div>
        </div>
      </div>
      
      {/* Bottom Visual Divider */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}

export default memo(Hero);
