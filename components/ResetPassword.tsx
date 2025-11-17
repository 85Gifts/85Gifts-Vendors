"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Home } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const { toast } = useToast();
  const params = useSearchParams();

  const email = params.get("email") || "";
  const codeFromQuery = params.get("token") || "";

  const [code, setCode] = useState(codeFromQuery);
  const [loading, setLoading] = useState(false);



  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        code: code,
        newPassword: password,
      };

      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Reset Failed",
          description: data.message || "Invalid or expired reset code.",
          variant: "destructive",
        });
        return;
      }

      // ✅ Success
      toast({
        title: "Password Reset Successful 🎉",
        description: "You can now log in with your new password.",
      });

      router.push("/login"); // Redirect to login page (your AuthPage)
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to verify your email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleResetPassword}
        className="bg-white shadow-md rounded-xl p-6 w-full max-w-md space-y-5"
      >
        <h2 className="text-2xl font-bold text-center">Reset Your Password</h2>

        <p className="text-sm text-gray-600 text-center">
          Enter the token sent to <strong>{email}</strong>
        </p>

        <Input
          type="text"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter the reset token"
          className="text-center tracking-widest"
          required
        />

        <Input
          // type={togglePasswordVisibility ? "text" : "password"}
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your new password"
          className="text-center tracking-widest"
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Reseting..." : "Reset Password"}
        </Button>

        {/* <p className="text-center text-sm text-gray-500">
          Didn’t get the code?{" "}
          <button
            type="button"
            onClick={() => toast({ title: "Resend not implemented yet" })}
            className="text-blue-600 underline"
          >
            Resend
          </button>
        </p> */}
        <div className="text-center mt-4">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <Home className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
      </form>
    </div>
  );
}
