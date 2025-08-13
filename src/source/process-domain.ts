import { pb } from "@/shared/lib/pb";
import { dummyCrawlUrls, crawlRawHTMLs, deepCrawlUrls } from "@/crawler/crawl";
import { parseSitemaps } from "@/crawler/parse-sitemaps";
import { validateDomain } from "@/crawler/utils";

import type { SourcesResponse } from "@/shared/models/pocketbase-types";

import { createWebDocs } from "../document/create-web-docs";
import { indexDocs } from "../document/index-docs";
import { logger } from "@/shared/lib/logger";

export type ProcessMode = "dummy" | "hybrid" | "auto";

const log = logger.child({
  module: "source:process-domain",
});

// -------------------------PUBLIC-------------------------

export async function processDomain(
  projectId: string,
  domain: string,
  integrationId?: string,
  sourceId?: string,
  mode: ProcessMode = "auto",
  antiBot = false
) {
  let source: SourcesResponse | null = null;

  try {
    const fn = processors[mode];
    const validatedDomain = validateDomain(domain);

    if (sourceId) {
      source = await pb.collection("sources").getOne(sourceId);
      if (!source) throw new Error("Source not found");
      source = await pb.collection("sources").update(sourceId, {
        metadata: {
          ...(source.metadata || {}),
          domain,
        },
        status: "pending",
      });
    } else {
      source = await pb.collection("sources").create({
        name: `Source for ${validatedDomain}`,
        status: "pending",
        project: projectId,
        metadata: {
          domain,
        },
      });
    }

    if (integrationId) {
      await pb.collection("integrations").update(integrationId, {
        "sources+": [source!.id],
      });
    }

    const results = await fn(validatedDomain, antiBot);

    const docs = await createWebDocs(source!.id, results);

    await indexDocs(source!.id, docs);

    return { source, docs };
  } catch (error) {
    log.error(error);
    throw error;
  } finally {
    if (source) {
      await pb.collection("sources").update(source.id, {
        status: "idle",
      });
    }
  }
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
