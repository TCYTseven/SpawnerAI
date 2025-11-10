/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@heroui/react"],
  },
  onDemandEntries: {
    maxInactiveAge: 15 * 60 * 1000,
    pagesBufferLength: 5,
  },
  eslint: {
    // ❌ Skip ESLint during builds
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
