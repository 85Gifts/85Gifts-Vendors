// 'use client'
// import React from 'react';
// import { Button } from '@/components/ui/button';
// import { Mail, User,Gift, ArrowRight, Home  } from 'lucide-react';


// export default function VerifyEmail(){

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();

// //     try {
// //       if (isLogin) {
// //         // 🔹 LOGIN FLOW
// //         const response = await fetch(`/api/vendors/login`, {
// //           method: 'POST',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify({
// //             email: formData.email,
// //             password: formData.password,
// //           }),
// //         });

// //         if (!response.ok) throw new Error('Login failed');
// //         const data = await response.json();
// //         console.log('Logged in:', data);
// //         // You could store a token or redirect the user here
// //       } else {
// //         // 🔹 REGISTER FLOW
// //         const response = await fetch(`/api/vendors/register`, {
// //           method: 'POST',
// //           headers: { 'Content-Type': 'application/json' },
// //           body: JSON.stringify({
// //             name: formData.name,
// //             email: formData.email,
// //             password: formData.password,
// //             confirmPassword: formData.confirmPassword,
// //           }),
// //         });

// //         if (!response.ok) throw new Error('Registration failed');
// //         const data = await response.json();
// //         console.log('Registered:', data);
// //         // You might auto-login or redirect to login page
// //       }
// //     } catch (error) {
// //       console.error(error);
// //       // Show user-friendly error message here
// //     }
// // };


// //   const handleSubmit = async (e: React.FormEvent) => {
// //   e.preventDefault();

// //   try {
// //     if (isLogin) {
// //       // 🔹 LOGIN FLOW
// //       const response = await fetch(`/api/vendors/login`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           email: formData.email,
// //           password: formData.password,
// //         }),
// //       });

// //       if (!response.ok) throw new Error("Login failed");
// //       const data = await response.json();
// //       console.log("✅ Logged in:", data);
// //       // e.g. save token, redirect, etc.
// //     } else {
// //       // 🔹 REGISTER FLOW
// //       console.log("📤 Sending register data:", {
// //         name: formData.name,
// //         email: formData.email,
// //         password: formData.password,
// //         confirmPassword: formData.confirmPassword,
// //         businessName: formData.businessName,
// //         phone: formData.phone,
// //         address: formData.address,
// //       });
// //       const response = await fetch(`/api/vendors/register`, {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           name: formData.name,
// //           email: formData.email,
// //           password: formData.password,
// //           confirmPassword: formData.confirmPassword,
// //           businessName: formData.businessName,
// //           phone: formData.phone,
// //           address: formData.address,
// //         }),
// //       });

// //       if (!response.ok) throw new Error("Registration failed");
// //       const data = await response.json();
// //       console.log("✅ Registered:", data);
// //     }
// //   } catch (error) {
// //     console.error("❌ Error:", error);
// //   }
// // };

//   return (

//     <div className="min-h-screen w-full flex bg-linear-to-br from-blue-50 via-blue-50 to-blue-50">
//     {/* Left Side - Illustration */}
//       <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
//         <div className="w-full h-full flex items-center justify-center relative">
//           {/* Background decorative elements */}
//           <div className="absolute inset-0 bg-linear-to-br from-blue-300 to-blue-50"></div>
//           <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-200 rounded-full opacity-30 animate-pulse"></div>
//           <div className="absolute bottom-32 right-16 w-24 h-24 bg-blue-200 rounded-full opacity-40 animate-pulse delay-1000"></div>
//           <div className="absolute top-1/2 left-8 w-16 h-16 bg-green-200 rounded-full opacity-35 animate-bounce delay-2000"></div>
          
//           {/* Main illustration */}
//           <div className="relative z-10 text-center">
//             <div className="w-72 h-72 bg-white rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl mb-8">
//               {/* Animated gift boxes */}
//               <div className="text-8xl animate-bounce">🎁</div>
              
