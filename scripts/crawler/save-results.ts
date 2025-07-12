import fs from "fs";
import path from "path";

export function saveResults(
  results: any[],
  outputDir = path.join(process.cwd(), "data")
) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const seenUrls = new Set();
  const seenHTMLs = new Set();
  const filteredResults = [];
  for (const r of results) {
    if (r.status_code !== 200) continue;
    const md = r.markdown.fit_markdown;
    if (md.length <= 100) {
      console.log("Skipping", r.url, "because it's too short");
      continue;
    }
    if (seenUrls.has(r.url)) {
      console.log("Skipping", r.url, "because it's already seen");
      continue;
    }

    const htmlHash = r.html
      .split("")
      .reduce((hash: number, char: string) => {
        return ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff;
      }, 0)
      .toString(16);
    if (seenHTMLs.has(htmlHash)) {
      console.log("Skipping", r.url, "because HTML content is duplicate");
      continue;
    }

    seenUrls.add(r.url);
    seenHTMLs.add(htmlHash);

    filteredResults.push(r);

    const urlObj = new URL(r.url);
    let name =
      urlObj.pathname === "/" ? "root" : urlObj.pathname.replace(/\//g, "_");
    if (!name) name = "page";
    const filePath = path.join(outputDir, `${name}.json`);

    const payload = {
      url: r.url,
      metadata: r.metadata,
      raw_html: r.html,
      full_url: r.final_url,
      md: r.markdown,
      html: r.cleaned_html,
      raw_markdown: r.markdown.raw_markdown,
      fit_markdown: r.markdown.fit_markdown,
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
    console.log("Wrote", filePath);
  }
  console.log("✅ Done writing individual JSON files");
  return filteredResults;
}
