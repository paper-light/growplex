import "dotenv/config";
import { deepCrawlUrls } from "@/crawler/crawl";

export async function f(url: string) {
  const results = await deepCrawlUrls([url]);
  console.log(
    results.length,
    results.map((r: any) => r.url),
    results[0]
  );
  return results;
}

f("https://growplex.dev");
