'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Zap,
  User,
  Building2,
  MapPin,
  Warehouse,
  FileText,
  CheckCircle,
  Loader2,
  Shield,
  TrendingUp,
  Users,
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/useI18n';
import { Locale, localeNames, localeFlags } from '@/lib/i18n/config';
import Link from 'next/link';

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

const benefits = [
  {
    icon: Shield,
    title: 'Exclusive Territory',
    desc: 'Protected sales territory in your region',
  },
  {
    icon: TrendingUp,
    title: 'High Margins',
    desc: 'Competitive commission structure',
  },
  {
    icon: Users,
    title: 'Full Training',
    desc: 'Complete product & sales training',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    desc: 'Dedicated support team',
  },
];

export default function BecomeAgentPage() {
  const { locale, setLocale, t } = useI18n();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [step, setStep] = useState(1);

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

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await fetch('/api/regions');
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error('Failed to fetch regions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        toast({
          title: t('agent.form.success'),
          description: 'We will contact you soon.',
        });
      } else {
        throw new Error('Failed to submit');
      }
    } catch {
      toast({
        title: t('agent.form.error'),
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

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  if (submitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[100px]" />
        </div>

        <Card className="relative z-10 max-w-lg w-full bg-gray-900/50 border-gray-800 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Application Submitted!
            </h2>
            <p className="text-gray-400 mb-8">
              Thank you for your interest in becoming an ETUK agent. 
              Our team will review your application and contact you within 2-3 business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="outline" className="border-gray-700 text-gray-300">
                  Back to Home
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setStep(1);
                  setFormData({
                    firstName: '', lastName: '', email: '', phone: '', alternativePhone: '',
                    businessName: '', businessType: '', experience: '', region: '', city: '',
                    woreda: '', kebele: '', address: '', hasWarehouse: false, warehouseSize: '',
                    existingBrands: '', staffCount: '', estimatedCapital: '', bankName: '',
                    accountNumber: '', tinNumber: '', message: '', howDidYouHear: '',
                  });
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
              >
                Submit Another Application
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-30" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center border border-cyan-400/50">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="font-black text-xl text-white">ETUK</span>
            </Link>

            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <div className="flex items-center gap-2">
                {(['en', 'am', 'or'] as Locale[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLocale(lang)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      locale === lang
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {localeFlags[lang]} {localeNames[lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-4">
            <Zap className="w-3 h-3 mr-1" />
            Business Opportunity
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Become an
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              ETUK Agent
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Join Ethiopia's leading electric 3-wheeler network. Get exclusive territorial rights, 
            competitive commissions, and full training support.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Benefits Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24 space-y-6">
              {/* Benefits Card */}
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="text-white">Why Join ETUK?</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{benefit.title}</h4>
                        <p className="text-sm text-gray-400">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-white">11</div>
                      <div className="text-sm text-gray-400">Regions</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">50+</div>
                      <div className="text-sm text-gray-400">Cities</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
              {/* Progress Steps */}
              <div className="border-b border-gray-800 p-6">
                <div className="flex items-center justify-between">
                  {[
                    { num: 1, label: 'Personal' },
                    { num: 2, label: 'Business' },
                    { num: 3, label: 'Location' },
                    { num: 4, label: 'Additional' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                            step >= s.num
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                              : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                        </div>
                        <span className={`text-xs mt-2 ${step >= s.num ? 'text-cyan-400' : 'text-gray-500'}`}>
                          {s.label}
                        </span>
                      </div>
                      {i < 3 && (
                        <div
                          className={`w-12 lg:w-20 h-0.5 mx-2 ${
                            step > s.num ? 'bg-cyan-500' : 'bg-gray-800'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <CardContent className="p-6 space-y-6">
                  {/* Step 1: Personal Info */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                        <User className="w-5 h-5 text-cyan-400" />
                        Personal Information
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-gray-300">First Name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-gray-300">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-gray-300">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-gray-300">Phone *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                            placeholder="+251 ..."
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="altPhone" className="text-gray-300">Alternative Phone</Label>
                          <Input
                            id="altPhone"
                            value={formData.alternativePhone}
                            onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Business Info */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                        <Building2 className="w-5 h-5 text-cyan-400" />
                        Business Information
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="businessName" className="text-gray-300">Business Name</Label>
                          <Input
                            id="businessName"
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="businessType" className="text-gray-300">Business Type</Label>
                          <Select
                            value={formData.businessType}
                            onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                          >
                            <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="individual" className="text-white hover:bg-gray-700">Individual</SelectItem>
                              <SelectItem value="company" className="text-white hover:bg-gray-700">Company</SelectItem>
                              <SelectItem value="partnership" className="text-white hover:bg-gray-700">Partnership</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="experience" className="text-gray-300">Years of Experience</Label>
                          <Input
                            id="experience"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                            placeholder="e.g., 5 years"
                          />
                        </div>
                        <div>
                          <Label htmlFor="staffCount" className="text-gray-300">Number of Staff</Label>
                          <Input
                            id="staffCount"
                            type="number"
                            value={formData.staffCount}
                            onChange={(e) => setFormData({ ...formData, staffCount: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="existingBrands" className="text-gray-300">Existing Brands You Deal With</Label>
                          <Input
                            id="existingBrands"
                            value={formData.existingBrands}
                            onChange={(e) => setFormData({ ...formData, existingBrands: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                            placeholder="e.g., Bajaj, TVS, etc."
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <div className="flex items-center space-x-2 py-4">
                            <Checkbox
                              id="hasWarehouse"
                              checked={formData.hasWarehouse}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, hasWarehouse: checked as boolean })
                              }
                              className="border-gray-600 data-[state=checked]:bg-cyan-500"
                            />
                            <Label htmlFor="hasWarehouse" className="text-gray-300">I have a warehouse/showroom</Label>
                          </div>
                          {formData.hasWarehouse && (
                            <Input
                              value={formData.warehouseSize}
                              onChange={(e) => setFormData({ ...formData, warehouseSize: e.target.value })}
                              className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                              placeholder="Size in square meters"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Location */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                        <MapPin className="w-5 h-5 text-cyan-400" />
                        Location Details
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300">Region *</Label>
                          <Select
                            value={selectedRegion}
                            onValueChange={(value) => {
                              setSelectedRegion(value);
                              setFormData({ ...formData, region: value, city: '' });
                            }}
                          >
                            <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {regions.map((region) => (
                                <SelectItem key={region.id} value={region.name} className="text-white hover:bg-gray-700">
                                  {getRegionName(region)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-300">City *</Label>
                          <Select
                            value={formData.city}
                            onValueChange={(value) => setFormData({ ...formData, city: value })}
                            disabled={!selectedRegion}
                          >
                            <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {regions
                                .find((r) => r.name === selectedRegion)
                                ?.cities.map((city) => (
                                  <SelectItem key={city.id} value={city.name} className="text-white hover:bg-gray-700">
                                    {getCityName(city)}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="woreda" className="text-gray-300">Woreda</Label>
                          <Input
                            id="woreda"
                            value={formData.woreda}
                            onChange={(e) => setFormData({ ...formData, woreda: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="kebele" className="text-gray-300">Kebele</Label>
                          <Input
                            id="kebele"
                            value={formData.kebele}
                            onChange={(e) => setFormData({ ...formData, kebele: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="address" className="text-gray-300">Full Address</Label>
                          <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Additional Info */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        Additional Information
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="estimatedCapital" className="text-gray-300">Estimated Capital (ETB)</Label>
                          <Input
                            id="estimatedCapital"
                            value={formData.estimatedCapital}
                            onChange={(e) => setFormData({ ...formData, estimatedCapital: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                            placeholder="e.g., 500,000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="tinNumber" className="text-gray-300">TIN Number</Label>
                          <Input
                            id="tinNumber"
                            value={formData.tinNumber}
                            onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bankName" className="text-gray-300">Bank Name</Label>
                          <Input
                            id="bankName"
                            value={formData.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountNumber" className="text-gray-300">Account Number</Label>
                          <Input
                            id="accountNumber"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-gray-300">How did you hear about us?</Label>
                          <Select
                            value={formData.howDidYouHear}
                            onValueChange={(value) => setFormData({ ...formData, howDidYouHear: value })}
                          >
                            <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="social_media" className="text-white hover:bg-gray-700">Social Media</SelectItem>
                              <SelectItem value="friend" className="text-white hover:bg-gray-700">Friend/Colleague</SelectItem>
                              <SelectItem value="advertisement" className="text-white hover:bg-gray-700">Advertisement</SelectItem>
                              <SelectItem value="website" className="text-white hover:bg-gray-700">Website</SelectItem>
                              <SelectItem value="other" className="text-white hover:bg-gray-700">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="message" className="text-gray-300">Additional Message</Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-500"
                            rows={4}
                            placeholder="Tell us more about your business goals..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>

                {/* Navigation Buttons */}
                <div className="border-t border-gray-800 p-6 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                    className="border-gray-700 text-gray-300 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {step < 4 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                    >
                      Next Step
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              © {new Date().getFullYear()} Soreti International Trading. All rights reserved.
            </div>
            <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
