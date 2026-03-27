'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Locations() {
  const { t } = useI18n();

  const places = [
    {
      title: t('locations.hq.title'),
      address: t('locations.hq.address'),
      type: t('locations.hq.type'),
      coords: '9.0192° N, 38.7525° E',
    },
    {
      title: t('locations.plant.title'),
      address: t('locations.plant.address'),
      type: t('locations.plant.type'),
      coords: '8.5883° N, 39.1229° E',
    },
  ];

  return (
    <section id="locations" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-3 bg-deep-sky-blue/10 border border-deep-sky-blue/20 rounded-full px-5 py-2 mb-8">
              <Navigation className="w-5 h-5 text-deep-sky-blue" />
              <span className="text-deep-sky-blue text-xs font-black uppercase tracking-[0.2em]">{t('locations.network')}</span>
            </div>

            <h2 className="text-5xl font-black text-slate-900 mb-6 leading-tight">
              {t('locations.heroTitle')}
            </h2>

            <p className="text-xl text-slate-500 mb-10 leading-relaxed font-medium">
              {t('locations.description')}
            </p>

            <div className="space-y-8">
              {places.map((place, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex gap-6 p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:border-deep-sky-blue/30 transition-all group"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-deep-sky-blue group-hover:text-white transition-colors">
                    <MapPin className="w-8 h-8 text-deep-sky-blue group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] text-deep-sky-blue font-black uppercase mb-1 tracking-widest">{place.type}</div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">{place.title}</h3>
                    <p className="text-slate-500 font-medium">{place.address}</p>
                    <div className="text-[10px] font-mono text-slate-300 mt-2">{place.coords}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative h-[600px] rounded-[48px] overflow-hidden border border-slate-100 shadow-2xl group">
            {/* Real Map Integration */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1009185.0601445778!2d38.567824!3d8.750000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24c49!2sAddis%20Ababa!5e0!3m2!1sen!2set!4v1711516000000!5m2!1sen!2set"
              className="absolute inset-0 w-full h-full grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent pointer-events-none" />
            
            {/* Custom Markers Overly (Visual Reference) */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="relative w-full h-full">
                {/* Addis Marker - Positioned on the map view */}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  className="absolute top-[35%] left-[45%]"
                >
                  <div className="relative">
                    <div className="absolute -inset-4 bg-deep-sky-blue/20 rounded-full animate-ping" />
                    <div className="w-5 h-5 bg-deep-sky-blue rounded-full border-4 border-white shadow-xl relative z-10" />
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border border-slate-100 whitespace-nowrap text-[9px] font-black uppercase text-slate-900 tracking-tighter">
                      {t('locations.hq.title')}
                    </div>
                  </div>
                </motion.div>

                {/* Modjo Marker - Positioned on the map view */}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-[55%] left-[55%]"
                >
                  <div className="relative">
                    <div className="absolute -inset-4 bg-slate-900/10 rounded-full animate-ping [animation-delay:1s]" />
                    <div className="w-5 h-5 bg-gray-900 rounded-full border-4 border-white shadow-xl relative z-10" />
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-slate-900 px-3 py-1 rounded-full shadow-lg whitespace-nowrap text-[9px] font-black uppercase text-white tracking-tighter">
                      {t('locations.plant.title')}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
