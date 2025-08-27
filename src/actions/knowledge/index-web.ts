import { z } from "astro:schema";

import { processDomain } from "@/source/process-domain";
import { charger } from "@/billing/charger";
import { BILLING_GAS_PRICES_PER_CRAWL } from "@/billing/config";

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

    await charger.chargePrice(
      sub.id,
      docs.length * BILLING_GAS_PRICES_PER_CRAWL.price
    );

    return { ok: true, sourceId: source?.id };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
