import { z } from "zod";
import { nanoid } from "nanoid";

import { ChatMessageSchema, IntegrationSchema } from "../../models";
import { getEnv } from "../../helpers/get-env";
import { pb } from "../config/pb";
import { redisClient } from "../config/redis";
import { logger } from "../config/logger";
import { globalEncoderService } from "./encoder";

const log = logger.child({ module: "chat-history" });
log.info("starting getHistory");

const REDIS_PREFIX = getEnv("CHAT_REDIS_PREFIX");
const HISTORY_LENGTH = parseInt(getEnv("CHAT_HISTORY_LENGTH"), 10);

export async function getHistory(
  integrationId: string,
  roomId: string
): Promise<z.infer<typeof ChatMessageSchema>[]> {
  const redisKey = `${REDIS_PREFIX}${roomId}`;
  log.debug({ integrationId, roomId, redisKey }, "getHistory() start");

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
    const res = await pb.collection("messages").getList(1, HISTORY_LENGTH, {
      filter: `room = "${roomId}" && visible = true`,
      sort: "-created",
    });

    // reverse into chronological order
    msgs = z.array(ChatMessageSchema).parse(res.items.reverse());
    log.info({ roomId, count: msgs.length }, "loaded from PB");
  } catch (pbErr) {
    log.error({ err: pbErr, roomId }, "PocketBase fetch error");
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
  log.warn(
    { integrationId, roomId },
    "no history found in PB, seeding firstMessage"
  );
  const integration = IntegrationSchema.parse(
    await pb
      .collection("integrations")
      .getOne(integrationId, { expand: "agent,chat" })
  );
  const agent = integration.expand!.agent;
  const chat = integration.expand!.chat;

  if (!agent || !chat) {
    log.error({ integrationId, roomId }, "no agent or chat found");
    throw new Error("no agent or chat found");
  }

  const welcome: z.infer<typeof ChatMessageSchema> = {
    id: `temp-${nanoid(12)}`,
    content: chat.firstMessage,
    role: "assistant",
    visible: true,
    room: roomId,
    sentBy: agent.name,
    created: new Date().toISOString().replace("T", " "),
  };

  const ids = await updateHistory([welcome]);
  welcome.id = ids[0];
  return [welcome];
}

export async function updateHistory(
  msgs: z.infer<typeof ChatMessageSchema>[]
): Promise<string[]> {
  if (msgs.length === 0) {
    log.debug("updateHistory: no messages to persist");
    return [];
  }

  const roomId = msgs[0].room;
  const redisKey = `${REDIS_PREFIX}${roomId}`;
  log.debug({ roomId, count: msgs.length }, "updateHistory() start");

  // 1) Persist to PocketBase
  const pbMsgs: z.infer<typeof ChatMessageSchema>[] = [];
  for (const msg of msgs) {
    try {
      const created = await pb.collection("messages").create({
        sentBy: msg.sentBy,
        visible: msg.visible,
        role: msg.role,
        content: msg.content,
        room: msg.room,
        tokenCount: globalEncoderService.countTokens(msg.content, "gpt-4"),
      });
      log.debug(
        { roomId, tempId: msg.id, newId: created.id },
        "updateHistory: saved to PB"
      );
      pbMsgs.push(ChatMessageSchema.parse(created));
    } catch (pbError) {
      log.warn(
        { err: pbError, roomId, tempId: msg.id },
        "updateHistory: PB save failed"
      );
    }
  }

  // 2) Push into Redis
  try {
    const pipeline = redisClient.multi();
    for (const msg of pbMsgs) {
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

  log.info({ roomId, count: msgs.length }, "updateHistory: complete");
  return pbMsgs.map((m) => m.id);
}
