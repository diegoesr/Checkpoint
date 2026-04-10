import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/assets/icons/checkpoint.png",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.rawg.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
