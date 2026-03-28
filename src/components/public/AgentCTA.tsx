'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, CheckCircle, Trophy, Globe, Briefcase, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AgentCTA() {
  const { t } = useI18n();

  const stats = [
    { icon: Globe, label: t('cta.stats.network'), gradient: 'from-blue-500 to-cyan-500' },
    { icon: Briefcase, label: t('cta.stats.rights'), gradient: 'from-violet-500 to-purple-500' },
    { icon: Zap, label: t('cta.stats.training'), gradient: 'from-amber-500 to-orange-500' },
    { icon: CheckCircle, label: t('cta.stats.returns'), gradient: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <section id="agent" className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute top-0 left-0 w-96 h-96 bg-deep-sky-blue rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Main Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 lg:p-12 relative overflow-hidden shadow-2xl">
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[3rem] bg-gradient-to-r from-deep-sky-blue via-violet-500 to-deep-sky-blue opacity-20 blur-xl" />
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />

            <div className="relative z-10">
              {/* Header Section */}
              <div className="text-center mb-8 lg:mb-10">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4 sm:mb-6"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <Trophy className="w-4 h-4 text-deep-sky-blue" />
                  <span className="text-white/90 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em]">{t('cta.badge')}</span>
                </motion.div>

                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white mb-3 sm:mb-4 leading-tight">
                  {t('cta.title')}
                </h2>

                <p className="text-white/60 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
                  {t('cta.desc')}
                </p>
              </div>

              {/* Stats: Mobile Horizontal Scroll / Desktop Grid */}
              {/* Mobile */}
              <div className="sm:hidden -mx-6 px-6 mb-8 overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 pb-2 snap-x snap-mandatory">
                  {stats.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex-shrink-0 snap-start"
                    >
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2.5 border border-white/10">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-bold text-xs whitespace-nowrap">{item.label}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Desktop: Grid */}
              <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8 lg:mb-10">
                {stats.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                  >
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 lg:p-5 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <item.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <span className="text-white font-bold text-sm lg:text-base">{item.label}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <Link href="/become-agent">
                    <Button 
                      size="lg"
                      className="bg-white text-slate-900 hover:bg-deep-sky-blue hover:text-white font-black px-8 sm:px-10 py-6 sm:py-7 text-base sm:text-lg rounded-full shadow-xl hover:shadow-2xl hover:shadow-deep-sky-blue/30 transition-all group"
                    >
                      <span className="flex items-center gap-2 sm:gap-3">
                        {t('cta.button')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                </motion.div>

                {/* Trust indicator */}
                <p className="text-white/40 text-[10px] sm:text-xs mt-4 font-medium">
                  Join 50+ partners across 11 regions
                </p>
              </div>
            </div>
          </div>

          {/* Floating coverage badge - Desktop only */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden lg:block absolute -bottom-4 -right-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-xl"
          >
            <div className="text-3xl font-black text-slate-900">{t('cta.stats.coverage')}</div>
            <div className="text-[10px] text-deep-sky-blue font-black uppercase tracking-widest">{t('cta.stats.regions')}</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Hide scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
