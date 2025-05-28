/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // experimental: {
  //   serverActions: false,
  //   fetchInstrumentation: false, // helps avoid fetch stream issues that may trigger CORS warnings
  // },
  images: {
    domains: ["res.cloudinary.com"], // Cloudinary domain
  },
};

module.exports = nextConfig;
