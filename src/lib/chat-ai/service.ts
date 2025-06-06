import { z } from "zod";

import { pb } from "@/lib/config/pb";
import { redisClient } from "@/lib/config/redis";
import { llm } from "@/lib/chat-ai/llm";
import { ChatMessageSchema } from "@/models/chat";

import { getHistory, REDIS_PREFIX } from "./history";

export async function processAssistantReply(
  roomId: string
): Promise<z.infer<typeof ChatMessageSchema>> {
  const redisKey = `${REDIS_PREFIX}${roomId}`;

  const history = await getHistory(roomId);

  const llmResp = await llm.invoke(history);

  let newAssistantMsg: z.infer<typeof ChatMessageSchema>;
  try {
    newAssistantMsg = await pb.collection("messages").create({
      content: llmResp.content,
      role: "assistant",
      visible: true,
      room: roomId,
      sentBy: "KATE LOL",
    });
  } catch (pbError) {
    console.error("⚠️ Failed to save assistant message to PB:", pbError);
    newAssistantMsg = {
      id: "temp-" + Date.now().toString(),
      content: llmResp.content,
      role: "assistant",
      visible: true,
      room: roomId,
      sentBy: "KATE LOL",
      created: new Date().toISOString().replace("T", " "),
    } as z.infer<typeof ChatMessageSchema>;
  }

  await redisClient.rpush(redisKey, JSON.stringify(newAssistantMsg));
  await redisClient.ltrim(redisKey, -100, -1);

  return newAssistantMsg;
}
