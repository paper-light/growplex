import { BASE } from "./config.js";

export async function submitCrawl(urls) {
  const res = await fetch(`${BASE}/crawl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      urls,
      priority: 10,

      browser_config: {
        type: "BrowserConfig",
        params: {
          headless: true,
        },
      },

      crawler_config: {
        type: "CrawlerRunConfig",
        wait_for: "css:body",

        deep_crawl_strategy: {
          type: "BFSDeepCrawlStrategy",
          params: {
            max_pages: 500,
            max_depth: 4,
            include_external: false,

            filter_chain: {
              type: "FilterChain",
              params: {
                filters: [
                  {
                    type: "URLPatternFilter",
                    params: {
                      patterns: ["*/??/*", "*/??-??/*", "*/??", "*/??-??"],
                      reverse: true,
                    },
                  },
                ],
              },
            },
          },
        },

        markdown_generator: {
          type: "DefaultMarkdownGenerator",
          params: {
            content_filter: {
              type: "PruningContentFilter",
              params: {
                threshold: 0.05,
                threshold_type: "fixed",
                min_word_threshold: 2,
              },
            },
          },
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`Failed to submit ${urls}: ${res.statusText}`);
  const payload = await res.json();

  for (const res of payload.results) {
    if (res.status_code === 200) {
      const hrefs = res.links.internal.map((l) => l.href);
      console.log(res.url, hrefs.length, hrefs[0]);
    }
  }

  return payload.results;
}
