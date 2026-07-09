import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Lab report PDFs are capped at 15MB in lib/actions/results.ts; this
      // just needs to be comfortably above that to cover FormData overhead.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
