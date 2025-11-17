import type { Metadata } from "next";
import { Geist, Geist_Mono, Fredoka } from "next/font/google";
import "./globals.css";
import { VendorAuthProvider } from '@/contexts/VendorAuthContext';

import { Toaster } from "@/components/ui/toaster"

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // specify the weights you need
});

export const metadata: Metadata = {
  title: "85Gifts Vendors",
  description: "85Gifts Vendors App, Manage your products and profile",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body
        className={`${fredoka.variable} antialiased`}
      >
     <VendorAuthProvider>
        {children}
        <Toaster /> 
     </VendorAuthProvider>
      </body>
    </html>
  );
}
