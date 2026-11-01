import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
    // 90 keeps choir photos crisp; 75 is the Next.js default for everything else
    qualities: [75, 90],
  },
};

export default nextConfig;
