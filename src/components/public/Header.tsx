'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Zap, Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useI18n } from '@/lib/i18n/useI18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function Header() {
  const { locale, setLocale, t, languages } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Throttled scroll handler
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLocaleChange = useCallback((code: string) => {
    setLocale(code);
  }, [setLocale]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const currentLanguage = languages.find(l => l.code === locale);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-slate-200/30'
          : 'bg-transparent'
      }`}
    >
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-deep-sky-blue/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 lg:w-12 lg:h-12">
              <Image
                src="/images/soreti-logo.png"
                alt="Soreti Logo"
                fill
                sizes="48px"
                className="object-contain transition-transform group-hover:scale-105"
                priority
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
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-deep-sky-blue transition-colors relative group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-deep-sky-blue group-hover:w-full transition-all" />
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-9 px-3 rounded-full hover:bg-slate-100"
                >
                  <Globe className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline text-sm font-semibold text-slate-700">
                    {currentLanguage?.name || locale}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLocaleChange(lang.code)}
                    className={`cursor-pointer ${locale === lang.code ? 'bg-deep-sky-blue/10 text-deep-sky-blue' : ''}`}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* CTA Button */}
            <Link href="/become-agent" className="hidden md:block">
              <Button className="bg-deep-sky-blue hover:bg-deep-sky-blue-dark text-white font-bold px-5 h-9 rounded-full shadow-md shadow-deep-sky-blue/20 transition-all">
                <Zap className="w-4 h-4 mr-1.5" />
                {t('nav.becomeAgent')}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl">
          <nav className="flex flex-col p-4 gap-1">
            {[
              { href: '/', label: t('nav.home') },
              { href: '/#products', label: t('nav.products') },
              { href: '/#about', label: t('nav.about') },
              { href: '/#contact', label: t('nav.contact') },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-slate-700 hover:text-deep-sky-blue font-semibold py-3 px-2 rounded-lg hover:bg-slate-50"
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
            <hr className="border-slate-100 my-2" />
            <Link href="/auth/login" onClick={closeMobileMenu}>
              <Button variant="outline" className="w-full border-slate-200 text-slate-700">
                {t('nav.login')}
              </Button>
            </Link>
            <Link href="/become-agent" onClick={closeMobileMenu}>
              <Button className="w-full bg-deep-sky-blue text-white font-bold mt-2">
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

export default memo(Header);
