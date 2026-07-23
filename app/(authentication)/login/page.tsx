"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CircleUserRound,
  Building2,
  MapPinHouse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Gift,
  ArrowRight,
  Home,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

import LoginArt from "@/components/LoginArt";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">(
    "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });
  const { toast } = useToast();
  const router = useRouter();
  const [signupFormData, setSignupFormData] = useState({
    name: "",
    businessName: "",
    address: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [forgotFormData, setForgotFormData] = useState({
    email: "",
  });
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const { login, register, forgotPassword, isAuthenticated, loading: authLoading } = useVendorAuth();
  const forms = ["login", "signup", "forgot"] as const;

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const [, setErrors] = useState<{
    name?: string;
    email?: string;
    businessName?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
    address?: string;
  }>({});
  const [, setValid] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers for Login Form
  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFormData({
      ...loginFormData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = true;
    const validationErrors: {
      email?: string;
      password?: string;
    } = {};

    if (!loginFormData.email.trim()) {
      isValid = false;
      validationErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(loginFormData.email)) {
      isValid = false;
      validationErrors.email = "Invalid email format";
    }

    if (!loginFormData.password.trim()) {
      isValid = false;
      validationErrors.password = "Password required";
    } else if (loginFormData.password.length < 6) {
      isValid = false;
      validationErrors.password = "Password must be at least 6 characters long";
    }

    setError("");
    setLoading(true);

    if (isValid) {
      try {
        await login(loginFormData.email, loginFormData.password);
        toast({
          title: "Login successful",
          description: "Welcome back! Redirecting to dashboard...",
        });
        router.push("/dashboard");
      } catch (err) {
        console.log("Login failed", err);
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handlers for Signup Form
  const handleSignupInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupFormData({
      ...signupFormData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let isValid = true;
    const validationErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      businessName?: string;
      phone?: string;
      address?: string;
    } = {};

    if (!signupFormData.name.trim()) {
      isValid = false;
      validationErrors.name = "First Name is required";
    }

    if (!signupFormData.email.trim()) {
      isValid = false;
      validationErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(signupFormData.email)) {
      isValid = false;
      validationErrors.email = "Invalid email format";
    }

    if (!signupFormData.password.trim()) {
      isValid = false;
      validationErrors.password = "Password required";
    } else if (signupFormData.password.length < 6) {
      isValid = false;
      validationErrors.password = "Password must be at least 6 characters long";
    }

    if (signupFormData.confirmPassword !== signupFormData.password) {
      isValid = false;
      validationErrors.confirmPassword = "Passwords do not match";
    }

    setError("");
    setLoading(true);

    if (isValid) {
      try {
        if (signupFormData.password !== signupFormData.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        if (!signupFormData.name.trim()) {
          setError("Please enter your full name");
          setLoading(false);
          return;
        }

        if (!signupFormData.businessName.trim()) {
          setError("Please enter your business name");
          setLoading(false);
          return;
        }

        const data = await register({
          name: signupFormData.name,
          email: signupFormData.email,
          password: signupFormData.password,
          phone: signupFormData.phone,
          businessName: signupFormData.businessName,
          address: signupFormData.address,
        });

        toast({
          title: "Account created",
          description: "Your vendor account has been created successfully.",
          variant: "success",
        });

        setSuccess(
          "Registration successful! Please check your email to verify your account."
        );
        setSignupFormData({
          name: "",
          businessName: "",
          address: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
        
        router.push(
          `/verifyEmail?email=${encodeURIComponent(
            signupFormData.email
          )}`
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Handlers for Forgot Password Form
  const handleForgotInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForgotFormData({
      ...forgotFormData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await forgotPassword(forgotFormData.email);
      setSuccess("Password reset link sent! Please check your email.");
      toast({
        title: "Reset link sent",
        description: "Password reset link sent! Please check your email.",
        variant: "success",
      });
      setForgotFormData({ email: "" });
      setTimeout(() => {
        setActiveTab("login");
      }, 2000);
      router.push(
        `/reset-password?email=${encodeURIComponent(
          forgotFormData.email
        )}&token=${response.data.resetCode}`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast({
        title: "Password reset failed",
        description: errorMessage,
        variant: "destructive",
      });
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
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isSwiping || touchStartX === null || loading) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const swipeThreshold = 50;

    if (deltaX > swipeThreshold) {
      const currentIndex = forms.indexOf(activeTab);
      if (currentIndex > 0) {
        setActiveTab(forms[currentIndex - 1]);
      }
    } else if (deltaX < -swipeThreshold) {
      const currentIndex = forms.indexOf(activeTab);
      if (currentIndex < forms.length - 1) {
        setActiveTab(forms[currentIndex + 1]);
      }
    }

    setTouchStartX(null);
    setIsSwiping(false);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* SVG Illustration - on top for mobile, left side for desktop */}
      <div className="w-full lg:w-1/2 h-64 lg:h-auto relative overflow-hidden">
        <LoginArt />
      </div>

      {/* Right Side / Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-blue-100/30 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              <span>
                {activeTab === "login"
                  ? "Welcome Back!"
                  : activeTab === "signup"
                  ? "Join Our Community"
                  : "Reset Your Password"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              {activeTab === "login"
                ? "Sign In"
                : activeTab === "signup"
                ? "Create Account"
                : "Reset Password"}
            </h1>
            <p className="text-muted-foreground">
              {activeTab === "login"
                ? "Sign in to access your vendor dashboard"
                : activeTab === "signup"
                ? "Start your journey as a vendor"
                : "Enter your email to reset your password"}
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            {/* Tabs */}
            <div className="lg:flex justify-center mb-6 space-x-4 hidden">
              <Button
                variant={activeTab === "login" ? "default" : "outline"}
                onClick={() => setActiveTab("login")}
                className="px-4 py-2"
                disabled={loading}
              >
                Sign In
              </Button>
              <Button
                variant={activeTab === "signup" ? "default" : "outline"}
                onClick={() => setActiveTab("signup")}
                className="px-4 py-2"
                disabled={loading}
              >
                Sign Up
              </Button>
              <Button
                variant={activeTab === "forgot" ? "default" : "outline"}
                onClick={() => setActiveTab("forgot")}
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
                    activeTab === form ? "bg-blue-500" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div
              ref={formContainerRef}
              className="relative overflow-x-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${forms.indexOf(activeTab) * 100}%)`,
                }}
              >
                {/* Login Form */}
                <div className="min-w-full">
                  {activeTab === "login" && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium text-foreground"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="email"
                            id="email"
                            name="email"
                            value={loginFormData.email}
                            onChange={handleLoginInputChange}
                            className="pl-10 shadow-none focus-visible:ring-0 focus-visible:border-blue-500"
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="password"
                          className="text-sm font-medium text-foreground"
                        >
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={loginFormData.password}
                            onChange={handleLoginInputChange}
                            className="pl-10 pr-12 shadow-none focus-visible:ring-0 focus-visible:border-blue-500"
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            disabled={loading}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveTab("forgot")}
                          className="text-sm text-primary hover:brightness-125 transition-colors"
                          disabled={loading}
                        >
                          Forgot password?
                        </button>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        size="lg"
                        className="w-full bg-blue-500 hover:bg-blue-700"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
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
                  {activeTab === "signup" && (
                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="text-sm font-medium text-foreground"
                        >
                          Full Name *
                        </label>
                        <div className="relative">
                          <CircleUserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="text"
                            id="name"
                            name="name"
                            value={signupFormData.name}
                            onChange={handleSignupInputChange}
                            className="pl-10 shadow-none focus-visible:ring-0 focus-visible:border-blue-500"
                            placeholder="Enter your name"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="businessName"
                          className="text-sm font-medium text-foreground"
                        >
                          Business Name *
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="text"
                            id="businessName"
                            name="businessName"
                            value={signupFormData.businessName}
                            onChange={handleSignupInputChange}
                            className="pl-10 shadow-none focus-visible:ring-0 focus-visible:border-blue-500"
                            placeholder="Enter your business name"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="address"
                          className="text-sm font-medium text-foreground"
                        >
                          Address
                        </label>
                        <div className="relative">
                          <MapPinHouse className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="text"
                            id="address"
                            name="address"
                            value={signupFormData.address}
                            onChange={handleSignupInputChange}
                            className="pl-10 shadow-none focus-visible:ring-0 focus-visible:border-blue-500"
                            placeholder="Enter your address"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="phone"
                          className="text-sm font-medium text-foreground"
                        >
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={signupFormData.phone}
                            onChange={handleSignupInputChange}
                            className="pl-10 shadow-none focus-visible:ring-0 focus-visible:border-blue-500"
                            placeholder="Enter your phone number"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium text-foreground"
                        >
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="email"
                            id="email"
                            name="email"
                            value={signupFormData.email}
                            onChange={handleSignupInputChange}
                            className="pl-10 shadow-none focus-visible:ring-0 focus-visible:border-blue-500"
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="password"
                          className="text-sm font-medium text-foreground"
                        >
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={signupFormData.password}
                            onChange={handleSignupInputChange}
                            className="pl-10 pr-12 shadow-none focus-visible:ring-0 focus-visible:border-blue-500"
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            disabled={loading}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="confirmPassword"
                          className="text-sm font-medium text-foreground"
                        >
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={signupFormData.confirmPassword}
                            onChange={handleSignupInputChange}
                            className="pl-10 pr-12 shadow-none focus-visible:ring-0 focus-visible:border-blue-500"
                            placeholder="Confirm your password"
                            required
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            disabled={loading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        size="lg"
                        className="w-full bg-blue-500 hover:bg-blue-700"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Signing up...
                          </span>
                        ) : (
                          <>
                            Sign Up
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </div>

                {/* Forgot Password Form */}
                <div className="min-w-full">
                  {activeTab === "forgot" && (
                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium text-foreground"
                        >
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            type="email"
                            id="email"
                            name="email"
                            value={forgotFormData.email}
                            onChange={handleForgotInputChange}
                            className="pl-10 shadow-none focus-visible:ring-0 focus-visible:border-blue-500"
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        size="lg"
                        className="w-full bg-blue-500 hover:bg-blue-700"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
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

            {/* Social Login Buttons */}
            {(activeTab === "login" || activeTab === "signup") && (
              <>
                <div className="my-6 flex items-center">
                  <div className="flex-1 border-t border-border"></div>
                  <div className="px-4 text-sm text-muted-foreground">or</div>
                  <div className="flex-1 border-t border-border"></div>
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285f4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34a853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#fbbc05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#ea4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Navigation Links */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              {activeTab === "login" ? (
                <>
                  Don&apos;t have an account?
                  <button
                    onClick={() => setActiveTab("signup")}
                    className="ml-2 text-primary hover:brightness-125 font-semibold transition-colors"
                    disabled={loading}
                  >
                    Sign up
                  </button>
                </>
              ) : activeTab === "signup" ? (
                <>
                  Already have an account?
                  <button
                    onClick={() => setActiveTab("login")}
                    className="ml-2 text-primary hover:brightness-125 font-semibold transition-colors"
                    disabled={loading}
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Remembered your password?
                  <button
                    onClick={() => setActiveTab("login")}
                    className="ml-2 text-primary hover:brightness-125 font-semibold transition-colors"
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
