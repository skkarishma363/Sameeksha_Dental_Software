import type { NextConfig } from "next";

// For custom domain (https://sameekshadental.com/), basePath is root (undefined).
// When deploying to a GitHub Pages subpath (*.github.io/Sameeksha_Dental_Software),
// pass NEXT_PUBLIC_BASE_PATH=/Sameeksha_Dental_Software.
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const basePath = rawBasePath ? rawBasePath : undefined;

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
