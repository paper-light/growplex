import { logger } from "@/shared/lib/logger";
import { Usager } from "@/billing/usager";
import { deepCrawlUrls } from "@/crawler";
import {
  BILLING_GAS_PRICES_PER_CRAWL,
  BILLING_GAS_PRICES_PER_SEARCH,
} from "@/billing/config";
import { braveSearch } from "@/search/web/brave-search";
import { pb } from "@/shared/lib/pb";
import { charger } from "@/billing";

import { LeadsResponseSchema } from "./schemas";
import { MINER_MODEL, minerBaseModel } from "./llms";
import { minerPromptTemplate } from "./prompts";

const log = logger.child({
  module: "leads:ai:miner:run",
});

// export type RunMinerConfig = {};

export async function runMiner(
  query: string,
  projectId: string,
  subscriptionId: string
) {
  log.debug({ query }, "Brave search query");
  const urls = (await braveSearch.search(query)).map((r: any) => r.url);
  await charger.chargePrice(
    subscriptionId,
    BILLING_GAS_PRICES_PER_SEARCH.brave
  );
  log.debug({ urls }, "Brave search results");

  // Create query source and index results?
  const leads = await Promise.all(
    urls.map(async (url: string) => {
      const usager = new Usager();

      const results = await deepCrawlUrls([url], false, false, 5, 2);
      await charger.chargePrice(
        subscriptionId,
        BILLING_GAS_PRICES_PER_CRAWL.price
      );

      const fits: string[] = results
        .filter((r: any) => r.success && r.status_code === 200)
        .map((r: any) => r.markdown.fit_markdown);
      log.debug({ fits: fits.length }, "Fits length");

      const result = await minerPromptTemplate
        .pipe(
          minerBaseModel.withStructuredOutput(LeadsResponseSchema, {
            includeRaw: true,
          })
        )
        .invoke({
          pageText: fits.join("\n"),
        });

      usager.updateMetadataUsage(
        (result.raw as any).usage_metadata,
        MINER_MODEL
      );

      const price = usager.calculatePrice();
      await charger.chargePrice(subscriptionId, price);

      log.debug({ result: result.parsed }, "Miner result");
      const dtos = result.parsed.leads;
      const leads = await Promise.all(
        dtos.map(async (dto: any) => {
          return await pb.collection("leads").create({
            ...dto,
            project: projectId,
            level: "cold",
          });
        })
      );

      return leads;
    })
  );

  return {
    leads: leads.flat(),
  };
}
