import { z } from "astro:schema";

import { indexDocs, reindexDocs } from "@/knowledge/index-docs";
import {
  DocumentsStatusOptions,
  type DocumentsResponse,
} from "@/shared/models/pocketbase-types";

export const IndexDocsSchema = z.object({
  mode: z.enum(["index", "reindex"]).default("index"),
  orgId: z.string(),
  projectId: z.string(),
  docs: z.array(
    z.object({
      id: z.string(),
      status: z.nativeEnum(DocumentsStatusOptions),
      content: z.string(),
      metadata: z.record(z.any()),
    })
  ),
});

export const indexDocsHandler = async (
  input: z.infer<typeof IndexDocsSchema>
) => {
  let fn;
  if (input.mode === "index") {
    fn = indexDocs;
  } else if (input.mode === "reindex") {
    fn = reindexDocs;
  }

  try {
    await fn!(input.orgId, input.projectId, input.docs as DocumentsResponse[]);
    return { ok: true };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
