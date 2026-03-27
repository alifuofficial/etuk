'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { Factory, MapPin, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StorySection() {
  const { t } = useI18n();

  return (
    <section id="heritage" className="py-24 bg-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-deep-sky-blue/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-deep-sky-blue/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Technical Showcase */}
          <div className="relative order-2 lg:order-1">
            <div className="relative z-10 aspect-video rounded-3xl overflow-hidden border border-slate-200 group bg-slate-50">
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent z-10" />
              <img 
                src="/images/tuk-side.png" 
                alt="Heritage Showcase" 
                className="w-full h-full object-contain scale-110 group-hover:scale-125 transition-transform duration-1000"
              />
              
              {/* Technical Indicators */}
              <div className="absolute top-10 left-10 z-20 space-y-4">
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full px-4 py-2 shadow-sm animate-in slide-in-from-left duration-700">
                  <div className="w-2 h-2 rounded-full bg-deep-sky-blue animate-pulse" />
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{t('story.showcase.version')}</span>
                </div>
              </div>

              <div className="absolute bottom-10 right-10 z-20">
                <div className="flex items-center gap-3 bg-deep-sky-blue/10 backdrop-blur-md border border-deep-sky-blue/20 rounded-2xl p-4 shadow-lg">
                  <Factory className="w-8 h-8 text-deep-sky-blue" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{t('story.showcase.production')}</div>
                    <div className="text-[10px] text-deep-sky-blue uppercase font-black">{t('story.showcase.region')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Icons */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-2xl animate-float">
              <Shield className="w-8 h-8 text-deep-sky-blue" />
            </div>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-deep-sky-blue/10 border border-deep-sky-blue/20 rounded-full px-4 py-2 mb-8">
              <Factory className="w-4 h-4 text-deep-sky-blue" />
              <span className="text-deep-sky-blue text-sm font-black uppercase tracking-wider">{t('story.badge')}</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 leading-tight">
              {t('story.title')}
            </h2>

            <p className="text-lg text-slate-500 mb-8 leading-relaxed font-medium">
              {t('story.description')}
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { 
                  icon: MapPin, 
                  title: t('story.addis.title'), 
                  desc: t('story.addis.desc') 
                },
                { 
                  icon: Zap, 
                  title: t('story.modjo.title'), 
                  desc: t('story.modjo.desc') 
                }
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:bg-slate-100 transition-colors group">
                  <item.icon className="w-10 h-10 text-deep-sky-blue mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
