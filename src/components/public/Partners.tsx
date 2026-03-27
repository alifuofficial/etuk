'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { motion } from 'framer-motion';
import { Factory, Zap, Shield, Award } from 'lucide-react';

export default function Partners() {
  const { t } = useI18n();

  const highlights = [
    { icon: Factory, label: 'Local Assembly', value: 'Modjo, Ethiopia' },
    { icon: Zap, label: 'Electric Power', value: '100% Eco-Friendly' },
    { icon: Shield, label: 'Quality Assured', value: 'ISO Standards' },
    { icon: Award, label: 'Warranty', value: '3 Years Coverage' },
  ];

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{t('partners.title')}</h3>
          <p className="text-slate-900 font-bold">{t('partners.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {highlights.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-slate-100 hover:border-deep-sky-blue/30 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-deep-sky-blue/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-deep-sky-blue transition-colors">
                <item.icon className="w-6 h-6 text-deep-sky-blue group-hover:text-white transition-colors" />
              </div>
              <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{item.label}</div>
              <div className="text-slate-900 font-bold text-sm">{item.value}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
