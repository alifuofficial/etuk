'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useI18n } from '@/lib/i18n/useI18n';
import { Locale, localeNames, localeFlags } from '@/lib/i18n/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { locale, setLocale, t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-xl shadow-2xl shadow-cyan-500/10'
          : 'bg-transparent'
      }`}
    >
      {/* Electric border line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center border border-cyan-400/50">
                <Zap className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <span className={`font-black text-2xl tracking-tight ${isScrolled ? 'text-white' : 'text-white'}`}>
                ETUK
              </span>
              <span className={`block text-[10px] tracking-[0.3em] uppercase ${isScrolled ? 'text-cyan-400' : 'text-cyan-300'}`}>
                Electric
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { href: '#home', label: t('nav.home') },
              { href: '#products', label: t('nav.products') },
              { href: '#about', label: t('nav.about') },
              { href: '#contact', label: t('nav.contact') },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 hover:text-cyan-400 relative group ${
                  isScrolled ? 'text-gray-300' : 'text-white/90'
                }`}
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 ${isScrolled ? 'text-gray-300 hover:text-white' : 'text-white/90 hover:text-white'}`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{localeNames[locale]}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-cyan-500/30">
                {Object.entries(localeNames).map(([code, name]) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => setLocale(code as Locale)}
                    className={`text-gray-300 hover:text-cyan-400 focus:text-cyan-400 ${locale === code ? 'bg-cyan-500/20 text-cyan-400' : ''}`}
                  >
                    <span className="mr-2">{localeFlags[code as Locale]}</span>
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className={`text-sm ${isScrolled ? 'text-gray-300 hover:text-white' : 'text-white/90 hover:text-white'}`}
                >
                  {t('nav.login')}
                </Button>
              </Link>
              <Link href="/become-agent">
                <Button className="relative group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold px-6 py-2.5 rounded-full overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    {t('nav.becomeAgent')}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`lg:hidden ${isScrolled ? 'text-white' : 'text-white'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-cyan-500/20">
          <nav className="flex flex-col p-6 gap-4">
            <Link
              href="#home"
              className="text-gray-300 hover:text-cyan-400 font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link
              href="#products"
              className="text-gray-300 hover:text-cyan-400 font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.products')}
            </Link>
            <Link
              href="#about"
              className="text-gray-300 hover:text-cyan-400 font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.about')}
            </Link>
            <Link
              href="#contact"
              className="text-gray-300 hover:text-cyan-400 font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.contact')}
            </Link>
            <hr className="border-cyan-500/20" />
            <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-cyan-500/50 text-cyan-400">
                {t('nav.login')}
              </Button>
            </Link>
            <Link href="/become-agent" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold">
                <Zap className="w-4 h-4 mr-2" />
                {t('nav.becomeAgent')}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
