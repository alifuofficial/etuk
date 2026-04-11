'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Lock, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Image as ImageIcon,
  Save,
  ShieldCheck,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Factory,
  Languages,
  MessageSquare,
  Send,
  Eye,
  EyeOff,
  Settings2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import LanguageManager from '@/components/admin/settings/LanguageManager';
import TranslationManager from '@/components/admin/settings/TranslationManager';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState('security');

  const [smsApiKey, setSmsApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [smsTestPhone, setSmsTestPhone] = useState('');
  const [smsTestMsg, setSmsTestMsg] = useState('Hello! This is a test SMS from ETUK Admin.');
  const [smsSaving, setSmsSaving] = useState(false);
  const [smsTesting, setSmsTesting] = useState(false);

  const [profileData, setProfileData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [siteData, setSiteData] = useState({
    siteName: 'Soreti Ethiopia',
    supportEmail: 'support@etuk.et',
    phone: '+251 911 234 567',
    address: 'Addis Ababa, Ethiopia',
    footerAbout: 'Driving the transition to sustainable mobility across Ethiopia. Assembled in Modjo, supported in Addis Ababa.',
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    factoryName: 'Modjo Factory',
    factoryDesc: 'Our main assembly hub ensuring rapid delivery and local parts support.',
    footerContactTitle: 'Performance',
    isAgentRegistrationEnabled: 'true',
    isAgentPortalEnabled: 'true',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSiteData(prev => ({...prev, ...data}));
          if (data.sms_api_key) setSmsApiKey(data.sms_api_key);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match.', variant: 'destructive' });
      return;
    }
    if (profileData.newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword,
        }),
      });

      if (response.ok) {
        toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
        setProfileData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to change password.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSiteUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteData),
      });

      if (response.ok) {
        toast({ title: 'Settings Saved', description: 'Configuration updated successfully.' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update settings.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-deep-sky-blue rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your platform configuration and preferences</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-11 bg-gray-100/80 p-1 rounded-xl gap-1">
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 px-4 font-semibold text-sm text-gray-500">
            <Lock className="w-4 h-4 mr-2" /> Security
          </TabsTrigger>
          {session?.user?.role === 'ADMIN' && (
            <>
              <TabsTrigger value="branding" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 px-4 font-semibold text-sm text-gray-500">
                <Globe className="w-4 h-4 mr-2" /> Branding
              </TabsTrigger>
              <TabsTrigger value="features" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 px-4 font-semibold text-sm text-gray-500">
                <Settings2 className="w-4 h-4 mr-2" /> Features
              </TabsTrigger>
              <TabsTrigger value="languages" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 px-4 font-semibold text-sm text-gray-500">
                <Languages className="w-4 h-4 mr-2" /> Languages
              </TabsTrigger>
              <TabsTrigger value="translations" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 px-4 font-semibold text-sm text-gray-500">
                <Sparkles className="w-4 h-4 mr-2" /> Translations
              </TabsTrigger>
              <TabsTrigger value="sms" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 px-4 font-semibold text-sm text-gray-500">
                <MessageSquare className="w-4 h-4 mr-2" /> SMS
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="security" className="mt-6 outline-none">
          <Card className="border-gray-200/60 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Account Security</h2>
                  <p className="text-gray-300 text-sm mt-0.5">Update your password to keep your account secure</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Protected Account</p>
                    <p className="text-xs text-blue-700 mt-1">{session?.user?.email}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Password</Label>
                    <Input 
                      type="password" 
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                      className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</Label>
                      <Input 
                        type="password" 
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                        className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                        placeholder="Min 8 characters"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm Password</Label>
                      <Input 
                        type="password" 
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                        className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="h-12 px-8 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg shadow-gray-200/50 transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Updating...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />Update Password</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {session?.user?.role === 'ADMIN' && (
          <>
            <TabsContent value="branding" className="mt-6 outline-none">
              <form onSubmit={handleSiteUpdate} className="space-y-6">
                <Card className="border-gray-200/60 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Brand Identity</h2>
                        <p className="text-blue-100 text-sm mt-0.5">Configure your platform's appearance and contact info</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Logo</Label>
                        <div className="aspect-[2/1] bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-deep-sky-blue hover:bg-blue-50/30 transition-all group">
                          <ImageIcon className="w-10 h-10 text-gray-300 group-hover:text-deep-sky-blue transition-colors" />
                          <p className="text-xs text-gray-400 font-medium mt-2">Click to upload</p>
                          <p className="text-[10px] text-gray-300 mt-1">PNG, 200x60px</p>
                        </div>
                      </div>

                      <div className="lg:col-span-2 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Platform Name</Label>
                            <Input 
                              value={siteData.siteName}
                              onChange={(e) => setSiteData({...siteData, siteName: e.target.value})}
                              className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4"
                              placeholder="Soreti Ethiopia"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Support Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                value={siteData.supportEmail}
                                onChange={(e) => setSiteData({...siteData, supportEmail: e.target.value})}
                                className="h-12 bg-gray-50 border-gray-200 rounded-xl pl-11"
                                placeholder="support@etuk.et"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</Label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                value={siteData.phone}
                                onChange={(e) => setSiteData({...siteData, phone: e.target.value})}
                                className="h-12 bg-gray-50 border-gray-200 rounded-xl pl-11"
                                placeholder="+251 911 234 567"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</Label>
                            <div className="relative">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input 
                                value={siteData.address}
                                onChange={(e) => setSiteData({...siteData, address: e.target.value})}
                                className="h-12 bg-gray-50 border-gray-200 rounded-xl pl-11"
                                placeholder="Addis Ababa, Ethiopia"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">About Section</Label>
                          <Textarea 
                            value={siteData.footerAbout}
                            onChange={(e) => setSiteData({...siteData, footerAbout: e.target.value})}
                            className="bg-gray-50 border-gray-200 rounded-xl px-4 py-3 min-h-[90px] resize-none"
                            placeholder="Brief description for the footer..."
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200/60 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="border-b border-gray-100 px-8 py-5">
                    <h3 className="text-base font-bold text-gray-900">Social Media Links</h3>
                    <p className="text-xs text-gray-500 mt-1">Connect your social profiles</p>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { key: 'facebook', icon: Facebook, color: 'text-blue-600', placeholder: 'https://facebook.com/...' },
                        { key: 'twitter', icon: Twitter, color: 'text-sky-500', placeholder: 'https://twitter.com/...' },
                        { key: 'instagram', icon: Instagram, color: 'text-pink-600', placeholder: 'https://instagram.com/...' },
                        { key: 'youtube', icon: Youtube, color: 'text-red-600', placeholder: 'https://youtube.com/...' },
                      ].map((social) => (
                        <div key={social.key} className="space-y-2">
                          <Label className="text-xs text-gray-500 font-medium flex items-center gap-2">
                            <social.icon className={`w-4 h-4 ${social.color}`} />
                            <span className="capitalize">{social.key}</span>
                          </Label>
                          <Input 
                            value={siteData[social.key as keyof typeof siteData] as string}
                            onChange={(e) => setSiteData({...siteData, [social.key]: e.target.value})}
                            className="h-11 bg-gray-50 border-gray-200 rounded-xl px-4"
                            placeholder={social.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    className="h-12 px-8 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg shadow-gray-200/50 transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />Save Changes</>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="features" className="mt-6 outline-none">
              <form onSubmit={handleSiteUpdate} className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-gray-200/60 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-gray-100 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 rounded-xl">
                          <Factory className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Factory Information</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Assembly hub details</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Factory Name</Label>
                        <Input 
                          value={siteData.factoryName}
                          onChange={(e) => setSiteData({...siteData, factoryName: e.target.value})}
                          className="h-11 bg-gray-50 border-gray-200 rounded-xl px-4"
                          placeholder="Modjo Factory"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</Label>
                        <Textarea 
                          value={siteData.factoryDesc}
                          onChange={(e) => setSiteData({...siteData, factoryDesc: e.target.value})}
                          className="bg-gray-50 border-gray-200 rounded-xl px-4 py-3 min-h-[80px] resize-none"
                          placeholder="Our main assembly hub..."
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200/60 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-gray-100 px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-green-50 rounded-xl">
                          <Settings2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Feature Toggles</h3>
                          <p className="text-xs text-gray-500 mt-0.5">Enable or disable platform features</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="font-semibold text-gray-900">Agent Registration</p>
                          <p className="text-xs text-gray-500 mt-0.5">Public application form</p>
                        </div>
                        <Switch 
                          checked={siteData.isAgentRegistrationEnabled === 'true'} 
                          onCheckedChange={(checked) => setSiteData({...siteData, isAgentRegistrationEnabled: String(checked)})}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <p className="font-semibold text-gray-900">Agent Portal</p>
                          <p className="text-xs text-gray-500 mt-0.5">Agent dashboard access</p>
                        </div>
                        <Switch 
                          checked={siteData.isAgentPortalEnabled === 'true'} 
                          onCheckedChange={(checked) => setSiteData({...siteData, isAgentPortalEnabled: String(checked)})}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    type="submit" 
                    className="h-12 px-8 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg shadow-gray-200/50 transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />Save Changes</>
                    )}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="languages" className="mt-6 outline-none">
              <LanguageManager />
            </TabsContent>

            <TabsContent value="translations" className="mt-6 outline-none">
              <TranslationManager />
            </TabsContent>

            <TabsContent value="sms" className="mt-6 outline-none space-y-6">
              <Card className="border-gray-200/60 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-500 px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">SMS Configuration</h2>
                      <p className="text-purple-100 text-sm mt-0.5">SMSEthiopia.et API integration</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">API Key</Label>
                        <div className="relative">
                          <Input 
                            type={showApiKey ? 'text' : 'password'}
                            value={smsApiKey}
                            onChange={(e) => setSmsApiKey(e.target.value)}
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4 pr-12 font-mono text-sm"
                            placeholder="Enter your API key..."
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">Stored in settings. Update environment variable for active changes.</p>
                      </div>
                      <Button
                        onClick={async () => {
                          setSmsSaving(true);
                          try {
                            const res = await fetch('/api/settings', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ sms_api_key: smsApiKey }),
                            });
                            if (res.ok) {
                              toast({ title: 'API Key Saved', description: 'Key stored in settings database.' });
                            } else throw new Error();
                          } catch {
                            toast({ title: 'Error', description: 'Failed to save key.', variant: 'destructive' });
                          } finally { setSmsSaving(false); }
                        }}
                        disabled={!smsApiKey || smsSaving}
                        className="h-11 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl"
                      >
                        {smsSaving ? 'Saving...' : 'Save Key'}
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Test Phone Number</Label>
                        <Input 
                          type="tel"
                          value={smsTestPhone}
                          onChange={(e) => setSmsTestPhone(e.target.value)}
                          className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4"
                          placeholder="251911234567"
                        />
                        <p className="text-xs text-gray-400">Format: 251XXXXXXXXX (no +)</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Test Message</Label>
                          <span className={`text-xs font-medium tabular-nums ${smsTestMsg.length > 150 ? 'text-red-500' : 'text-gray-400'}`}>
                            {smsTestMsg.length}/160
                          </span>
                        </div>
                        <Textarea 
                          value={smsTestMsg}
                          onChange={(e) => setSmsTestMsg(e.target.value.slice(0, 160))}
                          className="bg-gray-50 border-gray-200 rounded-xl px-4 py-3 min-h-[80px] resize-none"
                          placeholder="Enter test message..."
                        />
                      </div>
                      <Button
                        onClick={async () => {
                          if (!smsTestPhone || !smsTestMsg) return;
                          setSmsTesting(true);
                          try {
                            const res = await fetch('/api/sms/send', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ phones: [{ phone: smsTestPhone }], message: smsTestMsg }),
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error);
                            if (data.successCount > 0) {
                              toast({ title: 'SMS Sent', description: `Message delivered to ${smsTestPhone}` });
                            } else {
                              toast({ title: 'Delivery Failed', description: data.results?.[0]?.error || 'Unknown error', variant: 'destructive' });
                            }
                          } catch (e: any) {
                            toast({ title: 'Error', description: e.message, variant: 'destructive' });
                          } finally { setSmsTesting(false); }
                        }}
                        disabled={!smsTestPhone || !smsTestMsg || smsTesting}
                        className="h-11 bg-deep-sky-blue hover:bg-blue-600 text-white font-bold rounded-xl"
                      >
                        {smsTesting ? (
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Sending...</>
                        ) : (
                          <><Send className="w-4 h-4 mr-2" />Send Test</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}