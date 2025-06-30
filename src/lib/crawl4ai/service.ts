import { getEnv } from "../../helpers/get-env";

const CRAWL4AI_URL = getEnv("CRAWL4AI_URL");

export async function parseOrigins(urls: string[]) {
  const res = await fetch(`${CRAWL4AI_URL}/crawl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      urls: urls,
      priority: 10,
    }),
  });
  if (!res.ok)
    throw new Error(`Failed to submit ${res.status}: ${res.statusText}`);
  const payload = await res.json();
  return payload.results;
}

export async function submitCrawl(urls: string[]) {
  const res = await fetch(`${CRAWL4AI_URL}/crawl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      urls: urls,
      priority: 10,
      crawler_config: {
        type: "CrawlerRunConfig",
        params: {
          wait_for: "css:body",

          markdown_generator: {
            type: "DefaultMarkdownGenerator",
            params: {
              content_filter: {
                type: "PruningContentFilter",
                params: {
                  threshold: 0.2,
                  threshold_type: "dynamic",
                  min_word_threshold: 3,
                },
              },
            },
          },
        },
      },
    }),
  });
  if (!res.ok)
    throw new Error(`Failed to submit ${res.status}: ${res.statusText}`);
  const payload = await res.json();
  console.log(payload.results[0].links.internal, payload.results[0].metadata);
  return payload.results;
}
