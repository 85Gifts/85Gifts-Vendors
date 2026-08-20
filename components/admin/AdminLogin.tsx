'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ShieldCheck, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast({
        title: 'Login successful',
        description: 'Welcome back! Redirecting to the admin console...',
        variant: 'success',
      });
      router.push('/admin');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid credentials';
      setError(message);
      toast({ title: 'Login failed', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Console</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Sign In</h1>
          <p className="text-muted-foreground">
            Restricted access — authorised administrators only
          </p>
        </div>

        <Card className="rounded-2xl shadow-xl border-border">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    id="admin-email"
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

              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    id="admin-password"
                    name="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="pl-10 shadow-none focus-visible:ring-0 focus-visible:border-primary"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

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
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

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
  );
}