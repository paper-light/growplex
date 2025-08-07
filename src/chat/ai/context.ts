import { logger } from "@/shared/lib/logger";
import { historyLangchainAdapter } from "@/messages/history/langchain-adapter";
import { historyRepository } from "@/messages/history/repository";
import { pb } from "@/shared/lib/pb";
import { RunnableLambda } from "@langchain/core/runnables";

const log = logger.child({ module: "chat:ai:context" });

class Context {
  asLambda() {
    return RunnableLambda.from(async (input: { roomId: string }) => {
      const { roomId } = input;
      return this.loadRoomContext(roomId);
    });
  }

  async loadRoomContext(roomId: string) {
    const room = await pb.collection("rooms").getOne(roomId, {
      expand:
        "lead,chat,chat.integration,chat.integration.agents,chat.integration.sources,chat.project,chat.project.org",
    });

    const lead = (room.expand as any)?.lead;
    const chat = (room.expand as any)?.chat;
    const integration = (chat.expand as any)?.integration;
    const agent = (integration.expand as any)?.agents?.[0];
    const sources = (integration.expand as any)?.sources;
    const org = (chat.expand as any)?.project.expand.org;

    const pbHistory = await historyRepository.getHistory(roomId, false);
    const message = pbHistory[pbHistory.length - 1];
    const history = historyLangchainAdapter.buildLangchainHistory(pbHistory);

    return {
      room,
      lead,
      chat,
      integration,
      agent,
      sources,
      org,
      history,
      message,
    };
  }
}

export const context = new Context();
