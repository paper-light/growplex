import fs from "fs";
import { icelandicNewsLinks as urls } from "./links.js";

const BASE = "http://localhost:11235";

async function parseOrigins(urls) {
  const res = await fetch(`${BASE}/crawl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      urls: urls,
      priority: 10,
    }),
  });
  if (!res.ok) throw new Error(`Failed to submit ${url}: ${res.statusText}`);
  const payload = await res.json();
}

async function submitCrawl(urls) {
  const res = await fetch(`${BASE}/crawl`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      urls: urls,
      priority: 10,
      crawler_config: {
        type: "CrawlerRunConfig",
        // params: {
        //   wait_for: "css:body",

        //   markdown_generator: {
        //     type: "DefaultMarkdownGenerator",
        //     params: {
        //       content_filter: {
        //         type: "PruningContentFilter",
        //         params: {
        //           threshold: 0.2,
        //           threshold_type: "dynamic",
        //           min_word_threshold: 3,
        //         },
        //       },
        //     },
        //   },
        // },
      },
    }),
  });
  if (!res.ok) throw new Error(`Failed to submit ${url}: ${res.statusText}`);
  const payload = await res.json();
  for (const res of payload.results) {
    if (res.status_code === 200) {
      const hrefs = res.links.internal.map((l) => l.href);
      console.log(res.url, hrefs.length, hrefs[0]);
    }
  }
  return payload.results;
}

async function testCrawl(urlList) {
  const results = await submitCrawl(urlList);
  for (const res of results) {
    if (res.status_code === 200) {
      console.log(res.url, res.status_code, "OK");
    } else {
      console.error(res.url, res.status_code, "ERR", res.error_message);
    }
  }

  const toWrite = results
    .filter((r) => r.status_code === 200)
    .map((r) => r.markdown);
  fs.writeFileSync(
    "./data/results.json",
    JSON.stringify(toWrite, null, 2),
    "utf-8"
  );
  console.log("✅ Wrote", toWrite.length, "items to results.json");
}

testCrawl(urls).catch((err) => {
  console.error("Crawl failed:", err);
  process.exit(1);
});
