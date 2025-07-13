import { nanoid } from "nanoid";
import { io, type Socket } from "socket.io-client";
import { tick } from "svelte";

import {
  MessagesRoleOptions,
  type MessagesRecord,
  type MessagesResponse,
} from "../../shared/models/pocketbase-types";

class WidgetSocketProvider {
  socket: Socket | null = $state(null);
  online = $state(false);

  history = $state<MessagesResponse[]>([]);
  contentContainer: HTMLElement | null = $state(null);

  init(token: string, roomId: string, contentContainer: HTMLElement) {
    this.contentContainer = contentContainer;

    this.socket = io({
      auth: {
        token,
      },
    });

    this.socket.on("connect", () => {
      this.online = true;
      this.socket?.emit("join-room", {
        roomId,
      });
    });

    this.socket.on("chat-history", (history: MessagesResponse[]) => {
      this.history = history;
      this.scrollToBottom();
    });

    this.socket.on("new-message", (m: MessagesResponse) => {
      this.history.push(m);
      this.scrollToBottom();
    });

    this.socket.on("rate-limit", (data: { message: string }) => {
      console.warn("Rate limit from server:", data.message);
    });

    this.socket.on("disconnect", () => {
      this.online = false;
    });
  }

  sendMessage(content: string, roomId: string, username: string) {
    const newMsg: MessagesRecord = {
      id: `temp-${nanoid(12)}`,
      content: content.trim(),
      role: MessagesRoleOptions.user,
      visible: true,
      room: roomId,
      sentBy: username,
      created: new Date().toISOString().replace("T", " "),
    };

    this.socket?.emit("send-message", {
      roomId,
      msgStr: JSON.stringify(newMsg),
    });
  }

  destroy() {
    this.socket?.disconnect();
    this.online = false;
    this.history = [];
  }

  scrollToBottom() {
    tick().then(() => {
      this.contentContainer?.scrollTo({
        top: this.contentContainer.scrollHeight,
        behavior: "smooth",
      });
    });
  }
}

export const widgetSocketProvider = new WidgetSocketProvider();
