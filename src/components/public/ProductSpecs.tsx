'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { 
  Zap, 
  Battery, 
  Gauge, 
  ShieldCheck,
  Leaf
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductSpecs() {
  const { t } = useI18n();

  return (
    <section id="products" className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-deep-sky-blue/5 rounded-full blur-[150px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-6xl font-black text-white mb-6 tracking-tighter uppercase italic py-10">
            ETUK <span className="text-deep-sky-blue">YETU</span>
          </h2>
          <div className="w-32 h-1.5 bg-deep-sky-blue mx-auto rounded-full" />
        </div>

        <div className="grid lg:grid-cols-3 gap-12 items-center">
          {/* Left Specs */}
          <div className="space-y-12">
            {[
              { label: t('specs.motorPower'), value: '4000 W', icon: Zap },
              { label: t('specs.topSpeed'), value: '≥ 50 KM/H', icon: Gauge },
              { label: t('specs.maxRange'), value: '180 KM*', icon: Battery },
              { label: t('specs.acceleration'), value: '≤ 12s (0-50km/h)', icon: Zap },
            ].map((spec, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-6 justify-end text-right"
              >
                <div>
                  <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{spec.label}</div>
                  <div className="text-white text-xl font-black">{spec.value}</div>
                </div>
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <spec.icon className="w-6 h-6 text-deep-sky-blue" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Center Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-deep-sky-blue/20 rounded-full blur-[100px] animate-pulse" />
            <img 
              src="/images/tuk-front.png" 
              alt="ETUK Specs" 
              className="w-full h-auto drop-shadow-[0_40px_80px_rgba(0,191,255,0.4)] relative z-10 animate-float"
            />
          </motion.div>

          {/* Right Specs */}
          <div className="space-y-12">
            {[
              { label: t('specs.warranty'), value: t('specs.warrantyVal'), icon: ShieldCheck },
              { label: t('specs.batteryType'), value: t('specs.batteryTypeVal'), icon: Battery },
              { label: t('specs.charging'), value: t('specs.chargingVal'), icon: Zap },
              { label: t('specs.payload'), value: t('specs.loadCapacityVal'), icon: Gauge },
            ].map((spec, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-6"
              >
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <spec.icon className="w-6 h-6 text-deep-sky-blue" />
                </div>
                <div>
                  <div className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{spec.label}</div>
                  <div className="text-white text-xl font-black">{spec.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
