import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      // photos uploaded from the admin dashboard (Vercel Blob)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    // 90 keeps choir photos crisp; 75 is the Next.js default for everything else
    qualities: [75, 90],
  },
  experimental: {
    // photos are resized in the browser before upload, so 4 MB is plenty
    serverActions: { bodySizeLimit: "4mb" },
  },
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
