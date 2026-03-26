'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AgentCTA() {
  const { t } = useI18n();

  const benefits = [
    'Exclusive territorial rights',
    'Competitive commissions',
    'Full training & support',
    'Growing market demand',
  ];

  return (
    <section id="agent" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-8">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 text-sm font-medium">Business Opportunity</span>
        </div>

        {/* Title */}
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
          Become an
          <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            ETUK Agent
          </span>
        </h2>

        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Join Ethiopia's fastest-growing electric vehicle network. We're looking for partners 
          across all 11 regions to bring sustainable transportation to every corner of the country.
        </p>

        {/* Benefits */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 rounded-full px-4 py-2"
            >
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-300">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Link href="/become-agent">
          <Button
            size="lg"
            className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-10 py-7 text-lg rounded-full overflow-hidden shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
          >
            <span className="relative z-10 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Apply Now to Become an Agent
            </span>
            <ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </Link>

        <p className="mt-6 text-gray-500 text-sm">
          No commitment required • Free application • Response within 48 hours
        </p>
      </div>
    </section>
  );
}
