import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for GitHub Pages (static hosting)
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
