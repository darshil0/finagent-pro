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
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://public-cdn.shadcn.com; font-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com;",
        },
      ],
    },
  ],
};

export default nextConfig;
