'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { Zap, Battery, Shield, Wifi, Leaf, Users } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: '4000W Motor',
    desc: 'Powerful electric motor with instant torque delivery',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    icon: Battery,
    title: '180KM Range',
    desc: 'Long-lasting lithium iron phosphate battery',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Heavy-Duty Build',
    desc: 'Engineered specifically for African roads',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Wifi,
    title: 'Smart Tech',
    desc: 'GPS tracking & remote connectivity built-in',
    color: 'from-purple-400 to-pink-500',
  },
  {
    icon: Leaf,
    title: 'Zero Emissions',
    desc: 'Eco-friendly transportation for a cleaner future',
    color: 'from-teal-400 to-green-500',
  },
  {
    icon: Users,
    title: 'Spacious Cabin',
    desc: 'Comfortable seating for passengers or cargo',
    color: 'from-cyan-400 to-blue-500',
  },
];

export default function Features() {
  const { t } = useI18n();

  return (
    <section id="features" className="py-24 bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">Why ETUK?</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Built for the Future of
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Ethiopian Transport
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-500"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500" />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.desc}
                </p>
              </div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden rounded-tr-2xl">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[80px] border-r-[80px] border-t-transparent border-r-cyan-500/0 group-hover:border-r-cyan-500/20 transition-colors duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
