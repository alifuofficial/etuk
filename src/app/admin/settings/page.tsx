'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
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
  Layout,
  BookOpen,
  Languages,
  MessageSquare,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import LanguageManager from '@/components/admin/settings/LanguageManager';
import TranslationManager from '@/components/admin/settings/TranslationManager';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // SMS Settings State
  const [smsApiKey, setSmsApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [smsTestPhone, setSmsTestPhone] = useState('');
  const [smsTestMsg, setSmsTestMsg] = useState('Hello! This is a test SMS from ETUK Admin.');
  const [smsSaving, setSmsSaving] = useState(false);
  const [smsTesting, setSmsTesting] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Site Info State
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

  // Load settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSiteData(prev => ({
            ...prev,
            ...data
          }));
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
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Password Updated',
        description: 'Your security credentials have been successfully updated.',
      });
      setProfileData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 1500);
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
        toast({
          title: 'Settings Saved',
          description: 'Global site configuration and footer metadata have been updated.',
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update system settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deep-sky-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account security and global site presence.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className={`grid w-full max-w-3xl ${session?.user?.role === 'ADMIN' ? 'grid-cols-5' : 'grid-cols-1'} h-12 bg-slate-100/50 p-1 rounded-xl mb-8`}>
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-bold text-xs text-slate-500 transition-all">
            <Lock className="w-3.5 h-3.5 mr-2 text-deep-sky-blue" />
            Security
          </TabsTrigger>
          {session?.user?.role === 'ADMIN' && (
            <>
              <TabsTrigger value="site" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-bold text-xs text-slate-500 transition-all">
                <Layout className="w-3.5 h-3.5 mr-2 text-deep-sky-blue" />
                Site Content
              </TabsTrigger>
              <TabsTrigger value="languages" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-bold text-xs text-slate-500 transition-all">
                <Languages className="w-3.5 h-3.5 mr-2 text-deep-sky-blue" />
                Languages
              </TabsTrigger>
              <TabsTrigger value="translations" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-bold text-xs text-slate-500 transition-all">
                <BookOpen className="w-3.5 h-3.5 mr-2 text-deep-sky-blue" />
                Dictionary
              </TabsTrigger>
              <TabsTrigger value="sms" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-bold text-xs text-slate-500 transition-all">
                <MessageSquare className="w-3.5 h-3.5 mr-2 text-deep-sky-blue" />
                SMS
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Security / Profile Tab */}
        <TabsContent value="profile" className="space-y-6 outline-none">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-gray-900">Security Credentials</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Update your administrative password regularly to maintain system integrity. Ensure your new password is at least 8 characters long.
              </p>
              <div className="mt-6 p-4 bg-deep-sky-blue/[0.03] rounded-xl border border-deep-sky-blue/10 flex items-start gap-3">
                 <ShieldCheck className="w-5 h-5 text-deep-sky-blue shrink-0 mt-0.5" />
                 <p className="text-xs text-deep-sky-blue-dark font-medium leading-relaxed">
                    Your account is currently protected by standard JWT encryption.
                 </p>
              </div>
            </div>

            <Card className="md:col-span-2 border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-50 pb-6 px-8 pt-8">
                <CardTitle className="text-lg font-bold">Change Password</CardTitle>
                <CardDescription className="text-gray-500">Managed account: {session?.user?.email}</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Current Password</Label>
                    <Input 
                      type="password" 
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                      className="h-11 bg-gray-50 border-gray-200 rounded-lg px-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">New Password</Label>
                      <Input 
                        type="password" 
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                        className="h-11 bg-gray-50 border-gray-200 rounded-lg px-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Confirm New Password</Label>
                      <Input 
                        type="password" 
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                        className="h-11 bg-gray-50 border-gray-200 rounded-lg px-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-gray-900 hover:bg-black text-white font-bold h-11 px-8 rounded-lg shadow-lg shadow-gray-200 transition-all font-bold"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Site Config Tab */}
        <TabsContent value="site" className="space-y-8 outline-none">
          <form onSubmit={handleSiteUpdate} className="space-y-8">
            {/* Branding Card */}
            <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-gray-900 p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Globe className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold">Brand Identity</CardTitle>
                </div>
                <p className="text-gray-400 text-sm">Configure your platform's name, logo, and contact information</p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Site Logo</Label>
                    <div className="flex flex-col items-center justify-center h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-deep-sky-blue hover:bg-blue-50/50 transition-all group">
                      <ImageIcon className="w-10 h-10 text-gray-300 group-hover:text-deep-sky-blue transition-colors mb-2" />
                      <p className="text-xs text-gray-400 font-medium">Upload Logo</p>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center italic">Recommended: 200x60px PNG</p>
                  </div>

                  {/* Site Info */}
                  <div className="md:col-span-2 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Platform Name</Label>
                        <Input 
                          value={siteData.siteName}
                          onChange={(e) => setSiteData({...siteData, siteName: e.target.value})}
                          className="h-11 bg-gray-50 border-gray-200 rounded-xl px-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                          placeholder="Soreti Ethiopia"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Footer Section Title</Label>
                        <Input 
                          value={siteData.footerContactTitle}
                          onChange={(e) => setSiteData({...siteData, footerContactTitle: e.target.value})}
                          className="h-11 bg-gray-50 border-gray-200 rounded-xl px-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                          placeholder="Performance"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Support Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          value={siteData.supportEmail}
                          onChange={(e) => setSiteData({...siteData, supportEmail: e.target.value})}
                          className="h-11 bg-gray-50 border-gray-200 rounded-xl pl-10 pr-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                          placeholder="support@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input 
                            value={siteData.phone}
                            onChange={(e) => setSiteData({...siteData, phone: e.target.value})}
                            className="h-11 bg-gray-50 border-gray-200 rounded-xl pl-10 pr-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                            placeholder="+251 911 234 567"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Office Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input 
                            value={siteData.address}
                            onChange={(e) => setSiteData({...siteData, address: e.target.value})}
                            className="h-11 bg-gray-50 border-gray-200 rounded-xl pl-10 pr-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                            placeholder="Addis Ababa, Ethiopia"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer & Social */}
            <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-gray-900 p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Layout className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-xl font-bold">Footer & Social Links</CardTitle>
                </div>
                <p className="text-gray-400 text-sm">Manage footer content and social media presence</p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">About Section Text</Label>
                  <Textarea 
                    value={siteData.footerAbout}
                    onChange={(e) => setSiteData({...siteData, footerAbout: e.target.value})}
                    className="bg-gray-50 border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-deep-sky-blue transition-all min-h-[100px] resize-none"
                    placeholder="Driving the transition to sustainable mobility across Ethiopia..."
                  />
                </div>

                <div className="h-px bg-gray-100" />

                <div>
                  <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4 block">Social Media Links</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500 font-medium flex items-center gap-2">
                        <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
                      </Label>
                      <Input 
                        value={siteData.facebook}
                        onChange={(e) => setSiteData({...siteData, facebook: e.target.value})}
                        className="h-11 bg-gray-50 border-gray-200 rounded-xl px-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500 font-medium flex items-center gap-2">
                        <Twitter className="w-3.5 h-3.5 text-sky-500" /> Twitter
                      </Label>
                      <Input 
                        value={siteData.twitter}
                        onChange={(e) => setSiteData({...siteData, twitter: e.target.value})}
                        className="h-11 bg-gray-50 border-gray-200 rounded-xl px-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500 font-medium flex items-center gap-2">
                        <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram
                      </Label>
                      <Input 
                        value={siteData.instagram}
                        onChange={(e) => setSiteData({...siteData, instagram: e.target.value})}
                        className="h-11 bg-gray-50 border-gray-200 rounded-xl px-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-500 font-medium flex items-center gap-2">
                        <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube
                      </Label>
                      <Input 
                        value={siteData.youtube}
                        onChange={(e) => setSiteData({...siteData, youtube: e.target.value})}
                        className="h-11 bg-gray-50 border-gray-200 rounded-xl px-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Factory & Features Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Factory */}
              <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 pb-4 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Factory className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">Factory Information</CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">Assembly hub details</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Factory Name</Label>
                    <Input 
                      value={siteData.factoryName}
                      onChange={(e) => setSiteData({...siteData, factoryName: e.target.value})}
                      className="h-11 bg-gray-50 border-gray-200 rounded-xl px-4 focus:bg-white focus:border-deep-sky-blue transition-all"
                      placeholder="Modjo Factory"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Description</Label>
                    <Textarea 
                      value={siteData.factoryDesc}
                      onChange={(e) => setSiteData({...siteData, factoryDesc: e.target.value})}
                      className="bg-gray-50 border-gray-200 rounded-xl px-4 py-3 focus:bg-white focus:border-deep-sky-blue transition-all min-h-[80px] resize-none"
                      placeholder="Our main assembly hub..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Feature Controls */}
              <Card className="border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 pb-4 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">Feature Controls</CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">Toggle platform features</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-gray-900">Agent Registration</p>
                      <p className="text-[11px] text-gray-500">Enable public /become-agent form</p>
                    </div>
                    <Switch 
                      checked={siteData.isAgentRegistrationEnabled === 'true'} 
                      onCheckedChange={(checked) => setSiteData({...siteData, isAgentRegistrationEnabled: String(checked)})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-gray-900">Agent Portal</p>
                      <p className="text-[11px] text-gray-500">Enable agent dashboard access</p>
                    </div>
                    <Switch 
                      checked={siteData.isAgentPortalEnabled === 'true'} 
                      onCheckedChange={(checked) => setSiteData({...siteData, isAgentPortalEnabled: String(checked)})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold h-12 px-8 rounded-xl shadow-lg flex items-center gap-2 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
        {session?.user?.role === 'ADMIN' && (
          <>
            <TabsContent value="languages" className="space-y-6 outline-none">
              <LanguageManager />
            </TabsContent>
            <TabsContent value="translations" className="space-y-6 outline-none">
              <TranslationManager />
            </TabsContent>
            <TabsContent value="sms" className="space-y-10 outline-none">
              {/* API Key Section */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-bold text-gray-900">SMS API Key</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    Your SMSEthiopia.et API key is configured in the server environment variable{' '}
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded font-mono">SMS_ETHIOPIA_API_KEY</code>.
                    Updating it here saves it to the settings store for reference only — restart the server to apply new env values.
                  </p>
                  <div className="mt-6 p-4 bg-amber-500/[0.03] rounded-xl border border-amber-500/10 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                      Never share your API key. Set it as an environment variable for maximum security.
                    </p>
                  </div>
                </div>
                <Card className="md:col-span-2 border-gray-200 shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-gray-50 pb-6 px-8 pt-8">
                    <CardTitle className="text-lg font-bold">SMSEthiopia.et Configuration</CardTitle>
                    <CardDescription>Base URL: https://smsethiopia.et/api/sms/send</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">API Key</Label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={smsApiKey}
                          onChange={(e) => setSmsApiKey(e.target.value)}
                          placeholder="Enter your SMSEthiopia API key..."
                          className="w-full h-11 bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-12 focus:bg-white focus:border-deep-sky-blue outline-none transition-all text-sm font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 pl-1">This is stored in settings for reference. The active key is read from your environment.</p>
                    </div>
                    <div className="pt-2 flex justify-end">
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
                              toast({ title: 'API Key saved', description: 'Key stored in settings. Update your .env for the active server key.' });
                            } else throw new Error();
                          } catch {
                            toast({ title: 'Error', description: 'Failed to save key.', variant: 'destructive' });
                          } finally { setSmsSaving(false); }
                        }}
                        disabled={!smsApiKey || smsSaving}
                        className="bg-gray-900 hover:bg-black text-white font-bold h-11 px-8 rounded-lg"
                      >
                        {smsSaving ? 'Saving...' : 'Save Key'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Test SMS Section */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-bold text-gray-900">Test SMS</h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    Send a test message to verify your API key and SMS delivery are working correctly.
                  </p>
                </div>
                <Card className="md:col-span-2 border-gray-200 shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-gray-50 pb-6 px-8 pt-8">
                    <CardTitle className="text-lg font-bold">Send Test Message</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          value={smsTestPhone}
                          onChange={(e) => setSmsTestPhone(e.target.value)}
                          placeholder="251911234567"
                          className="w-full h-11 bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 focus:bg-white focus:border-deep-sky-blue outline-none transition-all text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-400 pl-1">Format: 251XXXXXXXXX (include country code, no +)</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Message</Label>
                        <span className={`text-xs font-bold tabular-nums ${smsTestMsg.length > 150 ? 'text-red-500' : 'text-gray-400'}`}>
                          {smsTestMsg.length}/160
                        </span>
                      </div>
                      <textarea
                        value={smsTestMsg}
                        onChange={(e) => setSmsTestMsg(e.target.value.slice(0, 160))}
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:bg-white focus:border-deep-sky-blue outline-none transition-all text-sm resize-none"
                      />
                    </div>
                    <div className="pt-2 flex justify-end">
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
                              toast({ title: '✅ Test SMS sent!', description: `Delivered to ${smsTestPhone}` });
                            } else {
                              toast({ title: 'Delivery failed', description: data.results?.[0]?.error || 'Unknown error', variant: 'destructive' });
                            }
                          } catch (e: any) {
                            toast({ title: 'Error', description: e.message, variant: 'destructive' });
                          } finally { setSmsTesting(false); }
                        }}
                        disabled={!smsTestPhone || !smsTestMsg || smsTesting}
                        className="bg-deep-sky-blue hover:bg-blue-600 text-white font-bold h-11 px-8 rounded-lg flex items-center gap-2"
                      >
                        {smsTesting ? (
                          <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Sending...</>
                        ) : (
                          <><Send className="w-4 h-4" />Send Test</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
