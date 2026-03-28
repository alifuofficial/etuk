'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { 
  Zap, 
  User, 
  Building2, 
  MapPin, 
  FileText, 
  CheckCircle, 
  Loader2, 
  Shield, 
  TrendingUp, 
  Users, 
  HeadphonesIcon 
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/useI18n';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/public/Header'), { ssr: false });
const Footer = dynamic(() => import('@/components/public/Footer'), { ssr: false });

interface Region {
  id: string;
  name: string;
  nameAm: string | null;
  nameOr: string | null;
  cities: City[];
}

interface City {
  id: string;
  name: string;
  nameAm: string | null;
  nameOr: string | null;
}

export default function BecomeAgentPage() {
  const { locale, t } = useI18n();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternativePhone: '',
    businessName: '',
    businessType: '',
    experience: '',
    region: '',
    city: '',
    woreda: '',
    kebele: '',
    address: '',
    hasWarehouse: false,
    warehouseSize: '',
    existingBrands: '',
    staffCount: '',
    estimatedCapital: '',
    bankName: '',
    accountNumber: '',
    tinNumber: '',
    message: '',
    howDidYouHear: '',
  });
  const [tradeLicenseFile, setTradeLicenseFile] = useState<File | null>(null);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await fetch('/api/regions');
      if (response.ok) {
        const data = await response.json();
        setRegions(data);
      }
    } catch (error) {
      console.error('Failed to fetch regions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submissionData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submissionData.append(key, value.toString());
      });
      if (tradeLicenseFile) {
        submissionData.append('tradeLicense', tradeLicenseFile);
      }

      const response = await fetch('/api/agents', {
        method: 'POST',
        body: submissionData,
      });

      if (response.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('Failed to submit');
      }
    } catch {
      toast({
        title: 'Submission Error',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRegionName = (region: Region) => {
    if (locale === 'am' && region.nameAm) return region.nameAm;
    if (locale === 'or' && region.nameOr) return region.nameOr;
    return region.name;
  };

  const getCityName = (city: City) => {
    if (locale === 'am' && city.nameAm) return city.nameAm;
    if (locale === 'or' && city.nameOr) return city.nameOr;
    return city.name;
  };

  const benefits = [
    { icon: Shield, title: t('agent.benefits.territory'), desc: t('agent.benefits.territoryDesc') },
    { icon: TrendingUp, title: t('agent.benefits.margins'), desc: t('agent.benefits.marginsDesc') },
    { icon: Users, title: t('agent.benefits.training'), desc: t('agent.benefits.trainingDesc') },
    { icon: HeadphonesIcon, title: t('agent.benefits.support'), desc: t('agent.benefits.supportDesc') },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-deep-sky-blue" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('agent.form.successTitle')}</h2>
          <p className="text-gray-500 max-w-sm mb-8">
            {t('agent.form.successMessage')}
          </p>
          <div className="flex gap-4">
            <Link href="/">
               <Button variant="outline">{t('agent.form.backHome')}</Button>
            </Link>
            <Button onClick={() => setSubmitted(false)} className="bg-gray-900 hover:bg-black text-white font-bold">
               {t('agent.form.sendAnother')}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans relative overflow-hidden">
      {/* Brand Watermark */}
      <div className="fixed -bottom-24 -right-24 w-96 h-96 opacity-[0.03] pointer-events-none z-0 rotate-12">
        <img src="/images/soreti-logo.png" alt="" className="w-full h-full object-contain grayscale" />
      </div>

      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-12 pt-32 relative z-10">
        {/* Simple Hero */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="/images/soreti-logo.png" 
              alt="Soreti Logo" 
              className="h-20 w-auto object-contain drop-shadow-sm" 
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">{t('agent.form.heroTitle')}</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            {t('agent.form.heroDesc')}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {benefits.map((benefit, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
              <benefit.icon className="w-5 h-5 text-deep-sky-blue mx-auto mb-2" />
              <h4 className="text-xs font-bold text-gray-900">{benefit.title}</h4>
              <p className="text-[10px] text-gray-400 mt-1">{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* Unified Application Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Identity */}
          <SectionCard title={t('agent.form.personal')} icon={<User className="w-5 h-5 text-blue-500" />}>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">{t('agent.form.firstName')}</Label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="bg-gray-50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">{t('agent.form.lastName')}</Label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="bg-gray-50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">{t('agent.form.email')}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-gray-50"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">{t('agent.form.phone')}</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-gray-50"
                  placeholder="+251 ..."
                  required
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 2: Business & Legal */}
          <SectionCard title={t('agent.form.business')} icon={<Building2 className="w-5 h-5 text-slate-500" />}>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">{t('agent.form.businessName')}</Label>
                <Input
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="bg-gray-50"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">{t('agent.form.tinNumber')}</Label>
                <Input
                  value={formData.tinNumber}
                  onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                  className="bg-gray-50"
                  placeholder={t('agent.form.tinPlaceholder')}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">{t('agent.form.businessType')}</Label>
                <Select value={formData.businessType} onValueChange={(v) => setFormData({ ...formData, businessType: v })}>
                  <SelectTrigger className="bg-gray-50 h-11">
                    <SelectValue placeholder={t('agent.form.selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">{t('agent.form.individual')}</SelectItem>
                    <SelectItem value="company">{t('agent.form.company')}</SelectItem>
                    <SelectItem value="partnership">{t('agent.form.partnership')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-bold text-gray-400">{t('agent.form.experience')}</Label>
                <Textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="bg-gray-50 min-h-[80px]"
                  placeholder={t('agent.form.experiencePlaceholder')}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">{t('agent.form.licenseLabel')}</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setTradeLicenseFile(file);
                    }}
                    className="bg-gray-50 h-11 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {tradeLicenseFile && (
                    <p className="text-[10px] text-green-600 font-bold ml-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {tradeLicenseFile.name} {t('agent.form.uploadSuccess')}
                    </p>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2 py-2 flex items-center gap-3">
                 <Checkbox 
                  id="hasWarehouse" 
                  checked={formData.hasWarehouse} 
                  onCheckedChange={(c) => setFormData({...formData, hasWarehouse: c as boolean})}
                 />
                 <Label htmlFor="hasWarehouse" className="text-sm font-medium cursor-pointer">{t('agent.form.warehouseLabel')}</Label>
              </div>
            </div>
          </SectionCard>

          {/* Section 3: Location */}
          <SectionCard title={t('agent.form.location')} icon={<MapPin className="w-5 h-5 text-red-500" />}>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">{t('agent.form.region')}</Label>
                <Select value={selectedRegion} onValueChange={(v) => { setSelectedRegion(v); setFormData({ ...formData, region: v, city: '' }); }}>
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue placeholder={t('agent.form.selectRegion')} />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.name}>{getRegionName(region)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">{t('agent.form.city')}</Label>
                <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })} disabled={!selectedRegion}>
                  <SelectTrigger className="bg-gray-50">
                    <SelectValue placeholder={t('agent.form.selectCity')} />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.find((r) => r.name === selectedRegion)?.cities.map((city) => (
                      <SelectItem key={city.id} value={city.name}>{getCityName(city)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">{t('agent.form.address')}</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-gray-50"
                  placeholder={t('agent.form.addressPlaceholder')}
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 4: Message */}
          <SectionCard title={t('agent.form.additional')} icon={<FileText className="w-5 h-5 text-amber-500" />}>
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-400">{t('agent.form.capitalLabel')}</Label>
                  <Input
                    value={formData.estimatedCapital}
                    onChange={(e) => setFormData({ ...formData, estimatedCapital: e.target.value })}
                    className="bg-gray-50"
                    placeholder={t('agent.form.capitalPlaceholder')}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-400">{t('agent.form.howDidYouHear')}</Label>
                  <Select value={formData.howDidYouHear} onValueChange={(v) => setFormData({ ...formData, howDidYouHear: v })}>
                    <SelectTrigger className="bg-gray-50">
                      <SelectValue placeholder={t('agent.form.selectSource')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="friend">Friend/Referral</SelectItem>
                      <SelectItem value="website">ETUK Website</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-400">{t('agent.form.statementLabel')}</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-gray-50 min-h-[120px]"
                  placeholder={t('agent.form.statementPlaceholder')}
                />
              </div>
            </div>
          </SectionCard>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-deep-sky-blue hover:bg-deep-sky-blue-dark text-white font-bold text-lg rounded-xl shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t('agent.form.submitting')}
                </>
              ) : (
                t('agent.form.submit')
              )}
            </Button>
            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">
              {t('agent.form.privacy')}
            </p>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="bg-slate-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        {icon}
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
      </div>
      <CardContent className="p-6 lg:p-8">
        {children}
      </CardContent>
    </Card>
  );
}
