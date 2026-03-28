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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative"
    >
      <div className="relative aspect-[4/3] w-full max-w-lg mx-auto">
        <Image
          src="/images/tuk-side.png"
          alt="ETUK Electric 3-Wheeler"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className="object-contain drop-shadow-2xl"
          quality={85}
        />
      </div>
      
      {/* Floating badges */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute -top-2 right-0 bg-white/95 backdrop-blur-sm border border-slate-100 p-3 rounded-xl shadow-lg z-10"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-900">{t('hero.motorTag')}</span>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute -bottom-2 left-0 bg-slate-900 text-white p-3 rounded-xl shadow-lg z-10"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-deep-sky-blue" />
          <span className="text-xs font-bold uppercase tracking-wider">{t('hero.chargeTag')}</span>
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
          className="absolute w-1 h-1 bg-deep-sky-blue/30 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
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
    <section id="home" className="relative min-h-[85vh] bg-white overflow-hidden flex items-center pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,191,255,0.5) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />
      
      {/* Animated particles */}
      <ParticlesBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <HeroContent />
          </div>

          {/* Image */}
          <div className="flex justify-center lg:justify-end">
            <HeroImage />
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Hero);
