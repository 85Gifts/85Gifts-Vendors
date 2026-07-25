"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, Gift, Home, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useVendorAuth } from "@/contexts/VendorAuthContext";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

import LoginArt from "@/components/LoginArt";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const { forgotPassword } = useVendorAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      setSuccess("Password reset link sent! Please check your email.");
      toast({
        title: "Reset link sent",
        description: "Password reset link sent! Please check your email.",
        variant: "success",
      });
      setTimeout(() => {
        router.push(
          `/reset-password?email=${encodeURIComponent(email)}&token=${response.data.resetCode}`
        );
      }, 2000);
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

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      <div className="w-full lg:w-1/2 h-64 lg:h-auto relative overflow-hidden">
        <LoginArt />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-blue-100/30 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              <span>Reset Your Password</span>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-2">
              Forgot Password
            </h1>
            <p className="text-muted-foreground">
              Enter your email to reset your password
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            {success ? (
              <div className="text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                <p className="text-green-600 font-medium">{success}</p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to reset page...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
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

          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Remembered your password?{" "}
              <Link
                href="/login"
                className="text-primary hover:brightness-125 font-semibold transition-colors"
              >
                Sign in
              </Link>
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
