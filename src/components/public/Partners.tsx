'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { motion } from 'framer-motion';

export default function Partners() {
  const { t } = useI18n();

  // Partners grid - removing competitor references
  const partners = [
    { name: 'Soreti International', logo: '/images/tuk-front.png' },
    { name: 'ETUK EV', logo: '/images/tuk-side.png' },
    { name: 'YETU Mobility', logo: '/images/tuk-front.png' },
  ];

  return (
    <section className="py-20 bg-white border-y border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{t('partners.title')}</h3>
          <p className="text-slate-900 font-bold">{t('partners.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
          {partners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="h-12 w-auto flex items-center justify-center font-black text-slate-900 text-2xl tracking-tighter">
                {partner.name.split(' ')[0]} <span className="text-deep-sky-blue">{partner.name.split(' ')[1] || 'EV'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
