import { getEnv } from "../shared/helpers/get-env";
import {
  BROWSER_CONFIG,
  MARKDOWN_GENERATOR,
  DEEP_CRAWL_STRATEGY,
  CRAWLER_CONFIG_PARAMS,
} from "./config";

const CRAWL4AI_URL = getEnv("CRAWL4AI_URL");

export async function crawlDomain(urls: string[]) {
  const res = await fetch(`${CRAWL4AI_URL}/crawl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      urls,
      priority: 10,

      browser_config: BROWSER_CONFIG,

      crawler_config: {
        ...CRAWLER_CONFIG_PARAMS,
        deep_crawl_strategy: DEEP_CRAWL_STRATEGY,
        markdown_generator: MARKDOWN_GENERATOR,
      },
    }),
  });
  if (!res.ok) throw new Error(`Failed to submit ${urls}: ${res.statusText}`);
  const payload = await res.json();

  return payload.results;
}
