'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Gift,
  Home,
  Lock,
  ArrowRight,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useResellerAuth } from '@/contexts/ResellerAuthContext';
import ResellerHero from '@/components/reseller/ResellerHero';
import Link from 'next/link';

export default function ResellerLogin() {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const { requestCode, verifyCode, isAuthenticated, loading: authLoading } =
    useResellerAuth();
  const { toast } = useToast();
  const router = useRouter();
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/reseller-dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (step === 'otp' && codeRef.current) {
      codeRef.current.focus();
    }
  }, [step]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setInfo('');
    setLoading(true);
    try {
      await requestCode(email.trim());
      setStep('otp');
      setInfo(
        'If your email is registered as an active reseller, a 6-digit login code has been sent. Check your inbox.'
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      toast({ title: 'Request failed', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await requestCode(email.trim());
      setInfo('A new 6-digit code has been sent. Check your inbox.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your email');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await verifyCode(email.trim(), code);
      toast({
        title: 'Login successful',
        description: 'Welcome back! Redirecting to your dashboard...',
        variant: 'success',
      });
      router.push('/reseller-dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid or expired code';
      setError(message);
      toast({ title: 'Login failed', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      <div className="w-full lg:w-3/5 h-72 lg:h-auto relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <ResellerHero className="w-full h-auto max-w-[320px] sm:max-w-[440px] lg:max-w-[560px] xl:max-w-[760px] 2xl:max-w-[900px]" />
        </div>
      </div>

      <div className="w-full lg:w-2/5 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              <span>Reseller Portal</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {step === 'email' ? 'Sign In' : 'Enter Your Code'}
            </h1>
            <p className="text-muted-foreground">
              {step === 'email'
                ? 'Passwordless login, we will email you a one-time code'
                : `A 6-digit code was sent to ${email}`}
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            {step === 'email' ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reseller-email" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      id="reseller-email"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      className="pl-10 shadow-none focus-visible:ring-0 focus-visible:border-primary"
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                {info && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">{info}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending code...
                    </span>
                  ) : (
                    <>
                      Send Code
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reseller-code" className="text-sm font-medium text-foreground">
                    Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      ref={codeRef}
                      type="text"
                      inputMode="numeric"
                      id="reseller-code"
                      name="code"
                      value={code}
                      onChange={handleCodeChange}
                      className="pl-10 pr-10 font-mono tracking-[0.5em] text-center shadow-none focus-visible:ring-0 focus-visible:border-primary"
                      placeholder="······"
                      maxLength={6}
                      autoComplete="one-time-code"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The code expires in 15 minutes and can only be used once.
                  </p>
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                {info && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">{info}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    <>
                      Verify & Sign In
                      <Lock className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setError('');
                      setInfo('');
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-primary hover:brightness-125 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resend code
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <Home className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
