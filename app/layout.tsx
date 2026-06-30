import type { Metadata } from "next";
import {  Fredoka } from "next/font/google";
import "./globals.css";
import { VendorAuthProvider } from '@/contexts/VendorAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CheckoutProvider } from '@/contexts/CheckoutContext';
import { ComingSoonProvider } from '@/contexts/ComingSoonContext';

import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // specify the weights you need
});

export const metadata: Metadata = {
  title: "Ominiflow85 Vendors",
  description: "Ominiflow85, Manage your products, profile, inventrory, billing and orders all in one place.",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body
        className={`${fredoka.variable} antialiased`}
      >
     <ThemeProvider>
       <VendorAuthProvider>
         <CheckoutProvider>
          <ComingSoonProvider>
            {/* <DevModeBypass /> */}
            {children}
            <Toaster />
            <SonnerToaster position="bottom-right" richColors closeButton visibleToasts={3} />
          </ComingSoonProvider>
         </CheckoutProvider>
       </VendorAuthProvider>
     </ThemeProvider>
      </body>
    </html>
  );
}
