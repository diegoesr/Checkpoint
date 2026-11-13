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
    // Next 16 solo permite las calidades listadas (por defecto [75]); el resto se rebaja a 75.
    qualities: [75, 85, 88],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.igdb.com",
        pathname: "/igdb/image/upload/**",
      },
      // Carátulas antiguas guardadas en BD antes de migrar a IGDB.
      // Quitar tras ejecutar scripts/relink-igdb.mjs y la migración 021.
      {
        protocol: "https",
        hostname: "media.rawg.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
