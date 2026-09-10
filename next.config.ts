import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "userpic.codeforces.org",
      },
      {
        protocol: "https",
        hostname: "s0.wp.com",
      },
      {
        protocol: "https",
        hostname: "opengraph.githubassets.com",
      },
      {
        protocol: "https",
        hostname: "api.microlink.io",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/cp-hub/achievements",
        destination: "/cp-hub?tab=achievements",
        permanent: true,
      },
      {
        source: "/cp-hub/leaderboard",
        destination: "/cp-hub?tab=leaderboard",
        permanent: true,
      },
      {
        source: "/cp-hub/problem-sets",
        destination: "/cp-hub?tab=problem-sets",
        permanent: true,
      },
      {
        source: "/cp-hub/resources",
        destination: "/cp-hub?tab=resources",
        permanent: true,
      },
      {
        source: "/cp-hub/roadmaps",
        destination: "/cp-hub?tab=roadmaps",
        permanent: true,
      },
      {
        source: "/dashboard/page-content",
        destination: "/dashboard/page-editor?tab=content",
        permanent: true,
      },
      {
        source: "/profiles/:id",
        destination: "/profile/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
