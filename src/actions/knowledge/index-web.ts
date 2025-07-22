import { z } from "astro:schema";

import { processDomain } from "../../knowledge/process-domain";

export const IndexWebSchema = z.object({
  projectId: z.string(),
  url: z.string(),
});

export const indexWebHandler = async (
  input: z.infer<typeof IndexWebSchema>
) => {
  try {
    const { source } = await processDomain(input.projectId, input.url);
    return { ok: true, sourceId: source.id };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