//               {/* Floating elements */}
//               <div className="absolute top-4 left-8 text-3xl animate-pulse opacity-70">🎈</div>
//               <div className="absolute top-12 right-6 text-2xl animate-bounce delay-300 opacity-80">⭐</div>
//               <div className="absolute bottom-8 left-6 text-2xl animate-pulse delay-500 opacity-70">🎉</div>
//               <div className="absolute bottom-4 right-8 text-3xl animate-bounce delay-700 opacity-80">💝</div>
              
//               {/* Decorative rings */}
//               <div className="absolute inset-4 border-2 border-blue-200 rounded-full opacity-40"></div>
//               <div className="absolute inset-8 border-2 border-red-200 rounded-full opacity-50"></div>
//             </div>
            
//             <h2 className="text-3xl font-bold bg-linear-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent mb-4">
//               Welcome to 85Gifts
//             </h2>
//             <p className="text-lg text-gray-600 max-w-sm">
//               Discover the perfect gifts for every occasion and create magical moments for your loved ones.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Right Side - Auth Form */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
//         <div className="w-full max-w-md">
//           {/* Header */}
//           <div className="text-center mb-8">
//            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
//               <Gift className="w-4 h-4" />
//               <span>Welcome Back</span>
//             </div>
            
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">
//               Verify Email
//             </h1>
//             <p className="text-gray-600">
//             </p>
//           </div>

//           {/* Auth Form */}
//           <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
//             <div className="space-y-6">
//                 <div className="space-y-2">
//                   <label htmlFor="name" className="text-sm font-medium text-gray-700">
//                     Name
//                   </label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       type="text"
//                       id="name"
//                       name="name"
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
//                       placeholder="Enter your name"
//                     />
//                   </div>
//                 </div>

//               {/* Email field */}
//               <div className="space-y-2">
//                 <label htmlFor="email" className="text-sm font-medium text-gray-700">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
//                     placeholder="Enter your email"
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <Button
//                 className="w-full bg-linear-to-r from-blue-500 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
//               >
//                 Verify Email
//                 <ArrowRight className="w-5 h-5 ml-2" />
//               </Button>
//             </div>

//             {/* Divider */}
//             <div className="my-6 flex items-center">
//               <div className="flex-1 border-t border-gray-300"></div>
//               <div className="px-4 text-sm text-gray-500">or</div>
//               <div className="flex-1 border-t border-gray-300"></div>
//             </div>

//             {/* Social Login */}
//             <div className="space-y-3">
//               <Button
//                 type="button"
//                 variant="outline"
//                 className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg transition-all duration-200"
//               >
//                 <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
//                   <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                   <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                   <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                   <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                 </svg>
//                 Continue with Google
//               </Button>
              
//               <Button
//                 type="button"
//                 variant="outline"
//                 className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg transition-all duration-200"
//               >
//                 <svg className="w-5 h-5 mr-2" fill="#1877f2" viewBox="0 0 24 24">
//                   <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
//                 </svg>
//                 Continue with Facebook
//               </Button>
//             </div>
//           </div>

//           {/* Back to Home */}
//           <div className="text-center mt-4">
//             <button className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
//               <Home className="w-4 h-4 mr-1" />
//               Back to Home
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Gift Animation */}
//       <div className="lg:hidden fixed top-4 right-4 text-4xl animate-bounce opacity-20">
//         🎁
//       </div>
//       <div className="lg:hidden fixed bottom-4 left-4 text-3xl animate-pulse opacity-20 delay-1000">
//         💝
//       </div>
//     </div>
//   );
// };



// "use client";

// import { useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "@/components/ui/use-toast";

// export default function VerifyEmailPage() {
//   const [token, setToken] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const email = searchParams.get("email");

//   async function handleVerify() {
//     if (!email) {
//       toast({
//         title: "Error",
//         description: "Email not found. Please register again.",
//       });
//       return;
//     }

//     if (!token.trim()) {
//       toast({
//         title: "Error",
//         description: "Please enter the verification code.",
//       });
//       return;
//     }

//     try {
//       setLoading(true);

//       const response = await fetch(
//         "https://eight5giftsvendorsapp.onrender.com/api/vendors/verify-email",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email, token }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data?.message || "Verification failed");
//       }

