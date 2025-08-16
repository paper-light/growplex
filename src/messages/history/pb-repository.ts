import { pb } from "@/shared/lib/pb";
import { CHAT_CONFIG } from "@/chat/config";
import type {
  MessagesRecord,
  MessagesResponse,
} from "@/shared/models/pocketbase-types";
import { logger } from "@/shared/lib/logger";

const HISTORY_TOKENS = CHAT_CONFIG.MAX_HISTORY_TOKENS;
const MAX_MSG_TOKENS = CHAT_CONFIG.MAX_MSG_TOKENS;

const log = logger.child({ module: "messages:history:pb-repository" });

export class PBHistoryRepository {
  private lengthProximation = Math.ceil((HISTORY_TOKENS / MAX_MSG_TOKENS) * 2);

  async getHistory(roomId: string, onlyVisible: boolean) {
    const res = await pb
      .collection("messages")
      .getList(1, this.lengthProximation, {
        filter: `room = "${roomId}"${onlyVisible ? " && visible = true" : ""}`,
        sort: "-created",
      });

    return await this.trimHistory(res.items.reverse(), onlyVisible);
  }

  async replaceMessage(msgId: string, msg: Partial<MessagesRecord>) {
    const res = await pb.collection("messages").update(msgId, msg);
    return res;
  }

  async updateHistory(messages: Partial<MessagesRecord>[]) {
    const roomId = messages[0].room;
    if (!roomId) {
      log.error({ messages }, "updateHistory() error");
      throw new Error("roomId is required");
    }

    const createdMessages: MessagesResponse[] = [];
    for (const msg of messages) {
      const createdMsg = await pb.collection("messages").create(msg);
      createdMessages.push(createdMsg);
    }

    return createdMessages;
  }

  private async trimHistory(history: MessagesResponse[], onlyVisible = true) {
    let totalTokens = 0;
    const trimmedHistory: MessagesResponse[] = [];

    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      if (onlyVisible && !msg.visible) continue;

      if (totalTokens + msg.contentTokensCount > HISTORY_TOKENS) break;

      totalTokens += msg.contentTokensCount;
      trimmedHistory.unshift(msg);
    }

    return trimmedHistory;
  }
}

export const pbHistoryRepository = new PBHistoryRepository();
