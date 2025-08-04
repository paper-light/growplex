import { pb } from "@/shared/lib/pb";
import { dummyCrawlUrls, crawlRawHTMLs, deepCrawlUrls } from "@/crawler/crawl";
import { parseSitemaps } from "@/crawler/parse-sitemaps";
import { validateDomain } from "@/crawler/utils";

import { indexDocs } from "./index-docs";
import { createWebDocs } from "./create-web-docs";

export type ProcessMode = "dummy" | "hybrid" | "auto";

// -------------------------PUBLIC-------------------------

export async function processDomain(
  projectId: string,
  domain: string,
  integrationId?: string,
  mode: ProcessMode = "auto",
  antiBot = false
) {
  const fn = processors[mode];
  const validatedDomain = validateDomain(domain);

  const org = await pb
    .collection("orgs")
    .getFirstListItem(`projects_via_org.id ?= "${projectId}"`);
  const source = await pb.collection("sources").create({
    name: `Source for ${validatedDomain}`,
    project: projectId,
    metadata: {
      domain,
    },
  });

  if (integrationId) {
    await pb.collection("integrations").update(integrationId, {
      "sources+": [source.id],
    });
  }

  const results = await fn(validatedDomain, antiBot);

  const loadedDocs = await createWebDocs(org.id, source.id, projectId, results);

  await indexDocs(org.id, loadedDocs);

  return { source, loadedDocs };
}

// -------------------------PRIVATE-------------------------

const processors: Record<
  ProcessMode,
  (domain: string, antiBot: boolean) => Promise<any>
> = {
  dummy: dummyProcessDomain,
  hybrid: hybridProcessDomain,
  auto: autoProcessDomain,
};

async function dummyProcessDomain(validatedDomain: string, antiBot = false) {
  const smUrls = await parseSitemaps(validatedDomain);
  const urls = [validatedDomain, ...smUrls];
  const results = await dummyCrawlUrls(urls);

  return results;
}

async function hybridProcessDomain(validatedDomain: string, antiBot = false) {
  const firstResults = await deepCrawlUrls([validatedDomain], antiBot);
  const urls = firstResults.map((r: any) => r.url);
  const dummyResults = await dummyCrawlUrls(urls);
  const results = await crawlRawHTMLs(dummyResults.map((r: any) => r.html));

  return results;
}

async function autoProcessDomain(validatedDomain: string, antiBot = false) {
  const results = await deepCrawlUrls([validatedDomain], antiBot);

  return results;
}
