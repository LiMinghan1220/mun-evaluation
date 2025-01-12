/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
