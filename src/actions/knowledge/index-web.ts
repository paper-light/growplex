import { z } from "astro:schema";

import { processDomain } from "@/knowledge/process-domain";
import { charger } from "@/billing/charger";

export const IndexWebSchema = z.object({
  projectId: z.string(),
  url: z.string(),
  integrationId: z.string().optional(),
  sourceId: z.string().optional(),
});

export const indexWebHandler = async (
  input: z.infer<typeof IndexWebSchema>
) => {
  try {
    const sub = await charger.validateProject(input.projectId);

    const { source, docs } = await processDomain(
      input.projectId,
      input.url,
      input.integrationId,
      input.sourceId
    );

    await charger.chargePrice(sub.id, docs.length * 0.01);

    return { ok: true, sourceId: source.id };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
