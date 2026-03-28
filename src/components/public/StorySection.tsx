'use client';

import { memo } from 'react';
import { useI18n } from '@/lib/i18n/useI18n';
import { Factory, MapPin, Zap, Shield } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

function StorySection() {
  const { t } = useI18n();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="heritage" className="py-16 lg:py-24 bg-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-deep-sky-blue/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-deep-sky-blue/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Visual */}
          <motion.div 
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "100px" }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
              <Image
                src="/images/tuk-side.png"
                alt="ETUK Heritage"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-4"
                loading="lazy"
                quality={80}
              />
              
              {/* Badge */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Factory className="w-5 h-5 text-deep-sky-blue" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{t('story.showcase.production')}</div>
                    <div className="text-[10px] text-deep-sky-blue uppercase font-bold">{t('story.showcase.region')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating icon */}
            <div className="absolute -top-3 -right-3 w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-deep-sky-blue" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-deep-sky-blue/10 border border-deep-sky-blue/20 rounded-full px-4 py-2 mb-6">
              <Factory className="w-4 h-4 text-deep-sky-blue" />
              <span className="text-deep-sky-blue text-sm font-bold uppercase tracking-wider">{t('story.badge')}</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 leading-tight">
              {t('story.title')}
            </h2>

            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              {t('story.description')}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {[ 
                { icon: MapPin, titleKey: 'addis', descKey: 'addis' },
                { icon: Zap, titleKey: 'modjo', descKey: 'modjo' }
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:bg-slate-100 transition-colors">
                  <item.icon className="w-8 h-8 text-deep-sky-blue mb-3" />
                  <h4 className="font-bold text-slate-900 mb-1">{t(`story.${item.titleKey}.title`)}</h4>
                  <p className="text-sm text-slate-500">{t(`story.${item.descKey}.desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(StorySection);
