import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Railway deployment
  output: 'standalone',
  
  // Optimize for production
  compress: true,
  
  // Configure external packages for server components
  serverExternalPackages: ['@azure/openai'],
  
  // Configure headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
