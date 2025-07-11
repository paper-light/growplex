import { parseStringPromise } from "xml2js";

export async function discoverSitemapUrls(domain) {
  const base = `${domain}`;
  const candidates = new Set();

  // 1. robots.txt
  try {
    const robots = await fetch(`${base}/robots.txt`);
    if (robots.ok) {
      const text = await robots.text();
      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/^\s*Sitemap:\s*(\S+)/i);
        if (m) {
          try {
            const url = new URL(m[1], base).toString();
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

  // 2. HTML link tags
  try {
    const home = await fetch(base);
    if (home.ok) {
      const html = await home.text();

      // More robust regex that handles attribute order
      const linkRe = /<link\s+([^>]*)>/gi;
      let match;

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
              const url = new URL(href, base).toString();
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
    candidates.add(`${base}${path}`);
  });

  return Array.from(candidates);
}

export async function fetchSitemapUrls(domain) {
  const sitemapUrls = await discoverSitemapUrls(domain);
  const pageUrls = new Set();
  const seenSitemaps = new Set();
  const maxDepth = 5; // Prevent infinite recursion

  async function processSitemap(url, depth = 0) {
    if (seenSitemaps.has(url) || depth > maxDepth) return;
    seenSitemaps.add(url);

    let xml;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

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

      xml = await res.text();
    } catch (e) {
      console.warn(`Failed to fetch sitemap ${url}:`, e);
      return;
    }

    let js;
    try {
      js = await parseStringPromise(xml);
    } catch (e) {
      console.warn(`Invalid XML at ${url}:`, e);
      return;
    }

    // Handle sitemap index
    if (js.sitemapindex?.sitemap) {
      for (const s of js.sitemapindex.sitemap) {
        if (s.loc?.[0]) {
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
        if (u.loc?.[0]) {
          try {
            const pageUrl = new URL(u.loc[0]).toString();
            pageUrls.add(pageUrl);
          } catch (e) {
            console.warn(`Invalid page URL in sitemap: ${u.loc[0]}`);
          }
        }
      }
    }
  }

  // Process all discovered sitemaps
  await Promise.all(sitemapUrls.map((url) => processSitemap(url, 0)));

  return Array.from(pageUrls);
}
