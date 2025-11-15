"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from 'lucide-react';


export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" |"password">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState<string>("");
  const { toast } = useToast();
  
  const searchParams = useSearchParams();
  const codeFromQuery = searchParams.get("token") || "";

  const [code, setCode] = useState(codeFromQuery);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
})

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const payload = { email: formData.email } 
      const response = await fetch("/api/vendors/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      

      const data = await response.json();

      console.log("data:", data)

      if (!response.ok) {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid or expired verification code.",
          variant: "destructive",
        });
        return;
      }

      // ✅ Success
      toast({
        title: "Email Verified 🎉",
        description: "Your account has been verified successfully. You can now log in.",
      });
    //   router.push(`?token=${data.data.resetCode}`);
      setCode(data.data.resetCode);
      setStep("password");

    } catch (error) {
      console.error("❌ Error verifying email:", error);
      toast({
        title: "Network Error",
        description: "Unable to verify your email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = { 
        code: code,
        newPassword: password
    }
      
     
      const response = await fetch("/api/vendors/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid or expired verification code.",
          variant: "destructive",
        });
        return;
      }

      // ✅ Success
      toast({
        title: "Email Verified 🎉",
        description: "Your account has been verified successfully. You can now log in.",
      });

      router.push("/login"); // Redirect to login page (your AuthPage)
    } catch (error) {
      console.error("❌ Error verifying email:", error);
      toast({
        title: "Network Error",
        description: "Unable to verify your email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
          {step === "email" && (
            <>
                <form
                    onSubmit={handleEmailSubmit}
                    className="bg-white shadow-md rounded-xl p-6 w-full max-w-md space-y-5"
                >
                    <h2 className="text-2xl font-bold text-center">Reset Your Password</h2>
            
                    <p className="text-sm text-gray-600 text-center">
                    Enter your Email
                    </p>
            
                    <Input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Input your email"
                    className="text-center tracking-widest"
                    required
                    />
            
                    <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    >
                    {loading ? "Reseting..." : "Reset Password"}
                    </Button>
                </form>
            </>
            )}


            {/* Step 2: Reset Password */}
          {step === "password" && (
            // <>
            //   <label className="block text-gray-600 mb-2">Enter New Password</label>
            //   <div className="relative w-full">
            //     <input
            //       type={togglePasswordVisibility ? "text" : "password"}
            //       placeholder="Input your email"
            //       className="w-full p-3 border rounded mb-4 pr-12"
            //       value={password}
            //       onChange={(e) => setPassword(e.target.value)}
            //     />
            //     <img
            //       src={showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            //       alt="Toggle Password Visibility"
            //       className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer w-5 h-5"
            //       onClick={togglePasswordVisibility}
            //     />
            //   </div>
            //   <button
            //     onClick={handleResetPassword}
            //     className="w-full bg-black text-white p-3 rounded mb-3 transition duration-300 hover:bg-gray-800"
            //     disabled={loading}
            //   >
            //     {loading ? "Resetting..." : "Reset Password"}
            //   </button>
            //   <button onClick={() => setStep("otp")} className="text-[#072AC8] text-sm mt-4">
            //     Go Back
            //   </button>
            // </>


            <>
                <form
                    onSubmit={handleResetPassword}
                    className="bg-white shadow-md rounded-xl p-6 w-full max-w-md space-y-5"
                >
                    <h2 className="text-2xl font-bold text-center">Reset Your Password</h2>
            
                    <p className="text-sm text-gray-600 text-center">
                    Enter Token sent to {formData.email}
                    </p>
            
                    <Input
                    type="text"
                    name="email"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Input the token"
                    className="text-center tracking-widest"
                    required
                    />

                    <p className="text-sm text-gray-600 text-center">
                    Enter New Password
                    </p>
            
                    <Input
                        type={togglePasswordVisibility ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Input your new password"
                        className="text-center tracking-widest"
                        required
                    />
            
                    <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                    >
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
                </form>
            </>
          )}
    </div>  
  );
}
