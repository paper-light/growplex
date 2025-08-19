import type z from "zod";

import { Usager } from "@/billing/usager";
import { langfuseHandler } from "@/shared/lib/langfuse";
import { meiliRetriever } from "@/search/retrievers/hybrid";

import { EnhancerReturnSchema } from "../enhancer/schemas";
import { loadSearchMemory, type SearchMemory } from "./memories";
import { SEARCH_SUMMARY_MODEL, summaryBaseModel } from "../summary/models";
import { SummaryReturnSchema } from "../summary/schemas";
import { summaryPromptTemplate } from "../summary/prompts";

export async function runSearchWorkflow(
  roomId: string,
  callConfig: z.infer<typeof EnhancerReturnSchema>,
  memory: SearchMemory | null = null
) {
  const usager = new Usager();
  if (!memory) memory = await loadSearchMemory(roomId);

  // DETERMINISTIC LOGIC
  const query = `
Enhanced query: ${callConfig.enhancedQuery}
Keywords: ${callConfig.keywords.join(", ")}
Entities: ${callConfig.entities.join(", ")}
`;
  const { hits } = await meiliRetriever.retrieve(
    query,
    memory.org.id,
    memory.sources.map((s) => s.id)
  );
  const searchResult = hits.map((hit) => hit.content).join("\n");
  const result = await summaryPromptTemplate
    .pipe(
      summaryBaseModel.withStructuredOutput(SummaryReturnSchema, {
        includeRaw: true,
      })
    )
    .invoke(
      {
        query,
        searchResult,
      },
      {
        callbacks: [langfuseHandler],
      }
    );

  usager.updateMetadataUsage(
    (result.raw as any).usage_metadata,
    SEARCH_SUMMARY_MODEL
  );

  return { result: result.parsed, usage: usager.get() };
}
