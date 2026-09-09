import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/dashboard/*",
          "/api/",
          "/api/*",
          "/login",
          "/register",
          "/verify",
          "/verify-email",
          "/reset-password",
          "/forgot-password",
          "/profile/",
          "/profile/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/dashboard/*",
          "/api/",
          "/api/*",
          "/login",
          "/register",
          "/profile/",
        ],
      },
    ],
    sitemap: "https://meccomputerclub.org/sitemap.xml",
    host: "https://meccomputerclub.org",
  };
}
