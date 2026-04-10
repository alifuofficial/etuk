'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Loader2, ArrowLeft, KeyRound, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Step = 'login' | 'forgot' | 'verify' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';
  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2,
        alpha: Math.random() * 0.3
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 191, 255, ${p.alpha})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please contact administration if you need access.');
      } else {
        router.push(redirectUrl);
      }
    } catch {
      setError('A system error occurred. Secure connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setSuccess('OTP sent to your phone number.');
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      setSuccess('OTP verified successfully.');
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('Password reset successfully! You can now login.');
      setTimeout(() => {
        setStep('login');
        setPhone('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-3"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          {error}
        </motion.div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Access ID</Label>
        <div className="relative group">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Secure Token</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all"
        />
      </div>
      
      <Button
        type="submit"
        className="w-full h-16 bg-slate-900 hover:bg-deep-sky-blue text-white font-black text-lg rounded-2xl shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AUTHENTICATING</span>
          </div>
        ) : (
          'SIGN IN'
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setError('');
            setSuccess('');
            setStep('forgot');
          }}
          className="text-deep-sky-blue hover:text-slate-900 font-bold text-sm transition-colors"
        >
          Forgot Password?
        </button>
      </div>
    </form>
  );

  const renderForgotForm = () => (
    <form onSubmit={handleForgotPassword} className="space-y-6">
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-3"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-100 text-green-600 p-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-3"
        >
          <ShieldCheck className="w-4 h-4" />
          {success}
        </motion.div>
      )}
      
      <div className="text-center mb-6">
        <KeyRound className="w-12 h-12 text-deep-sky-blue mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Enter your registered phone number to receive a verification code.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+251 9XX XXX XXX"
          required
          className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all"
        />
      </div>
      
      <Button
        type="submit"
        className="w-full h-16 bg-deep-sky-blue hover:bg-slate-900 text-white font-black text-lg rounded-2xl shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>SENDING OTP</span>
          </div>
        ) : (
          'SEND VERIFICATION CODE'
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setError('');
            setSuccess('');
            setStep('login');
          }}
          className="text-slate-400 hover:text-deep-sky-blue font-bold text-sm transition-colors"
        >
          Back to Login
        </button>
      </div>
    </form>
  );

  const renderVerifyForm = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-3"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-100 text-green-600 p-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-3"
        >
          <ShieldCheck className="w-4 h-4" />
          {success}
        </motion.div>
      )}
      
      <div className="text-center mb-6">
        <KeyRound className="w-12 h-12 text-deep-sky-blue mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Enter the 6-digit code sent to {phone}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="otp" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Verification Code</Label>
        <Input
          id="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          required
          maxLength={6}
          className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 text-center text-2xl tracking-[0.5em] focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all"
        />
      </div>
      
      <Button
        type="submit"
        className="w-full h-16 bg-deep-sky-blue hover:bg-slate-900 text-white font-black text-lg rounded-2xl shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
        disabled={loading || otp.length !== 6}
      >
        {loading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>VERIFYING</span>
          </div>
        ) : (
          'VERIFY CODE'
        )}
      </Button>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={() => {
            setError('');
            setSuccess('');
            setStep('forgot');
          }}
          className="text-deep-sky-blue hover:text-slate-900 font-bold text-sm transition-colors block"
        >
          Resend Code
        </button>
        <button
          type="button"
          onClick={() => {
            setError('');
            setSuccess('');
            setStep('login');
          }}
          className="text-slate-400 hover:text-deep-sky-blue font-bold text-sm transition-colors block"
        >
          Back to Login
        </button>
      </div>
    </form>
  );

  const renderResetForm = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-3"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-100 text-green-600 p-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-3"
        >
          <ShieldCheck className="w-4 h-4" />
          {success}
        </motion.div>
      )}
      
      <div className="text-center mb-6">
        <Lock className="w-12 h-12 text-deep-sky-blue mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Create a new password for your account</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={8}
          className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:bg-white focus:border-deep-sky-blue focus:ring-4 focus:ring-deep-sky-blue/5 transition-all"
        />
      </div>
      
      <Button
        type="submit"
        className="w-full h-16 bg-deep-sky-blue hover:bg-slate-900 text-white font-black text-lg rounded-2xl shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>RESETTING</span>
          </div>
        ) : (
          'RESET PASSWORD'
        )}
      </Button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden font-sans">
      {/* Dynamic Background Effect */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      
      {/* Background Decorative Typography */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden z-0">
        <h2 className="text-[25vw] font-black text-slate-100/50 leading-none tracking-tighter uppercase italic">
          SORETI
        </h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-white/80 backdrop-blur-2xl border-white/20 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.1)] rounded-[40px] overflow-hidden border">
          <CardHeader className="pt-12 pb-8 text-center relative">
            <div className="flex justify-center mb-8">
              <Link href="/">
                <div className="group transition-all hover:scale-105 active:scale-95">
                  <img 
                    src="/images/soreti-logo.png" 
                    alt="Soreti Logo" 
                    className="h-24 w-auto object-contain drop-shadow-2xl"
                  />
                </div>
              </Link>
            </div>
            <CardTitle className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Soreti <span className="text-gray-400">Port</span>
            </CardTitle>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">
              {step === 'login' && 'Authorized Personnel Only'}
              {step === 'forgot' && 'Password Recovery'}
              {step === 'verify' && 'Verify Identity'}
              {step === 'reset' && 'Create New Password'}
            </p>
          </CardHeader>

          <CardContent className="px-10 pb-12">
            {step === 'login' && renderLoginForm()}
            {step === 'forgot' && renderForgotForm()}
            {step === 'verify' && renderVerifyForm()}
            {step === 'reset' && renderResetForm()}

            <div className="mt-10 flex flex-col items-center gap-6">
              <Link href="/" className="group flex items-center gap-2 text-slate-400 hover:text-deep-sky-blue font-black text-[10px] tracking-[0.3em] transition-colors">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                RETURN TO SHOWROOM
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}