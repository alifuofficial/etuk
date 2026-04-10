'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, Lock, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';

export default function AgentSettingsPage() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/agent/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Password changed successfully',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to change password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">Manage your account preferences</p>
      </div>

      {/* Account Info */}
      <Card className="border-gray-200 shadow-sm rounded-xl">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-lg font-bold">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">
                {session?.user?.name?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{session?.user?.name}</p>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
              <p className="text-xs text-green-600 font-medium mt-1">Agent Account</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-gray-200 shadow-sm rounded-xl">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-600" />
            <CardTitle className="text-lg font-bold">Change Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-11 bg-white border-gray-200 rounded-xl pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">New Password</Label>
              <div className="relative">
                <Input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 bg-white border-gray-200 rounded-xl pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase">Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 bg-white border-gray-200 rounded-xl pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl text-sm text-gray-600">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <p>Password must be at least 6 characters long</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-6 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}