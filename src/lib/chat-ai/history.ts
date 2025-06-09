import { z } from "zod";
import { nanoid } from "nanoid";

import { ChatMessageSchema, ChatSchema } from "../../models/chat";
import { getEnv } from "../../helpers/get-env";
import { pb } from "../config/pb";
import { redisClient } from "../config/redis";
import { logger } from "../config/logger";

const log = logger.child({ module: "chat-history" });
log.info("starting getHistory");

const REDIS_PREFIX = getEnv("CHAT_REDIS_PREFIX");
const HISTORY_LENGTH = parseInt(getEnv("CHAT_HISTORY_LENGTH"), 10);

export async function getHistory(
  chatId: string,
  roomId: string
): Promise<z.infer<typeof ChatMessageSchema>[]> {
  const redisKey = `${REDIS_PREFIX}${roomId}`;
  log.debug({ chatId, roomId, redisKey }, "getHistory() start");

  // 1) Try Redis cache
  try {
    const rawCached = await redisClient.lrange(redisKey, -HISTORY_LENGTH, -1);
    if (rawCached.length) {
      log.info({ roomId, count: rawCached.length }, "cache hit");
      return rawCached.map((r) => JSON.parse(r));
    }
    log.info({ roomId }, "cache miss");
  } catch (redisErr) {
    log.error({ err: redisErr, roomId }, "Redis error in getHistory");
  }

  // 2) Fetch from PocketBase
  let msgs: z.infer<typeof ChatMessageSchema>[] = [];
  try {
    const pbResp = await pb.collection("messages").getList(1, HISTORY_LENGTH, {
      filter: `room = "${roomId}" && visible = true`,
      sort: "-created",
    });

    // reverse into chronological order
    msgs = z.array(ChatMessageSchema).parse(pbResp.items.reverse());
    log.info({ roomId, count: msgs.length }, "loaded from PB");
  } catch (pbErr) {
    log.error({ err: pbErr, roomId }, "PocketBase fetch error");
    // bubble up so caller can handle (e.g. emit empty history or an error)
    throw pbErr;
  }

  if (msgs.length > 0) {
    // seed Redis for next time
    try {
      const pipeline = redisClient.multi();
      msgs.forEach((m) => pipeline.rpush(redisKey, JSON.stringify(m)));
      pipeline.ltrim(redisKey, -HISTORY_LENGTH, -1);
      await pipeline.exec();
      log.debug({ roomId }, "cache seeded from PB");
    } catch (seedErr) {
      log.error({ err: seedErr, roomId }, "failed to seed cache");
    }
    return msgs;
  }

  // 3) No messages in PB → seed with firstMessage
  log.warn({ chatId, roomId }, "no history found in PB, seeding firstMessage");
  const chat = ChatSchema.parse(
    await pb.collection("chats").getOne(chatId, { expand: "agent" })
  );
  const agent = chat.expand!.agent;
  const welcome: z.infer<typeof ChatMessageSchema> = {
    id: `temp-${nanoid(12)}`,
    content: chat.firstMessage,
    role: "assistant",
    visible: true,
    room: roomId,
    sentBy: agent.name,
    created: new Date().toISOString().replace("T", " "),
  };

  await updateHistory([welcome]);
  return [welcome];
}

export async function updateHistory(
  msgs: z.infer<typeof ChatMessageSchema>[]
): Promise<void> {
  if (msgs.length === 0) {
    log.debug("updateHistory: no messages to persist");
    return;
  }

  const roomId = msgs[0].room;
  const redisKey = `${REDIS_PREFIX}${roomId}`;
  log.debug({ roomId, count: msgs.length }, "updateHistory() start");

  // 1) Push into Redis
  try {
    const pipeline = redisClient.multi();
    for (const msg of msgs) {
      pipeline.rpush(redisKey, JSON.stringify(msg));
    }
    pipeline.ltrim(redisKey, -HISTORY_LENGTH, -1);
    await pipeline.exec();
    log.debug({ roomId }, "updateHistory: Redis cache updated");
  } catch (redisErr) {
    log.error(
      { err: redisErr, roomId },
      "updateHistory: failed to write to Redis"
    );
  }

  // 2) Persist to PocketBase
  for (const msg of msgs) {
    try {
      const created = await pb.collection("messages").create({
        sentBy: msg.sentBy,
        visible: msg.visible,
        role: msg.role,
        content: msg.content,
        room: msg.room,
      });
      log.debug(
        { roomId, tempId: msg.id, newId: created.id },
        "updateHistory: saved to PB"
      );
    } catch (pbError) {
      log.warn(
        { err: pbError, roomId, tempId: msg.id },
        "updateHistory: PB save failed"
      );
    }
  }

  log.info({ roomId, count: msgs.length }, "updateHistory: complete");
}
