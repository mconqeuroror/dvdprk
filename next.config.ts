import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  async redirects() {
    return [
      {
        source: "/free-course",
        destination: "/basic-course",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
