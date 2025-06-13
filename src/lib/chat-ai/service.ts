import { nanoid } from "nanoid";
import { z } from "zod";

import { pb } from "../config/pb";
import { ChatMessageSchema, IntegrationSchema } from "../../models";

import { getChain } from "./llm";
import { getHistory, updateHistory } from "./history";
import { logger } from "../config/logger";

const log = logger.child({ module: "chat-service" });

export async function processAssistantReply(
  integrationId: string,
  roomId: string
): Promise<z.infer<typeof ChatMessageSchema>> {
  const history = (await getHistory(integrationId, roomId)).map((m) => {
    return {
      content: m.content,
      role: m.role,
      name: `${m.role}-${m.sentBy.replace(/[\s<|\\/>\:]+/g, "_")}`,
    };
  });

  const integration = IntegrationSchema.parse(
    await pb
      .collection("integrations")
      .getOne(integrationId, { expand: "agent" })
  );
  const agent = integration.expand!.agent;

  if (!agent) {
    log.warn(`Integration ${integrationId} has not agent`);
    throw Error(`Integration ${integrationId} has not agent`);
  }

  const chain = getChain(agent.provider);

  const llmResp = await chain.invoke({
    history,
    knowledge: integration.knowledgeSources.length || "<NONE>",
    additional: agent.system || "<NONE>",
    contact: agent.contact || "<NONE>",
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
