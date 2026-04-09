import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Los archivos JSON en /data se leen desde el servidor,
  // no se exponen al cliente automáticamente.
  serverExternalPackages: [],
};

export default nextConfig;
