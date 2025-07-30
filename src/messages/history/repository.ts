import { getEnv } from "@/shared/helpers/get-env";
import { redisClient } from "@/shared/lib/redis";
import { logger } from "@/shared/lib/logger";
import {
  type ChatsResponse,
  type IntegrationsResponse,
  type MessagesResponse,
  type AgentsResponse,
  type MessagesRecord,
  MessagesRoleOptions,
} from "@/shared/models/pocketbase-types";
import { pb } from "@/shared/lib/pb";
import { embedder } from "@/search/embedder";
import { RunnableLambda } from "@langchain/core/runnables";
import { getContextVariable } from "@langchain/core/context";
import { historyLangchainAdapter } from "./langchain-adapter";

const HISTORY_TOKENS = parseInt(getEnv("HISTORY_TOKENS"), 10);
const MAX_MSG_TOKENS = parseInt(getEnv("PUBLIC_CHAT_MAX_MESSAGE_TOKENS"), 10);
const REDIS_PREFIX = "messages:history:";

const log = logger.child({ module: "messages:history:repository" });

class HistoryRepository {
  private lengthProximation = Math.ceil((HISTORY_TOKENS / MAX_MSG_TOKENS) * 2);

  getAsLambda() {
    return RunnableLambda.from(async () => {
      const room = getContextVariable("room");
      if (!room) {
        throw new Error("room is required");
      }
      const pbHistory = await this.getHistory(room.id, false);
      const history = historyLangchainAdapter.buildLangchainHistory(pbHistory);

      return { history };
    });
  }

  // Public API
  async getHistory(
    roomId: string,
    onlyVisible: boolean
  ): Promise<MessagesResponse[]> {
    const redisKey = `${REDIS_PREFIX}${roomId}`;
    log.debug({ roomId, redisKey }, "getHistory() start");

    // 1) Try Redis cache
    try {
      const cachedMessages = await this.getCachedHistory(roomId);
      if (cachedMessages.length) {
        log.debug({ roomId, count: cachedMessages.length }, "cache hit");
        return await this.trimHistory(cachedMessages, onlyVisible);
      }
    } catch (error) {
      log.error({ error }, "getHistory() error");
      throw error;
    }

    // 2) Try DB
    try {
      const msgs = await this.seedCacheFromPB(roomId);
      if (msgs.length > 0) return await this.trimHistory(msgs, onlyVisible);
    } catch (error) {
      log.error({ error }, "getHistory() error");
      throw error;
    }

    // 3) Seed with firstMessage
    try {
      log.debug(
        { roomId },
        "no history found in PB and cache, seeding firstMessage"
      );
      return await this.seedHistory(roomId);
    } catch (error) {
      log.error({ error }, "getHistory() error");
      throw error;
    }
  }

  async updateHistory(messages: Partial<MessagesRecord>[]) {
    const roomId = messages[0].room;
    if (!roomId) {
      log.error({ messages }, "updateHistory() error");
      throw new Error("roomId is required");
    }

    const msgPromises = messages.map((m) =>
      pb.collection("messages").create(m)
    );
    const createdMessages = await Promise.all(msgPromises);

    log.debug({ roomId, count: messages.length }, "updated history");

    await this.updateCacheIncrementally(roomId, createdMessages);

    return createdMessages;
  }

  private async updateCacheIncrementally(
    roomId: string,
    newMessages: MessagesResponse[]
  ) {
    const redisKey = this.getRedisKey(roomId);

    try {
      const pipeline = redisClient.multi();

      // Add new messages to the right side of the list
      newMessages.forEach((m) => pipeline.rpush(redisKey, JSON.stringify(m)));

      // Keep only the last N messages to prevent unbounded growth
      pipeline.ltrim(redisKey, -this.lengthProximation, -1);

      await pipeline.exec();
      log.debug(
        { roomId, count: newMessages.length },
        "cache updated incrementally"
      );

      // Return the updated cache
      return await this.getCachedHistory(roomId);
    } catch (error) {
      log.error({ error, roomId }, "failed to update cache incrementally");
      // Fallback to full rebuild
      try {
        return await this.seedCacheFromPB(roomId);
      } catch (rebuildError) {
        log.error(
          { error: rebuildError, roomId },
          "failed to rebuild cache, returning empty array"
        );
        return [];
      }
    }
  }

