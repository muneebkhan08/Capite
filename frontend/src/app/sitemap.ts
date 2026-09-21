import type { MetadataRoute } from "next";
import { publicSiteUrl } from "~/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!publicSiteUrl) return [];

  return [
    {
      url: publicSiteUrl.toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
