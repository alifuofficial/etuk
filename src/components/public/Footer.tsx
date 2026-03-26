'use client';

import { useI18n } from '@/lib/i18n/useI18n';
import Link from 'next/link';
import { MapPin, Phone, Mail, Factory, Zap, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const { t } = useI18n();

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  const quickLinks = [
    { label: t('nav.home'), href: '#home' },
    { label: t('nav.products'), href: '#products' },
    { label: t('nav.becomeAgent'), href: '/become-agent' },
    { label: t('nav.about'), href: '#about' },
  ];

  return (
    <footer id="contact" className="bg-black border-t border-gray-800">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-30" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center border border-cyan-400/50">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <span className="font-black text-2xl text-white">ETUK</span>
                <span className="block text-[10px] tracking-[0.2em] text-cyan-400 uppercase">Electric</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 text-sm">
              Leading the electric vehicle revolution in Ethiopia with sustainable, 
              reliable, and affordable 3-wheelers.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  Modjo Industrial Zone<br />Oromia, Ethiopia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-400 text-sm">+251 XXX XXX XXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-400 text-sm">info@etuk.et</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div>
            <h4 className="text-white font-semibold mb-4">Become a Partner</h4>
            <p className="text-gray-400 text-sm mb-4">
              Join our network of agents across Ethiopia and be part of the electric revolution.
            </p>
            <Link
              href="/become-agent"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-full text-sm hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              <Zap className="w-4 h-4" />
              Apply Now
            </Link>
          </div>
        </div>
      </div>

      {/* Assembly Badge */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Factory className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">Proudly assembled in Modjo, Ethiopia</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span>© {new Date().getFullYear()} Soreti International Trading</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
