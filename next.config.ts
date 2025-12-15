import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
      remotePatterns: [
          // Add your image hosting domain here when needed
          // Example:
          // {
          //     protocol:"https",
          //     hostname: "your-image-host.com",
          //     pathname: '/uploads/**',
          // },
      ],

    },
  }

export default nextConfig;
