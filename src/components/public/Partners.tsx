'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { motion } from 'framer-motion';
import { Factory, Zap, Shield, Award, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Partners() {
  const { t } = useI18n();

  const highlights = [
    { 
      icon: Factory, 
      label: 'Local Assembly', 
      value: 'Modjo, Ethiopia',
      color: 'from-blue-500 to-cyan-500',
      bgLight: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    { 
      icon: Zap, 
      label: 'Electric Power', 
      value: '100% Eco-Friendly',
      color: 'from-amber-500 to-orange-500',
      bgLight: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    { 
      icon: Shield, 
      label: 'Quality Assured', 
      value: 'ISO Standards',
      color: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    { 
      icon: Award, 
      label: 'Warranty', 
      value: '3 Years Coverage',
      color: 'from-purple-500 to-violet-500',
      bgLight: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white via-slate-50/50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-block px-4 py-1.5 bg-deep-sky-blue/10 text-deep-sky-blue text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">
            {t('partners.title')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3">
            {t('partners.subtitle')}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">
            Join Ethiopia&apos;s leading electric vehicle revolution with trusted quality and local support
          </p>
        </motion.div>

        {/* Mobile: Horizontal Scroll Cards */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 pb-4 snap-x snap-mandatory">
            {highlights.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[160px] snap-start"
              >
                <div className={`${item.bgLight} rounded-2xl p-5 h-full border border-slate-100/80`}>
                  <div className={`w-11 h-11 ${item.bgLight} rounded-xl flex items-center justify-center mb-3 border border-white shadow-sm`}>
                    <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {item.label}
                  </div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">
                    {item.value}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid Layout with Animated Cards */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {highlights.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative"
            >
              {/* Gradient border effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
              
              <div className="relative bg-white rounded-2xl p-6 border border-slate-100 group-hover:border-slate-200 transition-all duration-300 h-full">
                {/* Icon */}
                <div className={`w-14 h-14 ${item.bgLight} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                </div>
                
                {/* Content */}
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {item.label}
                </div>
                <div className="text-base font-bold text-slate-900">
                  {item.value}
                </div>

                {/* Arrow indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className={`w-5 h-5 ${item.iconColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 sm:mt-12"
        >
          <Link href="/become-agent">
            <Button className="bg-slate-900 hover:bg-deep-sky-blue text-white font-bold px-8 py-6 h-auto rounded-full shadow-lg shadow-slate-200 hover:shadow-xl hover:shadow-deep-sky-blue/20 transition-all">
              <span className="flex items-center gap-2">
                Become a Partner Today
                <ChevronRight className="w-4 h-4" />
              </span>
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Hide scrollbar for mobile */}
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
