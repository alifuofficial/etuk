'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        router.push('/admin');
      }
    } catch {
      setError('A system error occurred. Secure connection failed.');
    } finally {
      setLoading(false);
    }
  };

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
            <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">Authorized Personnel Only</p>
          </CardHeader>

          <CardContent className="px-10 pb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
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
            </form>

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
