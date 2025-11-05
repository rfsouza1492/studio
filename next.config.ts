/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // This is required to allow requests from the development domains.
    allowedDevOrigins: [
        "https://*.cluster-ocv3ypmyqfbqysslgd7zlhmxek.cloudworkstations.dev",
    ],
  },
};

module.exports = nextConfig;
