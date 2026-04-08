/** @type {import('next').NextConfig} */
const nextConfig = {
  // Secure image optimization (FinAgent charts)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'public-cdn.shadcn.com',  // shadcn icons
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.png',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.jpg',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Next.js 16 + shadcn/ui + React 19 optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'class-variance-authority',
      'tailwind-merge'
    ],
  },

  // Production bundle optimization
  transpilePackages: [
    'recharts',
    'react-resizable-panels'
  ],

  // Production-ready linting & TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Security headers
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
};

export default nextConfig;