  private async trimHistory(history: MessagesResponse[], onlyVisible = true) {
    let totalTokens = 0;
    const trimmedHistory: MessagesResponse[] = [];
    for (const msg of history) {
      if (onlyVisible && !msg.visible) continue;
      totalTokens += msg.contentTokensCount;
      trimmedHistory.push(msg);
      if (totalTokens > HISTORY_TOKENS) break;
    }
    return trimmedHistory;
  }

  private async getCachedHistory(roomId: string) {
    const redisKey = this.getRedisKey(roomId);
    const rawCached = await redisClient.lrange(
      redisKey,
      -this.lengthProximation,
      -1
    );
    return rawCached.map((r) => JSON.parse(r)) as MessagesResponse[];
  }

  private async seedHistory(roomId: string) {
    log.warn(
      { roomId },
      "no history found in PB and cache, seeding firstMessage"
    );

    const room = await pb.collection("rooms").getOne(roomId, {
      expand: "chat,chat.integration,chat.integration.agents",
    });

    const chat: ChatsResponse = (room.expand as any).chat as ChatsResponse;
    const integration: IntegrationsResponse = (chat.expand as any)
      .integration as IntegrationsResponse;
    const agent: AgentsResponse = (integration.expand as any)
      .agents?.[0] as AgentsResponse;

    if (!chat || !integration || !agent) {
      log.error(
        {
          roomId,
          chatId: chat?.id,
          integrationId: integration?.id,
          agentId: agent?.id,
        },
        "no chat, integration or agent found"
      );
      throw new Error("no chat, integration or agent found");
    }

    const welcome: Partial<MessagesRecord> = {
      content: chat.firstMessage,
      role: MessagesRoleOptions.assistant,
      visible: true,
      room: roomId,
      sentBy: agent.name,
      contentTokensCount: embedder.countTokens(chat.firstMessage, "gpt-4"),
      metadata: agent?.avatar
        ? {
            avatar: pb.files.getURL(agent, agent.avatar),
          }
        : undefined,
    };

    await pb.collection("messages").create(welcome);
    return await this.seedCacheFromPB(roomId);
  }

  async seedCacheFromPB(roomId: string) {
    const redisKey = this.getRedisKey(roomId);
    let msgs: MessagesResponse[] = [];

    // 1) Load from PB
    try {
      const res = await pb
        .collection("messages")
        .getList(1, this.lengthProximation, {
          filter: `room = "${roomId}"`,
          sort: "-created",
        });
      msgs = res.items.reverse();
      log.info({ roomId, count: msgs.length }, "loaded from PB");
    } catch (pbErr) {
      log.error({ err: pbErr, roomId }, "PocketBase fetch error");
      throw pbErr;
    }

    // 2) Seed cache - replace entire cache with fresh data
    if (msgs.length > 0) {
      try {
        const pipeline = redisClient.multi();
        // Clear existing cache first
        pipeline.del(redisKey);
        // Add all messages
        msgs.forEach((m) => pipeline.rpush(redisKey, JSON.stringify(m)));
        await pipeline.exec();
        log.debug(
          { roomId, count: msgs.length },
          "cache seeded from PB with all messages"
        );
      } catch (seedErr) {
        log.error({ err: seedErr, roomId }, "failed to seed cache");
      }
    }

    return msgs;
  }

  private getRedisKey(roomId: string) {
    return `${REDIS_PREFIX}${roomId}`;
  }
}

export const historyRepository = new HistoryRepository();
