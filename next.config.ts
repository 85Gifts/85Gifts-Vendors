import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
      remotePatterns: [
          {
              protocol:"https",
              hostname: "",
              pathname: '/uploads/**',
          },

      ],

    },
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: "https://eight5giftsvendorsapp.onrender.com/api/:path*", // Your backend API base URL
        },
      ];
    },
  }

export default nextConfig;
