import { pb } from "@/shared/lib/pb";
import { settingsProvider } from "@/user/settings.svelte";
import type { ChatsResponse } from "@/shared/models/pocketbase-types";
import { integrationsProvider } from "@/integration/providers/integrations.svelte";

class ChatsProvider {
  // STATE
  private subscribed = false;

  private _chats: ChatsResponse[] = $state([]);

  chats = $derived.by(() => {
    return this._chats.filter((c) => c.type !== "inner");
  });

  integrationChats = $derived.by(() => {
    const integration = integrationsProvider.selectedIntegration;
    if (this.chats.length == 0 || !integration) return [];

    return this.chats.filter((c) => c.integration === integration.id);
  });

  innerChat = $derived.by(() => {
    const integration = integrationsProvider.selectedIntegration;
    if (this.chats.length == 0 || !integration) return null;

    return this._chats.find(
      (c) => c.type === "inner" && c.integration === integration.id
    );
  });

  // Global selected across all chats
  selectedChat = $derived.by(() => {
    if (!this.chats.length) return null;

    if (settingsProvider.selectedChatId) {
      const found = this.chats.find(
        (r) => r.id === settingsProvider.selectedChatId
      );
      if (found) return found;
    }

    return this.chats[0];
  });

  // Selected chat for Wizard widget mostly
  selectedIntegrationChat = $derived.by(() => {
    if (this.integrationChats.length == 0) return null;

    if (settingsProvider.selectedIntegrationChatId) {
      const found = this.integrationChats.find(
        (r) => r.id === settingsProvider.selectedIntegrationChatId
      );
      if (found) return found;
    }

    return this.integrationChats[0];
  });

  // SUBSCRIPTIONS
  async load(projectId: string) {
    const chats = await pb.collection("chats").getFullList({
      filter: `project = "${projectId}"`,
      sort: "-created",
    });
    this._chats = chats;
  }

  async subscribe(projectId: string) {
    if (this.subscribed) return;
    this.subscribed = true;

    await this.load(projectId);

    pb.collection("chats").subscribe(
      "*",
      async (chat) => {
        console.log("chat", chat);
        switch (chat.action) {
          case "create":
            this._chats.unshift(chat.record);
            break;
          case "delete":
            this._chats = this._chats.filter((r) => r.id !== chat.record.id);
            break;
          case "update":
            this._chats = this._chats.map((r) =>
              r.id === chat.record.id ? chat.record : r
            );
            break;
          default:
            break;
        }
      },
      {
        filter: `project = "${projectId}"`,
        sort: "-created",
      }
    );
  }

  unsubscribe() {
    pb.collection("chats").unsubscribe();
    this.subscribed = false;
  }
}

export const chatsProvider = new ChatsProvider();
