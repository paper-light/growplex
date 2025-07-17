import { nanoid } from "nanoid";
import { io, type Socket } from "socket.io-client";

import {
  MessagesRoleOptions,
  type MessagesRecord,
  type MessagesResponse,
} from "../../shared/models/pocketbase-types";

class SocketProvider {
  joinedRooms: Set<string> = $state(new Set());
  histories: Record<string, MessagesResponse[]> = $state({});

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
        this.histories[roomId] = history;
      }
    );

    this.socket.on(
      "new-message",
      (data: { roomId: string; message: MessagesResponse }) => {
        const { roomId, message } = data;
        if (!this.histories[roomId]) this.histories[roomId] = [];
        this.histories[roomId].push(message);
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
    if (this.joinedRooms.has(roomId)) {
      console.warn("already joined to roomId, skipping joinRoom");
      return;
    }

    this.joinedRooms.add(roomId);
    this.histories[roomId] = [];
    this.socket.emit("join-room", {
      roomId,
    });
  }

  leaveRoom(roomId: string) {
    if (!this.joinedRooms.has(roomId)) return;
    this.socket?.emit("leave-room", { roomId });
    this.joinedRooms.delete(roomId);
    delete this.histories[roomId];
  }

  leaveAllRooms() {
    this.joinedRooms.forEach((roomId) => {
      this.socket?.emit("leave-room", { roomId });
    });
    this.joinedRooms.clear();
    this.histories = {};
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
    if (!this.joinedRooms.has(roomId)) {
      console.warn(
        "not joined to roomId, skipping sendMessage, roomId:",
        roomId
      );
      return;
    }

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

    this.socket.emit("send-message", {
      roomId,
      msgStr: JSON.stringify(newMsg),
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.online = false;
    this.joinedRooms = new Set();
    this.histories = {};
  }
}

export const socketProvider = new SocketProvider();
