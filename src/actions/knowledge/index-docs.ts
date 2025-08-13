import { z } from "astro:schema";

import { indexDocs, reindexDocs } from "@/document/index-docs";
import { logger } from "@/shared/lib/logger";

const log = logger.child({
  module: "actions:knowledge:index-docs",
});

export const IndexDocsSchema = z.object({
  sourceId: z.string(),
  docs: z.array(z.any()),
});

export const indexDocsHandler = async (
  input: z.infer<typeof IndexDocsSchema>
) => {
  try {
    await Promise.all([
      reindexDocs(
        input.sourceId,
        input.docs.filter((doc) => doc.status === "unsynced")
      ),
      indexDocs(
        input.sourceId,
        input.docs.filter((doc) => doc.status === "idle")
      ),
    ]);

    return { ok: true };
  } catch (err) {
    log.error({ err }, "Error indexing docs");
    throw err;
  }
};
