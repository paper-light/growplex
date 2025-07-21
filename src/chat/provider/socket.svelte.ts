import { SvelteMap } from "svelte/reactivity";
import { nanoid } from "nanoid";
import { io, type Socket } from "socket.io-client";

import {
  MessagesRoleOptions,
  type MessagesRecord,
  type MessagesResponse,
} from "../../shared/models/pocketbase-types";

class SocketProvider {
  histories: Map<string, MessagesResponse[]> = $state(new SvelteMap());

  socket: Socket | null = $state(null);
  online = $state(false);

  private resolveConnection: ((value: boolean) => void) | null = null;
  onlinePromise = $derived.by(async () => {
    if (this.online) return true;
    return new Promise<boolean>((resolve) => {
      this.resolveConnection = resolve;
    });
  });

  connect(token: string) {
    this.socket = io({
      auth: {
        token,
      },
    });

    this.socket.on("connect", () => {
      this.online = true;

      if (this.resolveConnection) {
        this.resolveConnection(true);
        this.resolveConnection = null;
      }
    });

    this.socket.on(
      "chat-history",
      (data: { roomId: string; history: MessagesResponse[] }) => {
        const { roomId, history } = data;
        this.histories.set(roomId, history);
      }
    );

    this.socket.on(
      "new-message",
      (data: { roomId: string; message: MessagesResponse }) => {
        const { roomId, message } = data;
        if (!this.histories.has(roomId)) this.histories.set(roomId, []);
        const history = this.histories.get(roomId)!;
        this.histories.set(roomId, [...history, message]);
      }
    );

    this.socket.on("rate-limit", (data: { message: string }) => {
      console.warn("Rate limit from server:", data.message);
    });

    this.socket.on("unauthorized", (data: { message: string }) => {
      console.warn("Unauthorized from server:", data.message);
    });

    this.socket.on("disconnect", () => {
      this.online = false;
    });
  }

  joinRoom(roomId: string) {
    if (!this.socket || !this.online) {
      console.warn("socket not connected, skipping joinRoom");
      return;
    }
    if (this.histories.has(roomId)) {
      console.warn("already joined to roomId, skipping joinRoom");
      return;
    }

    this.histories.set(roomId, []);
    this.socket.emit("join-room", {
      roomId,
    });
  }

  leaveRoom(roomId: string) {
    if (!this.histories.has(roomId)) return;
    this.socket?.emit("leave-room", { roomId });
    this.histories.delete(roomId);
  }

  leaveAllRooms() {
    this.histories.forEach((_, roomId) => {
      this.socket?.emit("leave-room", { roomId });
    });
    this.histories.clear();
  }

  sendMessage(
    content: string,
    username: string,
    roomId: string,
    metadata: Record<string, any> = {},
    role: MessagesRoleOptions = MessagesRoleOptions.user
  ) {
    if (!this.socket || !this.online) {
      console.warn("socket not connected, skipping sendMessage");
      return;
    }
    if (!this.histories.has(roomId)) {
      console.warn(
        "not joined to roomId, skipping sendMessage, roomId:",
        roomId
      );
      return;
    }

    const newMsg: Partial<MessagesRecord> = {
      content: content.trim(),
      role,
      visible: true,
      room: roomId,
      sentBy: username,
      metadata,
    };

    this.socket.emit("send-message", {
      roomId,
      msgStr: JSON.stringify(newMsg),
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.online = false;
    this.histories.clear();
  }
}

export const socketProvider = new SocketProvider();
