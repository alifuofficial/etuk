'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { motion } from 'framer-motion';
import { UserPlus, MessageSquare, Car } from 'lucide-react';

export default function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      icon: UserPlus,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
    },
    {
      icon: MessageSquare,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
    },
    {
      icon: Car,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">{t('howItWorks.title')}</h2>
          <p className="text-slate-500 font-medium">{t('howItWorks.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-xl mb-6 relative group">
                <div className="absolute inset-0 bg-deep-sky-blue/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500" />
                <step.icon className="w-8 h-8 text-deep-sky-blue relative z-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
