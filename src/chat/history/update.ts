import { logger } from "../../shared/lib/logger";
import { getEnv } from "../../shared/helpers/get-env";
import { pb } from "../../shared/lib/pb";
import { redisClient } from "../../shared/lib/redis";
import { globalEncoderService } from "../../llm";
import {
  type MessagesRecord,
  type MessagesResponse,
} from "../../shared/models/pocketbase-types";

const log = logger.child({ module: "chat-history" });
log.info("starting getHistory");

const REDIS_PREFIX = getEnv("CHAT_REDIS_PREFIX");
const HISTORY_LENGTH = parseInt(getEnv("CHAT_HISTORY_LENGTH"), 10);

export async function updateHistory(msgs: MessagesRecord[]): Promise<string[]> {
  if (msgs.length === 0) {
    log.debug("updateHistory: no messages to persist");
    return [];
  }

  const roomId = msgs[0].room;
  const redisKey = `${REDIS_PREFIX}${roomId}`;
  log.debug({ roomId, count: msgs.length }, "updateHistory() start");

  // 1) Persist to PocketBase
  const pbMsgs: MessagesResponse[] = [];
  for (const msg of msgs) {
    try {
      const created = await pb.collection("messages").create({
        sentBy: msg.sentBy,
        visible: msg.visible,
        role: msg.role,
        content: msg.content,
        room: msg.room,
        metadata: msg.metadata,
        tokenCount: globalEncoderService.countTokens(msg.content, "gpt-4"),
      });
      log.debug(
        { roomId, tempId: msg.id, newId: created.id },
        "updateHistory: saved to PB"
      );
      pbMsgs.push(created);
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
