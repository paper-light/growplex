import { z } from "zod";

import { ChatMessageSchema } from "../../models/chat";

import { getEnv } from "../../helpers/get-env";
import { pb } from "../config/pb";
import { redisClient } from "../config/redis";

const REDIS_PREFIX = getEnv("CHAT_REDIS_PREFIX");
const HISTORY_LENGTH = parseInt(getEnv("CHAT_HISTORY_LENGTH"));

export async function getHistory(
  roomId: string
): Promise<z.infer<typeof ChatMessageSchema>[]> {
  const redisKey = `${REDIS_PREFIX}${roomId}`;

  const rawHistory = await redisClient.lrange(redisKey, -HISTORY_LENGTH, -1);
  if (rawHistory.length > 0) {
    return rawHistory.map((raw) => JSON.parse(raw));
  }

  const pbResp = await pb.collection("messages").getList(1, HISTORY_LENGTH, {
    filter: `room = "${roomId}" & visible = true`,
    sort: "created",
  });

  const toStore = pbResp.items.map((msg) => JSON.stringify(msg));
  if (toStore.length > 0) {
    await Promise.all(toStore.map((raw) => redisClient.rpush(redisKey, raw)));
    await redisClient.ltrim(redisKey, -HISTORY_LENGTH, -1);
  }

  return z.array(ChatMessageSchema).parse(pbResp.items);
}

export async function updateHistory(
  msgs: z.infer<typeof ChatMessageSchema>[]
): Promise<void> {
  if (msgs.length === 0) return;

  const roomId = msgs[0].room;
  const redisKey = `${REDIS_PREFIX}${roomId}`;

  const pipeline = redisClient.multi();
  for (const msg of msgs) {
    pipeline.rpush(redisKey, JSON.stringify(msg));
  }
  pipeline.ltrim(redisKey, -HISTORY_LENGTH, -1);
  await pipeline.exec();

  for (const msg of msgs) {
    try {
      await pb.collection("messages").create({
        sentBy: msg.sentBy,
        visible: msg.visible,
        role: msg.role,
        content: msg.content,
        room: msg.room,
      });
    } catch (pbError) {
      console.warn("⚠️ Failed to save message to PB:", pbError);
    }
  }
}
