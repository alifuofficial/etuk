import { useI18n } from '@/lib/i18n/useI18n';
import { Zap, Battery, ShieldCheck, Gauge, User, Map, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Features() {
  const { t } = useI18n();

  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Visual Showcase */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative order-2 lg:order-1"
          >
            <div className="absolute inset-0 bg-deep-sky-blue/5 rounded-full blur-[120px] scale-75" />
            <img 
              src="/images/tuk-side.png" 
              alt="ETUK Features" 
              className="w-full h-auto drop-shadow-[0_40px_80px_rgba(0,191,255,0.1)] relative z-10"
            />
            
            {/* Quick Badge */}
            <div className="absolute top-0 right-0 bg-white border border-slate-100 p-6 rounded-3xl shadow-2xl animate-float">
              <div className="text-3xl font-black text-slate-900 leading-none">100%</div>
              <div className="text-[10px] text-deep-sky-blue font-black uppercase tracking-widest mt-1">{t('features.zeroEmission')}</div>
            </div>
          </motion.div>

          {/* Benefits Checklist */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-full px-5 py-2 mb-8">
              <span className="text-deep-sky-blue text-xs font-black uppercase tracking-[0.2em]">{t('features.title')}</span>
            </div>

            <h2 className="text-5xl font-black text-slate-900 mb-8 leading-tight">
              {t('features.heroTitle')}
            </h2>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { 
                  icon: Battery, 
                  title: t('features.eco.title'), 
                  desc: t('features.tech.battery')
                },
                { 
                  icon: Zap, 
                  title: t('features.powerful.title'), 
                  desc: t('features.tech.power') 
                },
                { 
                  icon: Gauge, 
                  title: t('features.tech.load'), 
                  desc: t('features.tech.loadDesc')
                },
                { 
                  icon: ShieldCheck, 
                  title: t('features.tech.sds'), 
                  desc: t('features.tech.sdsDesc')
                },
                {
                  icon: User,
                  title: t('features.spacious.title'),
                  desc: t('features.tech.cabin')
                },
                {
                  icon: Map,
                  title: t('features.range.title'),
                  desc: t('features.tech.range')
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 group"
                >
                  <div className="w-12 h-12 bg-deep-sky-blue/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-deep-sky-blue group-hover:text-white transition-all">
                    <item.icon className="w-6 h-6 text-deep-sky-blue group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg mb-0.5">{item.title}</h4>
                    <p className="text-slate-500 text-xs font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12">
              <Link href="/become-agent">
                <Button className="bg-slate-900 hover:bg-deep-sky-blue text-white font-black px-10 py-7 rounded-2xl transition-all shadow-xl shadow-slate-200">
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
