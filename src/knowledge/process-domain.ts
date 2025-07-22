import { pb } from "../shared/lib/pb";
import { dummyCrawlUrls, crawlRawHTMLs, deepCrawlUrls } from "../crawler/crawl";
import { parseSitemaps } from "../crawler/parse-sitemaps";
import { validateDomain } from "../crawler/utils";
import {
  SourcesTypeOptions,
  type DocumentsResponse,
  DocumentsStatusOptions,
} from "../shared/models/pocketbase-types";
import { extractorService } from "../rag/extractor";

import type { ProcessMode } from "./types";

// -------------------------PUBLIC-------------------------

export async function processDomain(
  projectId: string,
  domain: string,
  mode: ProcessMode = "auto",
  antiBot = false
) {
  const fn = processors[mode];
  const validatedDomain = validateDomain(domain);

  const org = await pb
    .collection("orgs")
    .getFirstListItem(`projects.id ?= "${projectId}"`);
  const source = await pb.collection("sources").create({
    name: validatedDomain,
    type: "web",
    metadata: {
      domain,
    },
  });
  await pb.collection("projects").update(projectId, {
    "sources+": [source.id],
  });

  const results = await fn(validatedDomain, antiBot);

  const docs: DocumentsResponse[] = [];
  for (const result of results) {
    docs.push(
      await pb.collection("documents").create({
        title: result?.metadata?.title || result?.url,
        status: result.success
          ? DocumentsStatusOptions.loaded
          : DocumentsStatusOptions.error,
        content: result.success
          ? result.markdown.fit_markdown
          : result.error_message,
        metadata: {
          ...result?.metadata,
          source: source.id,
          status_code: result.status_code,
        },
      })
    );
  }
  await pb.collection("sources").update(source.id, {
    documents: docs.map((d) => d.id),
  });

  const loadedDocs = docs.filter(
    (d) => d.status === DocumentsStatusOptions.loaded
  );

  await extractorService.addTexts(
    org.id,
    loadedDocs.map((d) => ({
      content: d.content,
      metadata: d.metadata as Record<string, any>,
    })),
    projectId
  );

  return { source, docs, loadedDocs };
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
