import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Required for static HTML export
  reactStrictMode: true, // Optional but recommended
  // You can add more options below if needed
};

export default nextConfig;