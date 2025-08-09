import { z } from "astro:schema";

import { crawlUrls } from "@/crawler/crawl";
import { pb } from "@/shared/lib/pb";
import {
  DocumentsStatusOptions,
  DocumentsTypeOptions,
  type DocumentsResponse,
} from "@/shared/models/pocketbase-types";
import { logger } from "@/shared/lib/logger";

const log = logger.child({
  module: "actions:crawler",
});

export const CrawlUrlSchema = z.object({
  url: z.string().url(),
  sourceId: z.string().optional(),
  documentId: z.string().optional(),
});

export const crawlUrlHandler = async (
  input: z.infer<typeof CrawlUrlSchema>
) => {
  try {
    let document: DocumentsResponse;
    if (input.documentId) {
      document = await pb.collection("documents").getOne(input.documentId);
      if (!document) throw new Error("Document not found");
    } else {
      document = await pb.collection("documents").create({
        title: input.url,
        type: DocumentsTypeOptions.webPage,
        status: DocumentsStatusOptions.idle,
      });
    }

    const docIndexed = document.status === "indexed";

    await pb.collection("documents").update(document.id, {
      status: docIndexed ? "indexed" : "crawling",
      type: "webPage",
      url: input.url,
    });

    try {
      const res = (await crawlUrls([input.url]))[0];

      if (!res.success || res.status_code !== 200) {
        await pb.collection("documents").update(document.id, {
          status: docIndexed ? "indexed" : "error",
          content: docIndexed ? document.content : res.error_message,
          url: docIndexed ? document.url : res.url,
        });
        return { ok: false, error: res.error_message };
      }

      const blob = new Blob([res.markdown.fit_markdown], {
        type: "text/plain",
      });
      const file = new File([blob], `${document.id}.txt`, {
        type: "text/plain",
      });

      await pb.collection("documents").update(document.id, {
        content: res.markdown.fit_markdown,
        file,
        url: res.url,
        status: docIndexed ? "unsynced" : "idle",
        metadata: {
          ...(document.metadata || {}),
          ...(res.metadata || {}),
          sourceId: document.source,
          documentId: document.id,
        },
      });

      return { ok: true };
    } catch (err) {
      await pb.collection("documents").update(document.id, {
        status: docIndexed ? "indexed" : "error",
        content: docIndexed ? document.content : "Error crawling URL",
        url: docIndexed ? document.url : input.url,
      });
      throw err;
    }
  } catch (err) {
    log.error(err);
    return { ok: false, error: "Error crawling URL" };
  }
};
