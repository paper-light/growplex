import { z } from "astro:schema";

import { indexDocs, reindexDocs } from "@/knowledge/index-docs";
import type { DocumentsResponse } from "@/shared/models/pocketbase-types";

export const IndexDocsSchema = z.object({
  mode: z.enum(["index", "reindex"]).default("index"),
  sourceId: z.string(),
  docs: z.array(z.any()),
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
    await fn!(input.sourceId, input.docs as DocumentsResponse[]);
    return { ok: true };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
