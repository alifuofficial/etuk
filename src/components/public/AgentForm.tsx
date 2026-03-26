'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/useI18n';
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
  User,
  Building2,
  MapPin,
  Warehouse,
  CreditCard,
  FileText,
  CheckCircle,
  Loader2,
} from 'lucide-react';

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

export default function AgentForm() {
  const { t, locale } = useI18n();
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

  const benefits = [
    t('agent.benefit1'),
    t('agent.benefit2'),
    t('agent.benefit3'),
    t('agent.benefit4'),
    t('agent.benefit5'),
  ];

  if (submitted) {
    return (
      <section id="agent" className="py-20 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Submitted!
            </h2>
            <p className="text-gray-600 mb-8">
              {t('agent.form.success')}
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setFormData({
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
              }}
              style={{ backgroundColor: '#00BFFF' }}
            >
              Submit Another Application
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="agent" className="py-20 bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('agent.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('agent.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Benefits Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg border-sky-100">
              <CardHeader className="bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-t-lg">
                <CardTitle>{t('agent.benefits')}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-sky-500" />
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-sky-500" />
                    {t('agent.form.personalInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t('agent.form.firstName')} *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t('agent.form.lastName')} *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('agent.form.email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('agent.form.phone')} *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="altPhone">{t('agent.form.altPhone')}</Label>
                    <Input
                      id="altPhone"
                      value={formData.alternativePhone}
                      onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-sky-500" />
                    {t('agent.form.businessInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">{t('agent.form.businessName')}</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">{t('agent.form.businessType')}</Label>
                    <Select
                      value={formData.businessType}
                      onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">{t('agent.form.individual')}</SelectItem>
                        <SelectItem value="company">{t('agent.form.company')}</SelectItem>
                        <SelectItem value="partnership">{t('agent.form.partnership')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experience">{t('agent.form.experience')}</Label>
                    <Input
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="e.g., 5 years"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-sky-500" />
                    {t('agent.form.location')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('agent.form.region')} *</Label>
                    <Select
                      value={selectedRegion}
                      onValueChange={(value) => {
                        setSelectedRegion(value);
                        setFormData({ ...formData, region: value, city: '' });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.id} value={region.name}>
                            {getRegionName(region)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('agent.form.city')} *</Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData({ ...formData, city: value })}
                      disabled={!selectedRegion}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions
                          .find((r) => r.name === selectedRegion)
                          ?.cities.map((city) => (
                            <SelectItem key={city.id} value={city.name}>
                              {getCityName(city)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="woreda">{t('agent.form.woreda')}</Label>
                    <Input
                      id="woreda"
                      value={formData.woreda}
                      onChange={(e) => setFormData({ ...formData, woreda: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="kebele">{t('agent.form.kebele')}</Label>
                    <Input
                      id="kebele"
                      value={formData.kebele}
                      onChange={(e) => setFormData({ ...formData, kebele: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">{t('agent.form.address')}</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Facilities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="w-5 h-5 text-sky-500" />
                    {t('agent.form.facilities')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasWarehouse"
                      checked={formData.hasWarehouse}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, hasWarehouse: checked as boolean })
                      }
                    />
                    <Label htmlFor="hasWarehouse">{t('agent.form.hasWarehouse')}</Label>
                  </div>
                  {formData.hasWarehouse && (
                    <div>
                      <Label htmlFor="warehouseSize">{t('agent.form.warehouseSize')}</Label>
                      <Input
                        id="warehouseSize"
                        value={formData.warehouseSize}
                        onChange={(e) => setFormData({ ...formData, warehouseSize: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="existingBrands">{t('agent.form.existingBrands')}</Label>
                      <Input
                        id="existingBrands"
                        value={formData.existingBrands}
                        onChange={(e) => setFormData({ ...formData, existingBrands: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="staffCount">{t('agent.form.staffCount')}</Label>
                      <Input
                        id="staffCount"
                        type="number"
                        value={formData.staffCount}
                        onChange={(e) => setFormData({ ...formData, staffCount: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-sky-500" />
                    {t('agent.form.financial')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedCapital">{t('agent.form.estimatedCapital')}</Label>
                    <Input
                      id="estimatedCapital"
                      value={formData.estimatedCapital}
                      onChange={(e) => setFormData({ ...formData, estimatedCapital: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">{t('agent.form.bankName')}</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">{t('agent.form.accountNumber')}</Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-500" />
                    {t('agent.form.documents')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tinNumber">{t('agent.form.tinNumber')}</Label>
                    <Input
                      id="tinNumber"
                      value={formData.tinNumber}
                      onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{t('agent.form.howDidYouHear')}</Label>
                    <Select
                      value={formData.howDidYouHear}
                      onValueChange={(value) => setFormData({ ...formData, howDidYouHear: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social_media">Social Media</SelectItem>
                        <SelectItem value="friend">Friend/Colleague</SelectItem>
                        <SelectItem value="advertisement">Advertisement</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="message">{t('agent.form.message')}</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                style={{ backgroundColor: '#00BFFF' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  t('agent.form.submit')
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
