import type { MetadataRoute } from "next";
import { publicSiteUrl } from "~/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/captions/", "/history"],
    },
    sitemap: publicSiteUrl ? new URL("/sitemap.xml", publicSiteUrl).toString() : undefined,
  };
}
