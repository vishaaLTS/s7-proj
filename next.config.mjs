/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pdf-parse', 'bcryptjs', '@prisma/client', 'prisma'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'pdf-parse'];
    }
    return config;
  },
};

export default nextConfig;
