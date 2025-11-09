'use client'
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CircleUserRound, Building2, MapPinHouse, Mail, Lock, Eye, EyeOff, Gift, ArrowRight, Home, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import Link from 'next/link';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loginFormData, setLoginFormData] = useState({
    email: '',
    password: '',
  });
  const [signupFormData, setSignupFormData] = useState({
    name: '',
    businessName: '',
    address: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [forgotFormData, setForgotFormData] = useState({
    email: '',
  });
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { login, register, resetPassword } = useVendorAuth();

  const forms = ['login', 'signup', 'forgot'] as const;

  // Handlers for Login Form
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFormData({
      ...loginFormData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(loginFormData.email, loginFormData.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Signup Form
  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupFormData({
      ...signupFormData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (signupFormData.password !== signupFormData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (!signupFormData.name.trim()) {
        setError('Please enter your full name');
        setLoading(false);
        return;
      }

      if (!signupFormData.businessName.trim()) {
        setError('Please enter your business name');
        setLoading(false);
        return;
      }

      await register({
        name: signupFormData.name,
        email: signupFormData.email,
        password: signupFormData.password,
        phone: signupFormData.phone,
        businessName: signupFormData.businessName,
        address: signupFormData.address,
      });

      setSuccess('Registration successful! Please check your email to verify your account.');
      setSignupFormData({
        name: '',
        businessName: '',
        address: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
      setTimeout(() => {
        setActiveTab('login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Forgot Password Form
  const handleForgotInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForgotFormData({
      ...forgotFormData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resetPassword(forgotFormData.email);
      setSuccess('Password reset link sent! Please check your email.');
      setForgotFormData({ email: '' });
      setTimeout(() => {
        setActiveTab('login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

 // Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (loading) return;
    setTouchStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwiping || touchStartX === null || loading) return;
    // Prevent default scrolling behavior
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwiping || touchStartX === null || loading) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const swipeThreshold = 50; // Minimum swipe distance in pixels

    if (deltaX > swipeThreshold) {
      // Swipe right: go to previous form
      const currentIndex = forms.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(forms[currentIndex - 1]);
      }
    } else if (deltaX < -swipeThreshold) {
      // Swipe left: go to next form
      const currentIndex = forms.indexOf(activeTab);
      if (currentIndex < forms.length - 1) {
        setActiveTab(forms[currentIndex + 1]);
      }
    }

    setTouchStartX(null);
    setIsSwiping(false);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-50"></div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-200 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 bg-blue-200 rounded-full opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-8 w-16 h-16 bg-green-200 rounded-full opacity-35 animate-bounce delay-2000"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-72 h-72 bg-white rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl mb-8">
              <div className="text-8xl animate-bounce">🎁</div>
              <div className="absolute top-4 left-8 text-3xl animate-pulse opacity-70">🎈</div>
              <div className="absolute top-12 right-6 text-2xl animate-bounce delay-300 opacity-80">⭐</div>
              <div className="absolute bottom-8 left-6 text-2xl animate-pulse delay-500 opacity-70">🎉</div>
              <div className="absolute bottom-4 right-8 text-3xl animate-bounce delay-700 opacity-80">💝</div>
              <div className="absolute inset-4 border-2 border-blue-200 rounded-full opacity-40"></div>
              <div className="absolute inset-8 border-2 border-red-200 rounded-full opacity-50"></div>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent mb-4">
              Welcome to 85Gifts
            </h2>
            <p className="text-lg text-gray-600 max-w-sm">
              {activeTab === 'login'
                ? 'Sign in to manage your products and reach more customers.'
                : activeTab === 'signup'
                ? 'Discover the perfect customers and grow your business.'
                : 'Reset your password to regain access to your account.'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side / Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              <span>
                {activeTab === 'login' ? 'Welcome Back!' : activeTab === 'signup' ? 'Join Our Community' : 'Reset Your Password'}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {activeTab === 'login' ? 'Sign In' : activeTab === 'signup' ? 'Create Account' : 'Reset Password'}
            </h1>
            <p className="text-gray-600">
              {activeTab === 'login'
                ? 'Sign in to access your vendor dashboard'
                : activeTab === 'signup'
                ? 'Start your journey as a vendor'
                : 'Enter your email to reset your password'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Tabs */}
            <div className="lg:flex justify-center mb-6 space-x-4 hidden">
              <Button
                variant={activeTab === 'login' ? 'default' : 'outline'}
                onClick={() => setActiveTab('login')}
                className="px-4 py-2"
                disabled={loading}
              >
                Sign In
              </Button>
              <Button
                variant={activeTab === 'signup' ? 'default' : 'outline'}
                onClick={() => setActiveTab('signup')}
                className="px-4 py-2"
                disabled={loading}
              >
                Sign Up
              </Button>
              <Button
                variant={activeTab === 'forgot' ? 'default' : 'outline'}
                onClick={() => setActiveTab('forgot')}
                className="px-4 py-2"
                disabled={loading}
              >
                Forgot Password
              </Button>
            </div>

            {/* Mobile Swipe Indicator */}
            <div className="flex justify-center mb-4 lg:hidden">
              {forms.map((form) => (
                <div
                  key={form}
                  className={`h-2 w-2 rounded-full mx-1 ${
                    activeTab === form ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Form Container with Swipe Support */}
            <div
              ref={formContainerRef}
              className="relative overflow-x-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${forms.indexOf(activeTab) * 100}%)` }}
              >
                {/* Login Form */}
                <div className="min-w-full">
                  {activeTab === 'login' && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={loginFormData.email}
                            onChange={handleLoginInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={loginFormData.password}
                            onChange={handleLoginInputChange}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveTab('forgot')}
                          className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          disabled={loading}
                        >
                          Forgot password?
                        </button>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                  )}
                </div>

                {/* Signup Form */}
                <div className="min-w-full">
                  {activeTab === 'signup' && (
                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Full Name *
                        </label>
                        <div className="relative">
                          <CircleUserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={signupFormData.name}
                            onChange={handleSignupInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your name"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="businessName" className="text-sm font-medium text-gray-700">
                          Business Name *
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            id="businessName"
                            name="businessName"
                            value={signupFormData.businessName}
                            onChange={handleSignupInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your business name"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="address" className="text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <div className="relative">
                          <MapPinHouse className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            id="address"
                            name="address"
                            value={signupFormData.address}
                            onChange={handleSignupInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your address"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={signupFormData.phone}
                            onChange={handleSignupInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your phone number"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={signupFormData.email}
                            onChange={handleSignupInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={signupFormData.password}
                            onChange={handleSignupInputChange}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            disabled={loading}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={signupFormData.confirmPassword}
                            onChange={handleSignupInputChange}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Confirm your password"
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            disabled={loading}
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating account...
                          </span>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>

                {/* Forgot Password Form */}
                <div className="min-w-full">
                  {activeTab === 'forgot' && (
                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={forgotFormData.email}
                            onChange={handleForgotInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending reset link...
                          </span>
                        ) : (
                          <>
                            Send Reset Link
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Social Login Buttons (for login and signup) */}
            {(activeTab === 'login' || activeTab === 'signup') && (
              <>
                <div className="my-6 flex items-center">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <div className="px-4 text-sm text-gray-500">or</div>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg transition-all duration-200"
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {activeTab === 'login' ? 'Continue with Google' : 'Sign up with Google'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg transition-all duration-200"
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" fill="#1877f2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    {activeTab === 'login' ? 'Continue with Facebook' : 'Sign up with Facebook'}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Navigation Links */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {activeTab === 'login' ? (
                <>
                  Don&apos;t have an account?
                  <button
                    onClick={() => setActiveTab('signup')}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                    disabled={loading}
                  >
                    Sign up
                  </button>
                </>
              ) : activeTab === 'signup' ? (
                <>
                  Already have an account?
                  <button
                    onClick={() => setActiveTab('login')}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                    disabled={loading}
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Remembered your password?
                  <button
                    onClick={() => setActiveTab('login')}
                    className="ml-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                    disabled={loading}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          <div className="text-center mt-4">
            <Link 
              href="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <Home className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed top-4 right-4 text-4xl animate-bounce opacity-20">🎁</div>
      <div className="lg:hidden fixed bottom-4 left-4 text-3xl animate-pulse opacity-20 delay-1000">💝</div>
    </div>
  );
}