//       toast({
//         title: "✅ Email verified successfully!",
//         description: "You can now log in to your account.",
//       });

//       setTimeout(() => router.push("/"), 2000);
//     } catch (error: any) {
//       toast({
//         title: "❌ Verification failed",
//         description: error.message || "Invalid or expired token.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center px-4">
//       <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
//       <p className="text-gray-600 mb-6">
//         {email
//           ? `Enter the 6-digit code sent to ${email}`
//           : "No email found. Please register again."}
//       </p>

//       <Input
//         type="text"
//         placeholder="Enter verification code"
//         value={token}
//         onChange={(e) => setToken(e.target.value)}
//         className="mb-4 max-w-sm"
//       />

//       <Button onClick={handleVerify} disabled={loading}>
//         {loading ? "Verifying..." : "Verify Email"}
//       </Button>
//     </div>
//   );
// }


"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Gift, Mail, ShieldCheck, Loader2, ArrowRight, Home } from "lucide-react";
import { config } from "@/config";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const email = searchParams.get("email") || "";
  const codeFromQuery = searchParams.get("verificationCode") || "";

  const [code, setCode] = useState(codeFromQuery);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast({
        title: "Missing verification code",
        description: "Please enter the code we sent to your email.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${config.BACKEND_URL}/api/vendors/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Invalid or expired verification code.");
      }

      toast({
        title: "Email verified 🎉",
        description: "Your account has been verified successfully. You can now log in.",
        variant: "success",
      });

      router.push("/login");
    } catch (error: any) {
      console.error("❌ Error verifying email:", error);
      toast({
        title: "Verification failed",
        description: error.message || "Unable to verify your email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-linear-to-br from-blue-50 via-blue-50 to-blue-50">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="absolute inset-0 bg-linear-to-br from-blue-300 to-blue-50" />
          <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-200 rounded-full opacity-30 animate-pulse" />
          <div className="absolute bottom-32 right-16 w-24 h-24 bg-blue-200 rounded-full opacity-40 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-8 w-16 h-16 bg-green-200 rounded-full opacity-35 animate-bounce delay-2000" />

          <div className="relative z-10 text-center">
            <div className="w-72 h-72 bg-white rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl mb-8">
              <div className="text-8xl animate-bounce">📬</div>
              <div className="absolute top-4 left-8 text-3xl animate-pulse opacity-70">✨</div>
              <div className="absolute top-12 right-6 text-2xl animate-bounce delay-300 opacity-80">⭐</div>
              <div className="absolute bottom-8 left-6 text-2xl animate-pulse delay-500 opacity-70">📨</div>
              <div className="absolute bottom-4 right-8 text-3xl animate-bounce delay-700 opacity-80">🔐</div>
              <div className="absolute inset-4 border-2 border-blue-200 rounded-full opacity-40" />
              <div className="absolute inset-8 border-2 border-purple-200 rounded-full opacity-50" />
            </div>

            <h2 className="text-3xl font-bold bg-linear-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent mb-4">
              Verify & Celebrate
            </h2>
            <p className="text-lg text-gray-600 max-w-sm">
              Secure your vendor account in just one step and start delighting customers.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Verification Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              <span>Email Confirmation</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify Email</h1>
            <p className="text-gray-600">
              Enter the verification code we sent to your inbox to activate your account.
            </p>
          </div>

          <form
            onSubmit={handleVerify}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="code" className="text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 tracking-[0.4em] text-center"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-500 to-blue-400 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Didn’t get the code?{" "}
                <button
                  type="button"
                  onClick={() =>
                    toast({
                      title: "Hang tight!",
                      description: "Resend verification is coming soon.",
                    })
                  }
                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                >
                  Resend
                </button>
              </p>
            </div>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <Home className="w-4 h-4 mr-1" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed top-4 right-4 text-4xl animate-bounce opacity-20">
        🎁
      </div>
      <div className="lg:hidden fixed bottom-4 left-4 text-3xl animate-pulse opacity-20 delay-1000">
        💝
      </div>
    </div>
  );
}
