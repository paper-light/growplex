import "dotenv/config";

import path from "path";
import { fileURLToPath } from "url";

import { processDomain } from "@/knowledge/process-domain";

import { saveResults } from "./save-results.js";

const f = fileURLToPath(import.meta.url);
const __dirname = path.dirname(f);

async function run(domain: string) {
  const results = await processDomain("u217a67x1144q37", domain, "auto", true);

  results.forEach((res: any) => {
    if (res.status_code === 200) {
      console.log(res.url, "OK", res.metadata.h1);
    } else {
      console.error(res.url, res.status_code, "ERR", res.error_message);
    }
  });

  const hostname = new URL(domain).hostname;
  const filteredResults = saveResults(
    results,
    path.join(__dirname, "data", hostname)
  );

  console.log("Crawl completed", filteredResults.length, "/", results.length);
  process.exit(1);
}

run("https://dev.gold-swan.is").catch((err) => {
  console.error("Crawl failed:", err);
  process.exit(1);
});
