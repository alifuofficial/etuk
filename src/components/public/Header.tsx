'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useI18n } from '@/lib/i18n/useI18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { locale, setLocale, t, languages } = useI18n();
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
          ? 'bg-white/80 backdrop-blur-2xl shadow-xl shadow-slate-200/50'
          : 'bg-transparent'
      }`}
    >
      {/* Electric border line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-deep-sky-blue/30 to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gray-900 blur-2xl opacity-5 group-hover:opacity-10 transition-opacity" />
              <img 
                src="/images/soreti-logo.png" 
                alt="Soreti Logo" 
                className="relative h-12 w-auto object-contain transition-transform group-hover:scale-105 duration-300"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {[
              { href: '/', label: t('nav.home') },
              { href: '/#heritage', label: t('nav.heritage') },
              { href: '/#products', label: t('nav.products') },
              { href: '/#about', label: t('nav.about') },
              { href: '/#contact', label: t('nav.contact') },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-5 py-2 text-sm font-bold tracking-wide transition-all duration-300 hover:text-deep-sky-blue relative group ${
                  isScrolled ? 'text-slate-600' : 'text-slate-600'
                }`}
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-deep-sky-blue group-hover:w-full transition-all duration-300 shadow-[0_0_10px_rgba(0,191,255,0.4)]" />
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-2 h-10 px-4 rounded-full border border-transparent hover:border-deep-sky-blue/20 hover:bg-deep-sky-blue/5 ${isScrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-600'}`}
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-bold uppercase tracking-wider">
                    {languages.find(l => l.code === locale)?.name || locale}
                  </span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-slate-100 shadow-2xl">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLocale(lang.code)}
                    className={`text-slate-600 hover:text-deep-sky-blue focus:text-deep-sky-blue focus:bg-deep-sky-blue/5 cursor-pointer ${locale === lang.code ? 'text-deep-sky-blue bg-deep-sky-blue/5' : ''}`}
                  >
                    <span className="mr-3 opacity-80">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/become-agent">
                <Button className="relative group bg-deep-sky-blue hover:bg-deep-sky-blue-dark text-white font-black px-7 py-5 h-10 rounded-full overflow-hidden transition-all duration-300 shadow-lg shadow-deep-sky-blue/20">
                  <span className="relative z-10 flex items-center gap-2">
                    <Zap className="w-4 h-4 fill-white" />
                    {t('nav.becomeAgent')}
                  </span>
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`lg:hidden ${isScrolled || isMobileMenuOpen ? 'text-slate-900' : 'text-slate-900'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-2xl">
          <nav className="flex flex-col p-6 gap-4">
            <Link
              href="/"
              className="text-slate-600 hover:text-deep-sky-blue font-bold py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/#products"
              className="text-slate-600 hover:text-deep-sky-blue font-bold py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.products')}
            </Link>
            <Link
              href="/#about"
              className="text-slate-600 hover:text-deep-sky-blue font-bold py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.about')}
            </Link>
            <Link
              href="/#contact"
              className="text-slate-600 hover:text-deep-sky-blue font-bold py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.contact')}
            </Link>
            <hr className="border-slate-100" />
            <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-deep-sky-blue/50 text-deep-sky-blue hover:bg-deep-sky-blue/5">
                {t('nav.login')}
              </Button>
            </Link>
            <Link href="/become-agent" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full bg-deep-sky-blue text-white font-black shadow-lg shadow-deep-sky-blue/20">
                <Zap className="w-4 h-4 mr-2 fill-white" />
                {t('nav.becomeAgent')}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
