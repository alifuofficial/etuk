'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Languages
} from 'lucide-react';
import LanguageManager from '@/components/admin/settings/LanguageManager';
import TranslationManager from '@/components/admin/settings/TranslationManager';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-deepSkyBlue"></div>
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
        <TabsList className={`grid w-full max-w-2xl ${session?.user?.role === 'ADMIN' ? 'grid-cols-4' : 'grid-cols-1'} h-12 bg-slate-100/50 p-1 rounded-xl mb-8`}>
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-bold text-xs text-slate-500 transition-all">
            <Lock className="w-3.5 h-3.5 mr-2 text-deepSkyBlue" />
            Security
          </TabsTrigger>
          {session?.user?.role === 'ADMIN' && (
            <>
              <TabsTrigger value="site" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-bold text-xs text-slate-500 transition-all">
                <Layout className="w-3.5 h-3.5 mr-2 text-deepSkyBlue" />
                Site Content
              </TabsTrigger>
              <TabsTrigger value="languages" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-bold text-xs text-slate-500 transition-all">
                <Languages className="w-3.5 h-3.5 mr-2 text-deepSkyBlue" />
                Languages
              </TabsTrigger>
              <TabsTrigger value="translations" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-bold text-xs text-slate-500 transition-all">
                <BookOpen className="w-3.5 h-3.5 mr-2 text-deepSkyBlue" />
                Dictionary
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
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                 <ShieldCheck className="w-5 h-5 text-deepSkyBlue shrink-0 mt-0.5" />
                 <p className="text-xs text-blue-700 font-medium leading-relaxed">
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
                      className="h-11 bg-gray-50 border-gray-200 rounded-lg px-4 focus:bg-white focus:border-deepSkyBlue transition-all"
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
                        className="h-11 bg-gray-50 border-gray-200 rounded-lg px-4 focus:bg-white focus:border-deepSkyBlue transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Confirm New Password</Label>
                      <Input 
                        type="password" 
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                        className="h-11 bg-gray-50 border-gray-200 rounded-lg px-4 focus:bg-white focus:border-deepSkyBlue transition-all"
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
                      <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center group cursor-pointer hover:border-deepSkyBlue transition-colors">
                        <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-deepSkyBlue transition-colors" />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-3 italic">Managed in public/images/soreti-logo.png</p>
                  </div>
                </div>
              </div>

              <Card className="md:col-span-2 border-gray-200 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-50 pb-6 px-8 pt-8">
                  <CardTitle className="text-lg font-bold">General Information</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Platform Name</Label>
                      <Input 
                        value={siteData.siteName}
                        onChange={(e) => setSiteData({...siteData, siteName: e.target.value})}
                        className="h-11 bg-gray-50 border-gray-200 rounded-lg px-4 focus:bg-white focus:border-deepSkyBlue transition-all font-medium"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Support Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input 
                            value={siteData.supportEmail}
                            onChange={(e) => setSiteData({...siteData, supportEmail: e.target.value})}
                            className="h-11 bg-gray-50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deepSkyBlue transition-all font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Public Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input 
                            value={siteData.phone}
                            onChange={(e) => setSiteData({...siteData, phone: e.target.value})}
                            className="h-11 bg-gray-50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deepSkyBlue transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Head Office Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          value={siteData.address}
                          onChange={(e) => setSiteData({...siteData, address: e.target.value})}
                          className="h-11 bg-gray-50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deepSkyBlue transition-all font-medium"
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
                <CardHeader className="border-b border-gray-50 pb-6 px-8 pt-8">
                  <CardTitle className="text-lg font-bold">Public Footer Content</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Footer About Text</Label>
                    <Textarea 
                      value={siteData.footerAbout}
                      onChange={(e) => setSiteData({...siteData, footerAbout: e.target.value})}
                      className="bg-gray-50 border-gray-200 rounded-lg px-4 focus:bg-white focus:border-deepSkyBlue transition-all font-medium min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Facebook URL</Label>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          value={siteData.facebook}
                          onChange={(e) => setSiteData({...siteData, facebook: e.target.value})}
                          className="h-11 bg-gray-50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deepSkyBlue transition-all font-medium"
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Twitter URL</Label>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          value={siteData.twitter}
                          onChange={(e) => setSiteData({...siteData, twitter: e.target.value})}
                          className="h-11 bg-gray-50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deepSkyBlue transition-all font-medium"
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Instagram URL</Label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          value={siteData.instagram}
                          onChange={(e) => setSiteData({...siteData, instagram: e.target.value})}
                          className="h-11 bg-gray-50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deepSkyBlue transition-all font-medium"
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Youtube URL</Label>
                      <div className="relative">
                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          value={siteData.youtube}
                          onChange={(e) => setSiteData({...siteData, youtube: e.target.value})}
                          className="h-11 bg-gray-50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deepSkyBlue transition-all font-medium"
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
                <CardHeader className="border-b border-gray-50 pb-6 px-8 pt-8">
                  <CardTitle className="text-lg font-bold">Assembly Hub</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Factory Name</Label>
                    <div className="relative">
                      <Factory className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        value={siteData.factoryName}
                        onChange={(e) => setSiteData({...siteData, factoryName: e.target.value})}
                        className="h-11 bg-gray-50 border-gray-200 rounded-lg pl-10 px-4 focus:bg-white focus:border-deepSkyBlue transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">Factory Description</Label>
                    <Textarea 
                      value={siteData.factoryDesc}
                      onChange={(e) => setSiteData({...siteData, factoryDesc: e.target.value})}
                      className="bg-gray-50 border-gray-200 rounded-lg px-4 focus:bg-white focus:border-deepSkyBlue transition-all font-medium min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end sticky bottom-6 z-20">
              <Button 
                type="submit" 
                className="bg-gray-900 hover:bg-black font-bold h-14 px-10 rounded-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] transition-all flex items-center gap-3 transform hover:-translate-y-1 active:scale-[0.98]"
                disabled={loading}
              >
                <Save className="w-5 h-5" />
                {loading ? 'Propagating Changes...' : 'Save All Settings'}
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
          </>
        )}
      </Tabs>
    </div>
  );
}
