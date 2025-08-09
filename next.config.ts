import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Optional: allow dev assets when testing via a tunnel/domain in development
    // Replace with your dev/tunnel origin if you use one
    // allowedDevOrigins: ["https://<your-dev-origin>"]
  },
  // Ensure the well-known path is served as-is
  // No special rewrites needed since file exists in public/.well-known
};

export default nextConfig;
