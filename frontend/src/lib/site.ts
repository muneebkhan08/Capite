export const repositoryUrl = "https://github.com/muneebkhan08/Capite";

function getPublicSiteUrl(): URL | undefined {
  const value = process.env.NEXT_PUBLIC_SITE_URL;

  if (!value) return undefined;

  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

/**
 * The public deployment URL is intentionally opt-in. Local/self-hosted copies
 * should not advertise a made-up canonical URL or sitemap to search engines.
 */
export const publicSiteUrl = getPublicSiteUrl();
