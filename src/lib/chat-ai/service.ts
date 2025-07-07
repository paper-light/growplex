import { nanoid } from "nanoid";
import { z } from "zod";

import { pb } from "../config/pb";
import { ChatMessageSchema, IntegrationSchema, OrgSchema } from "../../models";

import { getChain } from "./llm";
import { getHistory, updateHistory } from "./history";
import { logger } from "../config/logger";
import { extractorService } from "../rag/extractor";
import { createDocumentIdsFilter } from "../rag/filters";
import { Document } from "@langchain/core/documents";

const log = logger.child({ module: "chat-service" });

export async function processAssistantReply(
  integrationId: string,
  roomId: string
): Promise<z.infer<typeof ChatMessageSchema>> {
  // Get integration
  const integration = IntegrationSchema.parse(
    await pb.collection("integrations").getOne(integrationId, {
      expand:
        "agent,sources,projects_via_integrations,projects_via_integrations.orgs_via_projects",
    })
  );

  const org = OrgSchema.parse(
    integration
      .expand!.projects_via_integrations.map(
        (p: any) => p.expand!.orgs_via_projects
      )
      .flat()[0]!
  );

  const agent = integration.expand!.agent;
  const sources = integration.expand!.sources;

  if (!agent) {
    log.warn(`Integration ${integrationId} has not agent`);
    throw Error(`Integration ${integrationId} has not agent`);
  }

  const docIds = sources?.map((s) => s.documents).flat() || [];

  // Prepare history
  const history = (await getHistory(integrationId, roomId)).map((m) => {
    return {
      content: m.content,
      role: m.role === "operator" ? "user" : m.role,
      name: `${m.role}-${m.sentBy.replace(/[\s<|\\/>\:]+/g, "_")}`,
    };
  });

  // Get knowledge
  const retriever = await extractorService.createRetriever(org.id, {
    filter: createDocumentIdsFilter(docIds),
  });
  const knowledge = await retriever
    .pipe((documents: Document[]) => {
      return documents.map((document) => document.pageContent).join("\n\n");
    })
    .invoke(history.at(-1)!.content);

  console.log("KNOWLEDGE", knowledge, "MSG", history.at(-1)!.content);

  // Get template + LLM
  const chain = getChain(agent.provider);

  // Call LLM
  const llmResp = await chain.invoke({
    history,
    knowledge,
    additional: agent.system || "<NONE>",
  });

  log.debug(llmResp);

  let newAssistantMsg: z.infer<typeof ChatMessageSchema> = {
    id: `temp-${nanoid(12)}`,
    content: llmResp.content.toString(),
    role: "assistant",
    visible: true,
    room: roomId,
    sentBy: agent.name,
    created: new Date().toISOString().replace("T", " "),
  };

  await updateHistory([newAssistantMsg]);

  return newAssistantMsg;
}
