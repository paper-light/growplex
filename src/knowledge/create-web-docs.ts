import {
  DocumentsStatusOptions,
  type DocumentsResponse,
} from "@/shared/models/pocketbase-types";
import { pb } from "@/shared/lib/pb";

export async function createWebDocs(
  orgId: string,
  sourceId: string,
  projectId: string,
  results: any[]
) {
  const docs: DocumentsResponse[] = [];
  const uniqueURLs = new Set<string>();
  for (const result of results) {
    if (uniqueURLs.has(result.url)) continue;

    const doc = await pb.collection("documents").create({
      source: sourceId,
      title: result?.metadata?.title || result?.url,
      type: "webPage",
      status:
        result.success && result.status_code === 200
          ? DocumentsStatusOptions.loaded
          : DocumentsStatusOptions.error,
      content: result.success
        ? result.markdown.fit_markdown
        : result.error_message,
      metadata: {
        ...result?.metadata,
        orgId,
        sourceId,
        projectId,
        status_code: result.status_code,
        success: result.success,
        url: result.url,
      },
    });

    docs.push(doc);
    uniqueURLs.add(result.url);
  }
  const loadedDocs = docs.filter(
    (d) => d.status === DocumentsStatusOptions.loaded
  );

  return loadedDocs;
}
