import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  // ...whatever else is already in here, keep it
};

export default nextConfig;
