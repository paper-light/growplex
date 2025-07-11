import { parseStringPromise } from "xml2js";
import { MAX_DEPTH, MAX_TOTAL_URLS, MAX_SITEMAP_SIZE } from "./config";
import { safeFetch, validateDomain, rateLimitRequest } from "./utils";
import { discoverSitemapUrls } from "./discover-sitemaps";

export async function parseSitemaps(domain: string): Promise<string[]> {
  try {
    const normalizedDomain = validateDomain(domain);
    const sitemapUrls = await discoverSitemapUrls(normalizedDomain);
    const pageUrls = new Set<string>();
    const seenSitemaps = new Set<string>();
    let totalUrlsProcessed = 0;

    async function processSitemap(
      url: string,
      depth: number = 0
    ): Promise<void> {
      // Safety checks
      if (seenSitemaps.has(url) || depth > MAX_DEPTH) return;
      if (totalUrlsProcessed >= MAX_TOTAL_URLS) return;

      seenSitemaps.add(url);

      // Rate limiting using Redis
      await rateLimitRequest(`domain:${normalizedDomain}`);

      const res = await safeFetch(url);
      if (!res || !res.ok) {
        console.warn(
          `Failed to fetch sitemap ${url}: HTTP ${res?.status || "unknown"}`
        );
        return;
      }

      // Check content type
      const contentType = res.headers.get("content-type");
      if (
        contentType &&
        !contentType.includes("xml") &&
        !contentType.includes("text/plain")
      ) {
        console.warn(
          `Unexpected content type for sitemap ${url}: ${contentType}`
        );
      }

      // Check content length
      const contentLength = res.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > MAX_SITEMAP_SIZE) {
        console.warn(`Sitemap too large: ${url} (${contentLength} bytes)`);
        return;
      }

      let xml: string;
      try {
        xml = await res.text();
      } catch (e) {
        console.warn(`Failed to read sitemap content from ${url}:`, e);
        return;
      }

      // Check if XML is too large
      if (xml.length > MAX_SITEMAP_SIZE) {
        console.warn(
          `Sitemap content too large: ${url} (${xml.length} characters)`
        );
        return;
      }

      let js: any;
      try {
        js = await parseStringPromise(xml);
      } catch (e) {
        console.warn(`Invalid XML at ${url}:`, e);
        return;
      }

      // Handle sitemap index
      if (js.sitemapindex?.sitemap) {
        for (const s of js.sitemapindex.sitemap) {
          if (s.loc?.[0] && totalUrlsProcessed < MAX_TOTAL_URLS) {
            try {
              const sitemapUrl = new URL(s.loc[0], url).toString();
              await processSitemap(sitemapUrl, depth + 1);
            } catch (e) {
              console.warn(`Invalid sitemap URL in index: ${s.loc[0]}`);
            }
          }
        }
      }

      // Handle URL set
      if (js.urlset?.url) {
        for (const u of js.urlset.url) {
          if (u.loc?.[0] && totalUrlsProcessed < MAX_TOTAL_URLS) {
            try {
              const pageUrl = new URL(u.loc[0]).toString();
              pageUrls.add(pageUrl);
              totalUrlsProcessed++;

              // Check if we've reached the limit
              if (totalUrlsProcessed >= MAX_TOTAL_URLS) {
                console.warn(`Reached maximum URL limit (${MAX_TOTAL_URLS})`);
                return;
              }
            } catch (e) {
              console.warn(`Invalid page URL in sitemap: ${u.loc[0]}`);
            }
          }
        }
      }
    }

    // Process all discovered sitemaps with concurrency limit
    const concurrencyLimit = 3;
    for (let i = 0; i < sitemapUrls.length; i += concurrencyLimit) {
      const batch = sitemapUrls.slice(i, i + concurrencyLimit);
      await Promise.all(batch.map((url) => processSitemap(url, 0)));

      // Check if we've reached the limit
      if (totalUrlsProcessed >= MAX_TOTAL_URLS) {
        break;
      }
    }

    return Array.from(pageUrls);
  } catch (error) {
    console.error("Error in parseSitemaps:", error);
    return [];
  }
}
