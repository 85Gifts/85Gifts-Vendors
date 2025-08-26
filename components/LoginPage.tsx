'use client'
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, Eye, EyeOff, Gift, ArrowRight, Home } from 'lucide-react';


export default function AuthPage(){
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (

    <div className="min-h-screen w-full flex bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50">
    {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-50"></div>
          <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-200 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 bg-blue-200 rounded-full opacity-40 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-8 w-16 h-16 bg-green-200 rounded-full opacity-35 animate-bounce delay-2000"></div>
          
          {/* Main illustration */}
          <div className="relative z-10 text-center">
            <div className="w-72 h-72 bg-white rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl mb-8">
              {/* Animated gift boxes */}
              <div className="text-8xl animate-bounce">🎁</div>
              
              {/* Floating elements */}
              <div className="absolute top-4 left-8 text-3xl animate-pulse opacity-70">🎈</div>
              <div className="absolute top-12 right-6 text-2xl animate-bounce delay-300 opacity-80">⭐</div>
              <div className="absolute bottom-8 left-6 text-2xl animate-pulse delay-500 opacity-70">🎉</div>
              <div className="absolute bottom-4 right-8 text-3xl animate-bounce delay-700 opacity-80">💝</div>
              
              {/* Decorative rings */}
              <div className="absolute inset-4 border-2 border-blue-200 rounded-full opacity-40"></div>
              <div className="absolute inset-8 border-2 border-red-200 rounded-full opacity-50"></div>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent mb-4">
              Welcome to 85Gifts
            </h2>
            <p className="text-lg text-gray-600 max-w-sm">
              Discover the perfect gifts for every occasion and create magical moments for your loved ones.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              <span>{isLogin ? 'Welcome Back!' : 'Join Our Community'}</span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-gray-600">
              {isLogin 
                ? 'Sign in to access your wishlist and orders' 
                : 'Start your journey to find perfect gifts'
              }
            </p>
          </div>

          {/* Auth Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="space-y-6">
              {/* Name field (only for signup) */}
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
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
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
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
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field (only for signup) */}
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Confirm your password"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Forgot Password (only for login) */}
              {isLogin && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="px-4 text-sm text-gray-500">or</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="#1877f2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </Button>
            </div>
          </div>

          {/* Toggle Auth Mode */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={toggleAuthMode}
                className="ml-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-4">
            <button className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
              <Home className="w-4 h-4 mr-1" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Gift Animation */}
      <div className="lg:hidden fixed top-4 right-4 text-4xl animate-bounce opacity-20">
        🎁
      </div>
      <div className="lg:hidden fixed bottom-4 left-4 text-3xl animate-pulse opacity-20 delay-1000">
        💝
      </div>
    </div>
  );
};

