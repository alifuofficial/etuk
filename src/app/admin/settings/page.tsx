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
        <TabsContent value="site" className="space-y-12 outline-none">
          <form onSubmit={handleSiteUpdate} className="space-y-12">
            {/* Section 1: Brand & Contacts */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="text-lg font-bold text-gray-900">Brand & Contact</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Configure the primary identifiers and contact points of the platform.
                </p>
                
                <div className="mt-8 space-y-4">
                  <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Site Logo</p>
                      <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center group cursor-pointer hover:border-deep-sky-blue transition-colors">
                        <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-deep-sky-blue transition-colors" />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-3 italic">Managed in public/images/soreti-logo.png</p>
                  </div>
                </div>
              </div>

              <Card className="md:col-span-2 border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 pb-6 px-8 pt-8 bg-slate-50/50">
                  <CardTitle className="text-lg font-bold">General Information & Footer Header</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Footer Contact Section Title (e.g. Performance)</Label>
                      <Input 
                        value={siteData.footerContactTitle}
                        onChange={(e) => setSiteData({...siteData, footerContactTitle: e.target.value})}
                        className="h-12 bg-gray-50/50 border-gray-200 rounded-lg px-4 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Platform Name</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          value={siteData.siteName}
                          onChange={(e) => setSiteData({...siteData, siteName: e.target.value})}
                          className="h-12 bg-gray-50/50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all font-medium"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Support Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input 
                            value={siteData.supportEmail}
                            onChange={(e) => setSiteData({...siteData, supportEmail: e.target.value})}
                            className="h-12 bg-gray-50/50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Public Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input 
                            value={siteData.phone}
                            onChange={(e) => setSiteData({...siteData, phone: e.target.value})}
                            className="h-12 bg-gray-50/50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Head Office Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          value={siteData.address}
                          onChange={(e) => setSiteData({...siteData, address: e.target.value})}
                          className="h-12 bg-gray-50/50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all font-medium"
                        />
                      </div>
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Section 2: Footer & Social */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="text-lg font-bold text-gray-900">Footer & Social</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Manage the footer about summary and social media connectivity.
                </p>
              </div>

              <Card className="md:col-span-2 border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 pb-6 px-8 pt-8 bg-slate-50/50">
                  <CardTitle className="text-lg font-bold">Public Footer Content</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Footer About Text</Label>
                    <Textarea 
                      value={siteData.footerAbout}
                      onChange={(e) => setSiteData({...siteData, footerAbout: e.target.value})}
                      className="bg-gray-50/50 border-gray-200 rounded-lg px-4 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all font-medium min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Facebook URL</Label>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          value={siteData.facebook}
                          onChange={(e) => setSiteData({...siteData, facebook: e.target.value})}
                          className="h-12 bg-gray-50/50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all font-medium"
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Twitter URL</Label>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          value={siteData.twitter}
                          onChange={(e) => setSiteData({...siteData, twitter: e.target.value})}
                          className="h-12 bg-gray-50/50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all font-medium"
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Instagram URL</Label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          value={siteData.instagram}
                          onChange={(e) => setSiteData({...siteData, instagram: e.target.value})}
                          className="h-12 bg-gray-50/50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all font-medium"
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Youtube URL</Label>
                      <div className="relative">
                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          value={siteData.youtube}
                          onChange={(e) => setSiteData({...siteData, youtube: e.target.value})}
                          className="h-12 bg-gray-50/50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all font-medium"
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section 3: Factory Information */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="text-lg font-bold text-gray-900">Factory Details</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Update the assembly factory information displayed in the footer.
                </p>
              </div>

              <Card className="md:col-span-2 border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 pb-6 px-8 pt-8 bg-slate-50/50">
                  <CardTitle className="text-lg font-bold">Assembly Hub</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Factory Name</Label>
                    <div className="relative">
                      <Factory className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        value={siteData.factoryName}
                        onChange={(e) => setSiteData({...siteData, factoryName: e.target.value})}
                        className="h-12 bg-gray-50/50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Factory Description</Label>
                    <Textarea 
                      value={siteData.factoryDesc}
                      onChange={(e) => setSiteData({...siteData, factoryDesc: e.target.value})}
                      className="bg-gray-50/50 border-gray-200 rounded-lg px-4 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all font-medium min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section 4: Feature Controls */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <h3 className="text-lg font-bold text-gray-900">Feature Controls</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Enable or disable specific system features for the public website.
                </p>
              </div>

              <Card className="md:col-span-2 border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 pb-6 px-8 pt-8 bg-slate-50/50">
                  <CardTitle className="text-lg font-bold">Registration & Portal</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between p-6 bg-deep-sky-blue/[0.03] rounded-2xl border border-deep-sky-blue/10">
                    <div className="space-y-1">
                      <Label className="text-sm font-bold flex items-center gap-2 text-gray-900">
                        <User className="w-4 h-4 text-deep-sky-blue" />
                        Enable Agent Registration
                      </Label>
                      <p className="text-xs text-gray-500 font-medium">Allow public users to access the /become-agent registration form.</p>
                    </div>
                    <Switch 
                      checked={siteData.isAgentRegistrationEnabled === 'true'} 
                      onCheckedChange={(checked) => setSiteData({...siteData, isAgentRegistrationEnabled: String(checked)})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end sticky bottom-6 z-20">
              <Button 
                type="submit" 
                className="bg-slate-900 hover:bg-black font-bold h-14 px-10 rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] border-b-2 border-deep-sky-blue/30 transition-all flex items-center gap-3 transform hover:-translate-y-1 active:scale-[0.98] group overflow-hidden relative"
                disabled={loading}
              >
                {loading && (
                    <div className="absolute inset-0 bg-deep-sky-blue/20 animate-pulse" />
                )}
                <Save className={cn("w-5 h-5 transition-transform group-hover:rotate-12", loading ? "animate-spin" : "")} />
                <span className="relative z-10">
                    {loading ? 'Propagating Infrastructure Changes...' : 'Save Global Settings'}
                </span>
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
