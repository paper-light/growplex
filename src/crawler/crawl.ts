import { getEnv } from "@/shared/helpers/get-env";
import {
  buildCrawlerConfig,
  buildBrowserConfig,
  undiciAgent,
} from "@/crawler/config";

const CRAWL4AI_URL = getEnv("CRAWL4AI_URL");

// -------------------------PUBLIC-------------------------

export async function dummyCrawlUrls(urls: string[]) {
  const results = [];
  for (const url of urls) {
    const html = await dummyFetch(url);
    results.push({
      url,
      html,
    });
  }
  return results;
}

export async function crawlRawHTMLs(
  htmls: string[],
  antiBot = false,
  cache = true
) {
  return crawlUrls(
    htmls.map((html) => `raw://${html}`),
    antiBot,
    cache
  );
}

export async function crawlUrls(urls: string[], antiBot = false, cache = true) {
  const results = await crawl(urls, antiBot, cache, false);
  return results;
}

export async function deepCrawlUrls(
  urls: string[],
  antiBot = false,
  cache = true,
  maxPages = 200,
  maxDepth = 3
) {
  const results = await crawl(urls, antiBot, cache, true, maxPages, maxDepth);
  return results;
}

// -------------------------PRIVATE-------------------------

async function crawl(
  urls: string[],
  antiBot = false,
  cache = true,
  recursive = true,
  maxPages = 200,
  maxDepth = 3
) {
  const res = await fetch(`${CRAWL4AI_URL}/crawl`, {
    //@ts-ignore
    dispatcher: undiciAgent,

    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      urls,
      priority: 10,

      browser_config: buildBrowserConfig(),

      crawler_config: buildCrawlerConfig(
        antiBot,
        cache,
        false, // stream = false
        recursive,
        maxPages,
        maxDepth
      ),
    }),
  });
  if (!res.ok) throw new Error(`Failed to submit ${urls}: ${res.statusText}`);
  const payload = await res.json();

  return payload.results;
}

async function dummyFetch(url: string) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/115.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });

    const html = await res.text();
    return html;
  } catch (err) {
    console.error(`Fetch failed: ${url}`, err);
  }
}
