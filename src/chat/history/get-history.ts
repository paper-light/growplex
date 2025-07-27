import { getEnv } from "../../shared/helpers/get-env";
import { pb } from "../../shared/lib/pb";
import { redisClient } from "../../shared/lib/redis";
import { logger } from "../../shared/lib/logger";

import {
  MessagesEventOptions,
  MessagesRoleOptions,
  type MessagesRecord,
  type MessagesResponse,
} from "../../shared/models/pocketbase-types";
import { globalEncoderService } from "../../llm";

import { updateHistory } from "./update-history";
import { REDIS_PREFIX } from "./config";

const log = logger.child({ module: "chat-history" });
log.info("starting getHistory");

const HISTORY_LENGTH = parseInt(getEnv("CHAT_HISTORY_LENGTH"), 10);

// Alternative approach: Use separate Redis keys for visible vs all messages
// const VISIBLE_REDIS_PREFIX = `${REDIS_PREFIX}visible:`;
// const ALL_REDIS_PREFIX = `${REDIS_PREFIX}all:`;

export async function getHistory(
  integrationId: string,
  roomId: string,
  onlyVisible = true
): Promise<MessagesResponse[]> {
  const redisKey = `${REDIS_PREFIX}${roomId}`;
  log.debug({ integrationId, roomId, redisKey }, "getHistory() start");

  // 1) Try Redis cache
  try {
    const rawCached = await redisClient.lrange(redisKey, -HISTORY_LENGTH, -1);
    if (rawCached.length) {
      log.info({ roomId, count: rawCached.length }, "cache hit");
      const cachedMessages = rawCached.map((r) => JSON.parse(r));

      // Filter cached messages based on onlyVisible parameter
      if (onlyVisible) {
        const visibleMessages = cachedMessages.filter(
          (msg) => msg.visible === true
        );
        log.info(
          {
            roomId,
            totalCached: cachedMessages.length,
            visibleCount: visibleMessages.length,
          },
          "filtered visible messages from cache"
        );
        return visibleMessages;
      }

      return cachedMessages;
    }
    log.info({ roomId }, "cache miss");
  } catch (redisErr) {
    log.error({ err: redisErr, roomId }, "Redis error in getHistory");
  }

  // 2) Fetch from PocketBase
  let msgs: MessagesResponse[] = [];
  try {
    const res = await pb.collection("messages").getList(1, HISTORY_LENGTH, {
      filter: onlyVisible
        ? `room = "${roomId}" && visible = true`
        : `room = "${roomId}"`,
      sort: "-created",
    });

    msgs = res.items.reverse();
    log.info({ roomId, count: msgs.length }, "loaded from PB");
  } catch (pbErr) {
    log.error({ err: pbErr, roomId }, "PocketBase fetch error");
    throw pbErr;
  }

  if (msgs.length > 0) {
    // seed Redis for next time
    // Note: We store ALL messages in Redis (both visible and invisible) to maintain consistency
    // The filtering happens above based on the onlyVisible parameter
    try {
      const pipeline = redisClient.multi();
      msgs.forEach((m) => pipeline.rpush(redisKey, JSON.stringify(m)));
      pipeline.ltrim(redisKey, -HISTORY_LENGTH, -1);
      await pipeline.exec();
      log.debug(
        { roomId, count: msgs.length },
        "cache seeded from PB with all messages"
      );
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

  const agents = await pb.collection("agents").getFullList({
    filter: `integrations_via_agents.id ?= "${integrationId}"`,
  });
  const agent = agents[0];

  const chat = await pb
    .collection("chats")
    .getFirstListItem(`integration = "${integrationId}"`);

  if (!agent || !chat) {
    log.error({ integrationId, roomId }, "no agent or chat found");
    throw new Error("no agent or chat found");
  }

  const welcome: Partial<MessagesRecord> = {
    content: chat.firstMessage,
    role: MessagesRoleOptions.assistant,
    visible: true,
    room: roomId,
    sentBy: agent.name,
    contentTokensCount: globalEncoderService.countTokens(
      chat.firstMessage,
      "gpt-4"
    ),
    metadata: {
      avatar: pb.files.getURL(agent, agent.avatar),
    },
  };

  return await updateHistory([welcome]);
}
