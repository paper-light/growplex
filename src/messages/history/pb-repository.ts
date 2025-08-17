import { pb } from "@/shared/lib/pb";
import { CHAT_CONFIG } from "@/chat/config";
import type {
  AgentsResponse,
  ChatsResponse,
  IntegrationsResponse,
  MessagesRecord,
  MessagesResponse,
} from "@/shared/models/pocketbase-types";
import { logger } from "@/shared/lib/logger";
import { chunker } from "@/search/chunker";

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

    const history = await this.trimHistory(res.items.reverse(), onlyVisible);
    if (history.length === 0) {
      const room = await pb.collection("rooms").getOne(roomId, {
        expand: "chat,chat.integration,chat.integration.agents",
      });
      const chat: ChatsResponse = (room.expand as any).chat;
      const integration: IntegrationsResponse = (chat.expand as any)
        .integration;
      const agent: AgentsResponse = (integration.expand as any).agents[0];

      const welcomeMessage = await pb.collection("messages").create({
        room: roomId,
        role: "assistant",
        content: chat.firstMessage,
        contentTokensCount: chunker.countTokens(chat.firstMessage, "gpt-4"),
        sentBy: agent.id,
        visible: true,
      });
      history.push(welcomeMessage);
    }

    return history;
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
