'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/useI18n';
import Link from 'next/link';
import { MapPin, Phone, Mail, Factory, Zap, Facebook, Twitter, Instagram, Youtube, Building2 } from 'lucide-react';

export default function Footer() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<Record<string, string>>({
    footerAbout: 'Driving the transition to sustainable mobility across Ethiopia. Assembled in Modjo, supported in Addis Ababa.',
    phone: '',
    supportEmail: '',
    address: 'Addis Ababa, Ethiopia',
    factoryName: 'Modjo Factory',
    factoryDesc: 'Our main assembly hub ensuring rapid delivery and local parts support.',
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Failed to fetch footer settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const socialLinks = [
    { icon: Facebook, url: settings.facebook },
    { icon: Twitter, url: settings.twitter },
    { icon: Instagram, url: settings.instagram },
    { icon: Youtube, url: settings.youtube },
  ].filter(link => link.url);

  return (
    <footer id="contact" className="bg-slate-50 border-t border-slate-100 pt-20 pb-10 relative overflow-hidden">
      {/* Decorative Brand Text Background */}
      <div className="absolute -bottom-10 left-10 select-none pointer-events-none opacity-[0.03]">
        <h2 className="text-[150px] font-black leading-none uppercase italic text-slate-900">Soreti</h2>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Identity */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gray-900 blur-lg opacity-5 group-hover:opacity-10 transition-opacity" />
                <img 
                  src="/images/soreti-logo.png" 
                  alt="Soreti Logo" 
                  className="relative h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
                />
              </div>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
              {settings.footerAbout}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-4">
                {socialLinks.map((social, i) => (
                  <a 
                    key={i} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-deep-sky-blue hover:border-deep-sky-blue/30 hover:bg-deep-sky-blue/5 transition-all shadow-sm"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 font-black mb-6 uppercase tracking-widest text-xs">{t('nav.navigator')}</h4>
            <ul className="space-y-4">
              {[
                { label: t('nav.products'), href: '/#products' },
                { label: t('nav.heritage'), href: '/#heritage' },
                { label: t('nav.technology'), href: '/#features' },
                { label: t('nav.becomeAgent'), href: '/become-agent' },
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-slate-500 hover:text-deep-sky-blue transition-colors text-sm font-bold">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Reach Us */}
          <div>
            <h4 className="text-slate-900 font-black mb-6 uppercase tracking-widest text-xs">{t('specs.performance')}</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <Building2 className="w-5 h-5 text-deep-sky-blue shrink-0" />
                <span className="text-slate-500 text-sm font-medium whitespace-pre-line tracking-tight leading-snug">
                  {settings.address}
                </span>
              </li>
              {settings.phone && (
                <li className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-deep-sky-blue shrink-0" />
                  <span className="text-slate-500 text-sm font-mono">{settings.phone}</span>
                </li>
              )}
              {settings.supportEmail && (
                <li className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-deep-sky-blue shrink-0" />
                  <span className="text-slate-500 text-sm">{settings.supportEmail}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Local Pride */}
          <div>
            <h4 className="text-slate-900 font-black mb-6 uppercase tracking-widest text-xs">{t('footer.assemblyTitle')}</h4>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 group hover:border-deep-sky-blue/20 transition-all shadow-sm">
              <Factory className="w-10 h-10 text-deep-sky-blue mb-4" />
              <div className="text-slate-900 font-black mb-2">{settings.factoryName}</div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">
                {settings.factoryDesc}
              </p>
              <div className="flex items-center gap-2 text-deep-sky-blue text-[10px] font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-deep-sky-blue animate-pulse" />
                {t('footer.operational')}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-400 text-xs font-bold">
            © {new Date().getFullYear()} {t('footer.company')}. {t('footer.rights')}.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <span className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              {t('footer.builtIn')} <span className="text-slate-900 italic">{t('common.ethiopia')}</span>
            </span>
            <div className="h-4 w-px bg-slate-200 hidden md:block" />
            <a 
              href="https://t.me/dmalifu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <span className="text-slate-400 group-hover:text-slate-600">{t('footer.craftedBy')}</span>
              <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent drop-shadow-sm font-black italic tracking-tighter text-sm transition-transform group-hover:scale-105">
                AlifXperience
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
