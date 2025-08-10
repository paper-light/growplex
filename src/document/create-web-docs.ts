import {
  DocumentsStatusOptions,
  type DocumentsResponse,
} from "@/shared/models/pocketbase-types";
import { pb } from "@/shared/lib/pb";

export async function createWebDocs(sourceId: string, results: any[]) {
  const source = await pb.collection("sources").getOne(sourceId, {
    expand: "project",
  });
  const projectId = source.project;
  const orgId = (source.expand as any).project.org;

  const docs: DocumentsResponse[] = [];
  const uniqueURLs = new Set<string>();
  for (const result of results) {
    if (uniqueURLs.has(result.url)) continue;

    let file: File | null = null;
    if (result.success && result.status_code === 200) {
      const blob = new Blob([result.markdown.fit_markdown], {
        type: "text/plain",
      });
      file = new File([blob], `${result.url}.txt`, {
        type: "text/plain",
      });
    }

    const doc = await pb.collection("documents").create({
      source: sourceId,
      title: result?.metadata?.title || result?.url,
      type: "webPage",
      url: result.url,
      status: result.success && result.status_code === 200 ? "idle" : "error",
      previewContent: result.success
        ? result.markdown.fit_markdown
        : result.error_message,
      file,
      metadata: {
        ...result?.metadata,
        orgId,
        sourceId,
        projectId,
        status_code: result.status_code,
        success: result.success,
      },
    });

    docs.push(doc);
    uniqueURLs.add(result.url);
  }
  return docs.filter((d) => d.status === DocumentsStatusOptions.idle);
}
