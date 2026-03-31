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
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-3xl"
    >
      {/* Dynamic Glow System */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-to-tr from-deep-sky-blue/20 via-blue-400/5 to-transparent blur-[140px] rounded-full pointer-events-none opacity-60" />
      
      {/* Decorative Tech Rings */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute w-[120%] h-[120%] border-[0.5px] border-deep-sky-blue/10 rounded-full border-dashed" 
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute w-[90%] h-[90%] border-[0.5px] border-deep-sky-blue/5 rounded-full" 
          />
        </div>
      )}

      <div className="relative aspect-square sm:aspect-[16/10] w-full flex items-center justify-center pt-8">
        {/* Layered Vehicle Stack */}
        
        {/* 1. Back View (Floating Left) */}
        <motion.div
          initial={{ opacity: 0, x: -40, y: 40, rotate: -5, scale: 0.8 }}
          animate={{ opacity: 0.3, x: -100, y: 60, rotate: -12, scale: 0.85 }}
          whileHover={{ opacity: 0.6, x: -120, scale: 0.9, rotate: -15, transition: { duration: 0.4 } }}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          className="absolute left-0 top-1/4 w-3/5 h-3/5 z-0 grayscale brightness-110 blur-[1px]"
        >
          <Image
            src="/images/tuk-back.png"
            alt="Rear Architecture"
            fill
            className="object-contain"
          />
          <motion.div 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-deep-sky-blue/10 blur-xl rounded-full"
          />
        </motion.div>

        {/* 2. Side View (Floating Right) */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: -40, rotate: 5, scale: 0.8 }}
          animate={{ opacity: 0.5, x: 100, y: -40, rotate: 12, scale: 0.9 }}
          whileHover={{ opacity: 0.8, x: 120, scale: 0.95, rotate: 15, transition: { duration: 0.4 } }}
          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
          className="absolute right-0 bottom-1/4 w-3/5 h-3/5 z-0 grayscale brightness-110 blur-[0.5px]"
        >
          <Image
            src="/images/tuk-side.png"
            alt="Side Profile"
            fill
            className="object-contain"
          />
        </motion.div>

        {/* 3. Main Front View (Center Stage) */}
        <motion.div
          initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          whileHover={{ y: -10, scale: 1.02 }}
          transition={{ 
            duration: 1, 
            delay: 0.2, 
            ease: [0.16, 1, 0.3, 1],
            y: { duration: 0.4, ease: "easeOut" }
          }}
          className="relative w-full h-full z-20"
        >
          <Image
            src="/images/tuk-front.png"
            alt="ETUK Electric 3-Wheeler"
            fill
            priority
            className="object-contain drop-shadow-[0_35px_60px_rgba(3,105,161,0.45)]"
          />
          
          {/* Ground Shadow Overlay */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-12 bg-slate-900/10 blur-[40px] rounded-full -z-10" />
        </motion.div>
      </div>
      
      {/* Dynamic Data Badges */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-12 -right-8 bg-white/90 backdrop-blur-xl border border-blue-100 p-5 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] z-30 hidden sm:block overflow-hidden"
      >
        <div className="flex flex-col gap-1.5 relative">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Global Status: Ready</span>
          </div>
          <span className="text-[10px] text-deep-sky-blue font-bold uppercase tracking-[0.2em] pl-5">Zero Emission Tech</span>
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 bg-deep-sky-blue/5 rounded-full -mr-8 -mt-8" />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.6 }}
        className="absolute top-24 -left-12 bg-slate-900/95 backdrop-blur-xl text-white p-5 rounded-[2rem] shadow-2xl z-30 hidden sm:block border border-white/10"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-deep-sky-blue rounded-2xl flex items-center justify-center shadow-lg shadow-deep-sky-blue/30">
            <Zap className="w-5 h-5 text-white fill-current" />
          </div>
          <div>
            <p className="text-[10px] font-black text-deep-sky-blue uppercase tracking-[0.25em] leading-none mb-1.5">Max Performance</p>
            <p className="text-base font-black tracking-tighter italic">4000W ELECTRIC</p>
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
          className="absolute w-1 h-1 bg-deep-sky-blue/40 rounded-full"
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
