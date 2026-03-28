'use client';

import { memo } from 'react';
import { useI18n } from '@/lib/i18n/useI18n';
import { Zap, Battery, Gauge, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

const leftSpecs = [
  { labelKey: 'motorPower', value: '4000 W', icon: Zap },
  { labelKey: 'topSpeed', value: '≥ 50 KM/H', icon: Gauge },
  { labelKey: 'maxRange', value: '180 KM*', icon: Battery },
  { labelKey: 'acceleration', value: '≤ 12s', icon: Zap },
];

const rightSpecs = [
  { labelKey: 'warranty', valueKey: 'warrantyVal', icon: ShieldCheck },
  { labelKey: 'batteryType', valueKey: 'batteryTypeVal', icon: Battery },
  { labelKey: 'charging', valueKey: 'chargingVal', icon: Zap },
  { labelKey: 'payload', valueKey: 'loadCapacityVal', icon: Gauge },
];

function ProductSpecs() {
  const { t } = useI18n();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="products" className="py-16 lg:py-24 bg-slate-900 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-deep-sky-blue/5 rounded-full blur-[100px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
            ETUK <span className="text-deep-sky-blue">YETU</span>
          </h2>
          <div className="w-20 h-1 bg-deep-sky-blue mx-auto rounded-full" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-center">
          {/* Left Specs */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            {leftSpecs.map((spec, i) => (
              <motion.div 
                key={i}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 justify-end text-right"
              >
                <div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-0.5">{t(`specs.${spec.labelKey}`)}</div>
                  <div className="text-white font-bold">{spec.value}</div>
                </div>
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <spec.icon className="w-5 h-5 text-deep-sky-blue" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Center Image */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative aspect-square w-full max-w-sm mx-auto">
              <Image
                src="/images/tuk-front.png"
                alt="ETUK Specs"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-contain drop-shadow-2xl"
                loading="lazy"
                quality={80}
              />
            </div>
          </motion.div>

          {/* Right Specs */}
          <div className="space-y-6 lg:space-y-8 order-3">
            {rightSpecs.map((spec, i) => (
              <motion.div 
                key={i}
                initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center shrink-0">
                  <spec.icon className="w-5 h-5 text-deep-sky-blue" />
                </div>
                <div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-0.5">{t(`specs.${spec.labelKey}`)}</div>
                  <div className="text-white font-bold">{t(`specs.${spec.valueKey}`)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ProductSpecs);
