/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy all /api/* calls to the FastAPI backend so the browser never
  // needs CORS and the backend URL stays server-side only.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL ?? 'http://localhost:8000'}/api/:path*`,
      },
    ]
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
