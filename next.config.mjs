/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.pinpoint.dev',
      },
    ],
  },
};

export default nextConfig;
