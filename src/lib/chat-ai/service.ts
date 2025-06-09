import { nanoid } from "nanoid";
import { z } from "zod";

import { pb } from "../config/pb";
import { ChatMessageSchema } from "../../models/chat";

import { chain } from "./llm";
import { getHistory, updateHistory } from "./history";

export async function processAssistantReply(
  chatId: string,
  roomId: string
): Promise<z.infer<typeof ChatMessageSchema>> {
  const history = await getHistory(chatId, roomId);

  const agent = (
    await pb.collection("chats").getOne(chatId, { expand: "agent" })
  ).expand!.agent;

  const llmResp = await chain.invoke({
    history,
    knowledge: agent.knowledgeSources.length || "<NONE>",
    additional: agent.system || "<NONE>",
    contact: agent.contact,
  });

  let newAssistantMsg: z.infer<typeof ChatMessageSchema> = {
    id: `temp-${nanoid(12)}`,
    content: llmResp.content,
    role: "assistant",
    visible: true,
    room: roomId,
    sentBy: agent.name,
    created: new Date().toISOString().replace("T", " "),
  };

  await updateHistory([newAssistantMsg]);

  return newAssistantMsg;
}
