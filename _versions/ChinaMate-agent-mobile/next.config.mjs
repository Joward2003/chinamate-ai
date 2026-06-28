/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["localhost", "127.0.0.1", "172.31.104.185"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
