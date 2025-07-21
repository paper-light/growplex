import { logger } from "../../shared/lib/logger";
import { getEnv } from "../../shared/helpers/get-env";
import { pb } from "../../shared/lib/pb";
import { redisClient } from "../../shared/lib/redis";
import {
  type MessagesRecord,
  type MessagesResponse,
} from "../../shared/models/pocketbase-types";

const log = logger.child({ module: "chat-history" });
log.info("starting getHistory");

const REDIS_PREFIX = getEnv("CHAT_REDIS_PREFIX");
const HISTORY_LENGTH = parseInt(getEnv("CHAT_HISTORY_LENGTH"), 10);

export async function updateHistory(
  msgs: Partial<MessagesRecord>[]
): Promise<MessagesResponse[]> {
  if (msgs.length === 0) {
    log.debug("updateHistory: no messages to persist");
    return [];
  }

  const roomId = msgs[0].room;
  const redisKey = `${REDIS_PREFIX}${roomId}`;
  log.debug({ roomId, count: msgs.length }, "updateHistory() start");

  // 1) Persist to PocketBase - fail if any message fails
  const pbMsgs: MessagesResponse[] = [];
  const failedMessages: Array<{ msg: Partial<MessagesRecord>; error: any }> =
    [];

  for (const msg of msgs) {
    try {
      const created = await pb.collection("messages").create(msg);
      log.debug(
        { roomId, tempId: msg.id, newId: created.id, visible: created.visible },
        "updateHistory: saved to PB"
      );
      pbMsgs.push(created);
    } catch (pbError) {
      log.error(
        { err: pbError, roomId, tempId: msg.id },
        "updateHistory: PB save failed"
      );
      failedMessages.push({ msg, error: pbError });
    }
  }

  // If any messages failed to save, don't update Redis and throw error
  if (failedMessages.length > 0) {
    log.error(
      { roomId, failedCount: failedMessages.length, totalCount: msgs.length },
      "updateHistory: some messages failed to save to PocketBase"
    );
    throw new Error(
      `Failed to save ${failedMessages.length} out of ${msgs.length} messages to PocketBase`
    );
  }

  // 2) Push into Redis only if all PocketBase saves succeeded
  // Note: We store ALL messages in Redis (both visible and invisible) to maintain consistency
  // The filtering happens in getHistory() based on the onlyVisible parameter
  try {
    const pipeline = redisClient.multi();
    for (const msg of pbMsgs) {
      pipeline.rpush(redisKey, JSON.stringify(msg));
    }
    pipeline.ltrim(redisKey, -HISTORY_LENGTH, -1);
    await pipeline.exec();
    log.debug(
      { roomId, count: pbMsgs.length },
      "updateHistory: Redis cache updated with all messages"
    );
  } catch (redisErr) {
    log.error(
      { err: redisErr, roomId },
      "updateHistory: failed to write to Redis"
    );
    // Even if Redis fails, we still have the messages in PocketBase
    // Log the error but don't throw to avoid losing the messages
  }

  log.info({ roomId, count: msgs.length }, "updateHistory: complete");
  return pbMsgs;
}
