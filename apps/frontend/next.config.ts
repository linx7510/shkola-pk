import type { NextConfig } from "next";
import redirects from "./redirects.json";

const nextConfig: NextConfig = {
  async redirects() {
    return redirects.redirects;
  },
};

export default nextConfig;

