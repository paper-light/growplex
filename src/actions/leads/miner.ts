import { z } from "astro:schema";

import { logger } from "@/shared/lib/logger";
import { runMiner } from "@/leads/ai/miner/run";
import { charger } from "@/billing";

const log = logger.child({
  module: "actions:leads:miner",
});

export const MinerSchema = z.object({
  projectId: z.string(),
  query: z.string(),
});

export const minerHandler = async ({
  projectId,
  query,
}: z.infer<typeof MinerSchema>) => {
  try {
    const sub = await charger.validateProject(projectId);
    const { leads } = await runMiner(query, projectId, sub.id);

    return { leads };
  } catch (err) {
    log.error(err);
    throw err;
  }
};
