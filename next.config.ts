import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/register",
        destination: "/login",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
