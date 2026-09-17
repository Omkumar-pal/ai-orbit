import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.google.com" },
      { protocol: "https", hostname: "**.gstatic.com" },
      { protocol: "https", hostname: "framerusercontent.com" },
      { protocol: "https", hostname: "**.theresanaiforthat.com" },
      { protocol: "https", hostname: "media.theresanaiforthat.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.bing.net" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
