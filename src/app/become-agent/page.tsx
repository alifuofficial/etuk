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
import { cn } from '@/lib/utils';
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
  const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(true);
  const [fetchingSettings, setFetchingSettings] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.isAgentRegistrationEnabled === 'false') {
          setIsRegistrationEnabled(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setFetchingSettings(false);
    }
  };

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(data.error || 'Failed to submit');
      }
    } catch (err: any) {
      toast({
        title: 'Application Error',
        description: err.message || 'Please try again or contact support.',
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

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = 'First Name is required';
      if (!formData.lastName) newErrors.lastName = 'Last Name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    } else if (step === 2) {
      if (!formData.tinNumber) newErrors.tinNumber = 'TIN Number is required';
      if (!formData.experience) newErrors.experience = 'Experience is required';
    } else if (step === 3) {
      if (!formData.region) newErrors.region = 'Region is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!tradeLicenseFile) newErrors.tradeLicense = 'Trade License upload is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast({
        title: 'Missing Required Fields',
        description: 'Please fill in all the required fields to proceed.',
        variant: 'destructive',
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        {fetchingSettings ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 text-deep-sky-blue animate-spin" />
          </div>
        ) : !isRegistrationEnabled ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
              <Zap className="w-10 h-10 text-amber-500" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-gray-900 leading-tight">
                Registration Currently <span className="text-deep-sky-blue">Paused</span>
              </h1>
              <p className="text-gray-500 max-w-md mx-auto font-medium">
                We're currently processing existing applications and not accepting new agent requests at this time. 
                Please check back soon or follow our social media for updates.
              </p>
            </div>
            <Link href="/">
              <Button className="h-12 px-8 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all">
                Back to Home
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stepper Progress Indicator */}
            <div className="mb-12">
              <div className="flex items-center justify-between relative px-2">
                <div className="absolute top-1/2 left-0 h-0.5 bg-gray-200 w-full -z-10" />
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-2 bg-slate-50 px-2 transition-all duration-300">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                      currentStep === s ? "bg-deep-sky-blue text-white border-deep-sky-blue scale-110 shadow-lg shadow-blue-100" : 
                      currentStep > s ? "bg-green-500 text-white border-green-500" : "bg-white text-gray-400 border-gray-200"
                    )}>
                      {currentStep > s ? <CheckCircle className="w-5 h-5" /> : s}
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      currentStep === s ? "text-deep-sky-blue" : "text-gray-400"
                    )}>
                      {s === 1 ? 'Identity' : s === 2 ? 'Business' : s === 3 ? 'Location' : 'Review'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Grid - only on Step 1 */}
            {currentStep === 1 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {benefits.map((benefit, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                    <benefit.icon className="w-5 h-5 text-deep-sky-blue mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-gray-900">{benefit.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Multi-Step Application Form */}
            <div className="space-y-8">
              {currentStep === 1 && (
                <SectionCard title={t('agent.form.personal')} icon={<User className="w-5 h-5 text-blue-500" />}>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className={cn("text-xs font-bold", errors.firstName ? "text-red-500" : "text-gray-400")}>{t('agent.form.firstName')} *</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={cn("bg-gray-50", errors.firstName && "border-red-500")}
                      />
                      {errors.firstName && <p className="text-[10px] text-red-500 font-bold">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className={cn("text-xs font-bold", errors.lastName ? "text-red-500" : "text-gray-400")}>{t('agent.form.lastName')} *</Label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={cn("bg-gray-50", errors.lastName && "border-red-500")}
                      />
                      {errors.lastName && <p className="text-[10px] text-red-500 font-bold">{errors.lastName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className={cn("text-xs font-bold", errors.email ? "text-red-500" : "text-gray-400")}>{t('agent.form.email')} *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={cn("bg-gray-50", errors.email && "border-red-500")}
                      />
                      {errors.email && <p className="text-[10px] text-red-500 font-bold">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className={cn("text-xs font-bold", errors.phone ? "text-red-500" : "text-gray-400")}>{t('agent.form.phone')} *</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={cn("bg-gray-50", errors.phone && "border-red-500")}
                        placeholder="+251 ..."
                      />
                      {errors.phone && <p className="text-[10px] text-red-500 font-bold">{errors.phone}</p>}
                    </div>
                  </div>
                </SectionCard>
              )}

              {currentStep === 2 && (
                <SectionCard title={t('agent.form.business')} icon={<Building2 className="w-5 h-5 text-slate-500" />}>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-400">{t('agent.form.businessName')}</Label>
                      <Input
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={cn("text-xs font-bold", errors.tinNumber ? "text-red-500" : "text-gray-400")}>{t('agent.form.tinNumber')} *</Label>
                      <Input
                        value={formData.tinNumber}
                        onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                        className={cn("bg-gray-50", errors.tinNumber && "border-red-500")}
                        placeholder={t('agent.form.tinPlaceholder')}
                      />
                      {errors.tinNumber && <p className="text-[10px] text-red-500 font-bold">{errors.tinNumber}</p>}
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
                      <Label className={cn("text-xs font-bold", errors.experience ? "text-red-500" : "text-gray-400")}>{t('agent.form.experience')} *</Label>
                      <Textarea
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className={cn("bg-gray-50 min-h-[80px]", errors.experience && "border-red-500")}
                        placeholder={t('agent.form.experiencePlaceholder')}
                      />
                      {errors.experience && <p className="text-[10px] text-red-500 font-bold">{errors.experience}</p>}
                    </div>
                  </div>
                </SectionCard>
              )}

              {currentStep === 3 && (
                <SectionCard title={t('agent.form.location')} icon={<MapPin className="w-5 h-5 text-red-500" />}>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className={cn("text-xs font-bold", errors.region ? "text-red-500" : "text-gray-400")}>{t('agent.form.region')} *</Label>
                      <Select value={selectedRegion} onValueChange={(v) => { setSelectedRegion(v); setFormData({ ...formData, region: v, city: '' }); }}>
                        <SelectTrigger className={cn("bg-gray-50", errors.region && "border-red-500")}>
                          <SelectValue placeholder={t('agent.form.selectRegion')} />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region.id} value={region.name}>{getRegionName(region)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.region && <p className="text-[10px] text-red-500 font-bold">{errors.region}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className={cn("text-xs font-bold", errors.city ? "text-red-500" : "text-gray-400")}>{t('agent.form.city')} *</Label>
                      <Select value={formData.city} onValueChange={(v) => setFormData({ ...formData, city: v })} disabled={!selectedRegion}>
                        <SelectTrigger className={cn("bg-gray-50", errors.city && "border-red-500")}>
                          <SelectValue placeholder={t('agent.form.selectCity')} />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.find((r) => r.name === selectedRegion)?.cities.map((city) => (
                            <SelectItem key={city.id} value={city.name}>{getCityName(city)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.city && <p className="text-[10px] text-red-500 font-bold">{errors.city}</p>}
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
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className={cn("text-xs font-bold", errors.tradeLicense ? "text-red-500" : "text-gray-400")}>{t('agent.form.licenseLabel')} *</Label>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setTradeLicenseFile(file);
                          }}
                          className={cn("bg-gray-50 h-11 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer", errors.tradeLicense && "border-red-500")}
                        />
                        {tradeLicenseFile && (
                          <p className="text-[10px] text-green-600 font-bold ml-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {tradeLicenseFile.name} {t('agent.form.uploadSuccess')}
                          </p>
                        )}
                        {errors.tradeLicense && <p className="text-[10px] text-red-500 font-bold">{errors.tradeLicense}</p>}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {currentStep === 4 && (
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
                      <div className="sm:col-span-2 py-2 flex items-center gap-3">
                        <Checkbox 
                          id="hasWarehouse" 
                          checked={formData.hasWarehouse} 
                          onCheckedChange={(c) => setFormData({...formData, hasWarehouse: c as boolean})}
                        />
                        <Label htmlFor="hasWarehouse" className="text-sm font-medium cursor-pointer">{t('agent.form.warehouseLabel')}</Label>
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

                    <Card className="bg-blue-50/50 border-blue-100 rounded-2xl p-6 lg:p-8">
                      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-blue-100">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-bold text-blue-900">Application Summary</h4>
                      </div>
                      
                      <div className="space-y-8">
                        {/* Identity Summary */}
                        <div>
                          <h5 className="text-[10px] uppercase tracking-wider font-bold text-blue-400 mb-3 ml-1">Personal Identity</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/50 p-4 rounded-xl border border-blue-50">
                            <ReviewItem label="Full Name" value={`${formData.firstName} ${formData.lastName}`} />
                            <ReviewItem label="Email Address" value={formData.email} />
                            <ReviewItem label="Phone Number" value={formData.phone} />
                          </div>
                        </div>

                        {/* Business Summary */}
                        <div>
                          <h5 className="text-[10px] uppercase tracking-wider font-bold text-blue-400 mb-3 ml-1">Business Details</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/50 p-4 rounded-xl border border-blue-50">
                            <ReviewItem label="Business Name" value={formData.businessName || 'Not Provided'} />
                            <ReviewItem label="TIN Number" value={formData.tinNumber} />
                            <ReviewItem label="Business Type" value={formData.businessType || 'Not Provided'} />
                            <ReviewItem label="Warehouse" value={formData.hasWarehouse ? 'Available' : 'None'} />
                          </div>
                        </div>

                        {/* Location Summary */}
                        <div>
                          <h5 className="text-[10px] uppercase tracking-wider font-bold text-blue-400 mb-3 ml-1">Location & Documents</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/50 p-4 rounded-xl border border-blue-50">
                            <ReviewItem label="Region" value={formData.region} />
                            <ReviewItem label="City" value={formData.city} />
                            <ReviewItem label="Address" value={formData.address || 'Not Provided'} />
                            <ReviewItem 
                              label="Trade License" 
                              value={tradeLicenseFile?.name || 'File Uploaded'} 
                              icon={<FileText className="w-3 h-3" />}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </SectionCard>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    className="h-14 flex-1 font-bold text-lg rounded-xl border-gray-200"
                  >
                    Back
                  </Button>
                )}
                
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="h-14 flex-[2] bg-gray-900 hover:bg-black text-white font-bold text-lg rounded-xl transition-all"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={loading}
                    className="h-14 flex-[2] bg-deep-sky-blue hover:bg-deep-sky-blue-dark text-white font-bold text-lg rounded-xl shadow-lg transition-all"
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
                )}
              </div>
              
              <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                {t('agent.form.privacy')}
              </p>
            </div>
          </>
        )}
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

function ReviewItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
        {label}
      </div>
      <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
        {icon && <span className="text-blue-500">{icon}</span>}
        {value}
      </div>
    </div>
  );
}
