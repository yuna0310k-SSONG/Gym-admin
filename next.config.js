/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 동적 렌더링 허용
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

module.exports = nextConfig;
