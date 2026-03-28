'use client';

import { memo } from 'react';
import { useI18n } from '@/lib/i18n/useI18n';
import { Zap, Battery, ShieldCheck, Gauge, User, Map } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Battery, titleKey: 'eco', descKey: 'battery' },
  { icon: Zap, titleKey: 'powerful', descKey: 'power' },
  { icon: Gauge, titleKey: 'load', descKey: 'loadDesc' },
  { icon: ShieldCheck, titleKey: 'sds', descKey: 'sdsDesc' },
  { icon: User, titleKey: 'spacious', descKey: 'cabin' },
  { icon: Map, titleKey: 'range', descKey: 'range' },
];

function Features() {
  const { t } = useI18n();
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="features" className="py-16 lg:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Visual Showcase */}
          <motion.div 
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "100px" }}
            className="relative order-2 lg:order-1"
          >
            <div className="absolute inset-0 bg-deep-sky-blue/5 rounded-full blur-[100px]" />
            <div className="relative aspect-[4/3] w-full max-w-md mx-auto">
              <Image
                src="/images/tuk-side.png"
                alt="ETUK Features"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain drop-shadow-xl"
                loading="lazy"
                quality={80}
              />
            </div>
            
            {/* Badge */}
            <motion.div 
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1 }}
              viewport={{ once: true }}
              className="absolute top-0 right-0 bg-white border border-slate-100 p-4 rounded-2xl shadow-lg"
            >
              <div className="text-2xl font-black text-slate-900 leading-none">100%</div>
              <div className="text-[10px] text-deep-sky-blue font-bold uppercase tracking-wider mt-1">{t('features.zeroEmission')}</div>
            </motion.div>
          </motion.div>

          {/* Benefits */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-4 py-2 mb-6">
              <span className="text-deep-sky-blue text-xs font-bold uppercase tracking-wider">{t('features.title')}</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-8 leading-tight">
              {t('features.heroTitle')}
            </h2>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "50px" }}
              className="grid sm:grid-cols-2 gap-6"
            >
              {features.map((item, i) => (
                <motion.div 
                  key={i}
                  variants={itemVariants}
                  className="flex gap-4 group"
                >
                  <div className="w-10 h-10 bg-deep-sky-blue/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-deep-sky-blue transition-colors">
                    <item.icon className="w-5 h-5 text-deep-sky-blue group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-0.5">{t(`features.${item.titleKey}.title`)}</h4>
                    <p className="text-slate-500 text-sm">{t(`features.tech.${item.descKey}`)}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-10">
              <Link href="/become-agent">
                <Button className="bg-slate-900 hover:bg-deep-sky-blue text-white font-bold px-8 py-6 rounded-xl transition-all shadow-lg">
                  {t('features.registerNow')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(Features);
