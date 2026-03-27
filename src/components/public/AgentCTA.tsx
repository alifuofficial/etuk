'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, CheckCircle, Trophy, Globe, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AgentCTA() {
  const { t } = useI18n();

  return (
    <section id="agent" className="py-24 bg-white relative overflow-hidden">
      {/* Immersive Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-deep-sky-blue/5 rounded-full blur-[150px] animate-pulse" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-slate-50 border border-slate-100 rounded-[48px] p-8 md:p-16 backdrop-blur-2xl relative overflow-hidden group shadow-2xl"
        >
          {/* Decorative Corner Glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-deep-sky-blue/10 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-3 bg-deep-sky-blue/10 border border-deep-sky-blue/20 rounded-full px-5 py-2 mb-8">
                <Trophy className="w-5 h-5 text-deep-sky-blue" />
                <span className="text-deep-sky-blue text-xs font-black uppercase tracking-[0.2em]">{t('cta.badge')}</span>
              </div>

              <h2 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 leading-tight">
                {t('cta.title')}
              </h2>

              <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
                {t('cta.desc')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                {[
                  { icon: Globe, text: t('cta.stats.network') },
                  { icon: Briefcase, text: t('cta.stats.rights') },
                  { icon: Zap, text: t('cta.stats.training') },
                  { icon: CheckCircle, text: t('cta.stats.returns') },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                      <item.icon className="w-5 h-5 text-deep-sky-blue" />
                    </div>
                    <span className="text-slate-900 font-bold text-sm tracking-wide">{item.text}</span>
                  </div>
                ))}
              </div>

              <Link href="/become-agent">
                <Button
                  size="lg"
                  className="group relative bg-deep-sky-blue hover:bg-deep-sky-blue-dark text-white font-black px-12 py-8 text-xl rounded-2xl overflow-hidden shadow-2xl shadow-deep-sky-blue/20 transition-all hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {t('cta.button')}
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative z-10 animate-float">
                <img 
                  src="/images/tuk-side.png" 
                  alt="ETUK Model" 
                  className="w-full h-auto drop-shadow-[0_40px_80px_rgba(0,191,255,0.15)]"
                />
              </div>
              
              {/* Floating Stat Card */}
              <div className="absolute -bottom-6 -left-6 bg-white border border-slate-100 p-6 rounded-3xl shadow-2xl">
                <div className="text-3xl font-black text-slate-900 mb-1">{t('cta.stats.coverage')}</div>
                <div className="text-[10px] text-deep-sky-blue font-black uppercase tracking-widest leading-none">{t('cta.stats.regions')}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
