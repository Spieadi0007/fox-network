import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fox/shared", "@fox/supabase"],
};

export default nextConfig;
