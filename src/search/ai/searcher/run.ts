import type z from "zod";

import { Usager } from "@/billing/usager";
import { langfuseHandler } from "@/shared/lib/langfuse";
import { meiliRetriever } from "@/search/retrievers/hybrid";
import {
  loadRoomMemory,
  type RoomMemory,
} from "@/shared/ai/memories/load-room-memory";

import { EnhancerReturnSchema } from "../enhancer/schemas";
import { SEARCH_SUMMARY_MODEL, summaryBaseModel } from "../summary/llms";
import { SummaryReturnSchema } from "../summary/schemas";
import { summaryPromptTemplate } from "../summary/prompts";

export async function runSearcher(
  roomId: string,
  callConfig: z.infer<typeof EnhancerReturnSchema>,
  memory: RoomMemory | null = null
) {
  const usager = new Usager();
  if (!memory) memory = await loadRoomMemory(roomId);

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
