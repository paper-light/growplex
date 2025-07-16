import { nanoid } from "nanoid";
import { io, type Socket } from "socket.io-client";

import {
  MessagesRoleOptions,
  type MessagesRecord,
  type MessagesResponse,
} from "../../shared/models/pocketbase-types";

class SocketProvider {
  joinedRoomId: string | null = null;

  socket: Socket | null = $state(null);
  online = $state(false);

  history = $state<MessagesResponse[]>([]);

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

    this.socket.on("chat-history", (history: MessagesResponse[]) => {
      console.log("chat-history", history.length);
      this.history = history;
    });

    this.socket.on("new-message", (m: MessagesResponse) => {
      this.history.push(m);
    });

    this.socket.on("rate-limit", (data: { message: string }) => {
      console.warn("Rate limit from server:", data.message);
    });

    this.socket.on("disconnect", () => {
      this.online = false;
    });
  }

  joinRoom(roomId: string) {
    if (!this.socket || !this.online) {
      console.log("socket not connected, skipping joinRoom");
      return;
    }

    if (this.joinedRoomId === roomId) return;
    if (this.joinedRoomId) this.leaveRoom(this.joinedRoomId);

    this.joinedRoomId = roomId;
    this.history = [];
    this.socket.emit("join-room", {
      roomId,
    });
  }
  leaveRoom(roomId: string) {
    this.socket?.emit("leave-room", { roomId });
    this.joinedRoomId = null;
    this.history = [];
  }

  sendMessage(
    content: string,
    roomId: string,
    username: string,
    metadata: Record<string, any> = {},
    role: MessagesRoleOptions = MessagesRoleOptions.user
  ) {
    const newMsg: MessagesRecord = {
      id: `temp-${nanoid(12)}`,
      content: content.trim(),
      role,
      visible: true,
      room: roomId,
      sentBy: username,
      metadata,
      created: new Date().toISOString().replace("T", " "),
    };

    this.socket?.emit("send-message", {
      roomId,
      msgStr: JSON.stringify(newMsg),
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.online = false;
    this.history = [];
  }
}

export const socketProvider = new SocketProvider();
