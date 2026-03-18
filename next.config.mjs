/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,  // Fine for demo — avoids Vercel image optimization limits
  },
  async redirects() {
    return [
      { source: '/win-loss', destination: '/deal-intelligence', permanent: false },
      { source: '/ease-of-realization', destination: '/deal-intelligence', permanent: false },
      { source: '/chat', destination: '/ask-your-data', permanent: false },
    ]
  },
}

export default nextConfig
