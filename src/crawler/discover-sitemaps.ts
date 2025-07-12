import { safeFetch, rateLimitRequest } from "./utils";

export async function discoverSitemapUrls(domain: string): Promise<string[]> {
  const candidates = new Set<string>();

  try {
    // Rate limit the discovery process
    await rateLimitRequest(`discovery:${domain}`);

    // 1. robots.txt
    const robotsUrls = await parseRobots(domain);
    robotsUrls.forEach((url) => candidates.add(url));

    // 2. HTML link tags
    const htmlUrls = await parseHTMLtags(domain);
    htmlUrls.forEach((url) => candidates.add(url));

    // 3. Common sitemap locations
    const commonPaths = [
      "/sitemap.xml",
      "/sitemap-index.xml",
      "/sitemap1.xml",
      "/sitemap_news.xml",
      "/sitemap_blog.xml",
      "/sitemap_products.xml",
      "/sitemap_pages.xml",
    ];

    commonPaths.forEach((path) => {
      candidates.add(`${domain}${path}`);
    });
  } catch (error) {
    console.error("Error discovering sitemap URLs:", error);
    return [];
  }

  return Array.from(candidates);
}

async function parseRobots(domain: string): Promise<Set<string>> {
  const candidates = new Set<string>();

  try {
    // Rate limit robots.txt requests
    await rateLimitRequest(`robots:${domain}`);

    const res = await safeFetch(`${domain}/robots.txt`);
    if (res && res.ok) {
      const text = await res.text();

      // Limit robots.txt size
      if (text.length > 1024 * 1024) {
        // 1MB limit
        console.warn("Robots.txt too large, skipping");
        return candidates;
      }

      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^\s*Sitemap:\s*(\S+)/i);
        if (m) {
          try {
            const url = new URL(m[1], domain).toString();
            candidates.add(url);
          } catch (e) {
            console.warn(`Invalid sitemap URL in robots.txt: ${m[1]}`);
          }
        }
      }
    }
  } catch (e) {
    console.warn(`Could not fetch robots.txt:`, e);
  }

  return candidates;
}

async function parseHTMLtags(domain: string): Promise<Set<string>> {
  const candidates = new Set<string>();

  try {
    // Rate limit homepage requests
    await rateLimitRequest(`homepage:${domain}`);

    const res = await safeFetch(domain);
    if (res && res.ok) {
      const html = await res.text();

      // Limit HTML size
      if (html.length > 5 * 1024 * 1024) {
        // 5MB limit
        console.warn("Homepage HTML too large, skipping");
        return candidates;
      }

      // More robust regex that handles attribute order
      const linkRe = /<link\s+([^>]*)>/gi;
      let match: RegExpExecArray | null;

      while ((match = linkRe.exec(html))) {
        const attrs = match[1];

        // Extract rel and href attributes
        const relMatch = attrs.match(/rel\s*=\s*["']([^"']+)["']/i);
        const hrefMatch = attrs.match(/href\s*=\s*["']([^"']+)["']/i);
        const typeMatch = attrs.match(/type\s*=\s*["']([^"']+)["']/i);

        if (hrefMatch) {
          const href = hrefMatch[1];
          const rel = relMatch?.[1]?.toLowerCase() || "";
          const type = typeMatch?.[1]?.toLowerCase() || "";

          // Check if this is a sitemap link
          if (
            rel === "sitemap" ||
            (rel === "alternate" && type === "application/xml+sitemap") ||
            (type === "application/xml" && href.includes("sitemap"))
          ) {
            try {
              const url = new URL(href, domain).toString();
              candidates.add(url);
            } catch (e) {
              console.warn(`Invalid sitemap URL in HTML: ${href}`);
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn(`Could not fetch homepage HTML:`, e);
  }

  return candidates;
}
