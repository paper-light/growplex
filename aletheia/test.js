import fs from "fs";
import { submitCrawl } from "./crawl.js";
import { fetchSitemapUrls } from "./sitemap.js";

async function testCrawl(domain) {
  const pageUrls = await fetchSitemapUrls(domain);
  const urlList = [domain, ...pageUrls];

  console.log("Pages:", urlList);

  const results = await submitCrawl(urlList);
  for (const res of results) {
    if (res.status_code === 200) {
      console.log(res.url, res.status_code, "OK");
    } else {
      console.error(res.url, res.status_code, "ERR", res.error_message);
    }
  }

  const seenUrls = new Set();
  const toWrite = results
    .filter((r) => r.status_code === 200)
    .filter((r) => r.markdown.fit_markdown.length > 100)
    .filter((r) => {
      if (seenUrls.has(r.url)) return false;
      seenUrls.add(r.url);
      return true;
    })
    .map((r) => {
      return {
        url: r.url,
        markdown: r.markdown.fit_markdown,
        metadata: r.metadata,
      };
    });
  fs.writeFileSync(
    "./data/results.json",
    JSON.stringify(toWrite, null, 2),
    "utf-8"
  );
  console.log("✅ Wrote", toWrite.length, "items to results.json");
}

testCrawl("https://dev.gold-swan.is/en").catch((err) => {
  console.error("Crawl failed:", err);
  process.exit(1);
});
