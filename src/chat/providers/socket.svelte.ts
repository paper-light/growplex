import { SvelteMap, SvelteSet } from "svelte/reactivity";
import { io, type Socket } from "socket.io-client";

import {
  MessagesRoleOptions,
  type MessagesRecord,
  type MessagesResponse,
} from "@/shared/models/pocketbase-types";

export type Sender = {
  id: string;
  avatar: string;
  name: string;
  role: "guest" | "operator";
};

class SocketProvider {
  sender: Sender | null = null;
  socket: Socket | null = null;

  joinedRooms = $state(new SvelteSet<string>());
  histories: Map<string, MessagesResponse[]> = $state(new SvelteMap());
  waitingAnswerRooms = $state(new SvelteSet<string>());
  online = $state(false);

  connect(token: string) {
    this.socket = io({
      auth: {
        token,
      },
    });

    this.socket.on("connect", () => {
      console.log("CONNECTED to socket");
      this.online = true;
    });

    this.socket.on(
      "chat-history",
      (data: { roomId: string; history: MessagesResponse[] }) => {
        const { roomId, history } = data;
        this.histories.set(roomId, history);
      }
    );

    this.socket.on(
      "update-message",
      (data: { roomId: string; message: MessagesResponse }) => {
        console.log("UPDATE MESSAGE:", data);
        const { roomId, message } = data;
        const history = this.histories.get(roomId) || [];
        const updatedHistory = history.map((m) =>
          m.id === message.id ? message : m
        );
        this.histories.set(roomId, updatedHistory);
      }
    );

    this.socket.on(
      "new-message",
      (data: { roomId: string; message: MessagesResponse }) => {
        const { roomId, message } = data;
        const history = this.histories.get(roomId) || [];
        this.histories.set(roomId, [...history, message]);

        if (message.role !== "user") this.waitingAnswerRooms.delete(roomId);
      }
    );

    this.socket.on("rate-limit", (data: { message: string }) => {
      console.warn("Rate limit from server:", data.message);
    });

    this.socket.on("unauthorized", (data: { message: string }) => {
      console.warn("Unauthorized from server:", data.message);
    });

    this.socket.on("disconnect", () => {
      console.log("DISCONNECTED from socket");
      this.online = false;
      this.leaveAllRooms();
    });
  }

  attachSender(sender: Sender) {
    this.sender = sender;
  }

  joinRoom(roomId: string) {
    console.log("JOINING ROOM:", roomId);
    if (!this.socket || !this.online) {
      console.warn("socket not connected, skipping joinRoom");
      return;
    }
    if (this.joinedRooms.has(roomId)) {
      console.warn("already joined to roomId, skipping joinRoom");
      return;
    }

    this.histories.set(roomId, []);
    this.joinedRooms.add(roomId);
    this.socket.emit("join-room", {
      roomId,
    });
  }

  leaveRoom(roomId: string) {
    if (!this.histories.has(roomId)) return;
    this.socket?.emit("leave-room", { roomId });
    this.joinedRooms.delete(roomId);
    this.waitingAnswerRooms.delete(roomId);
  }

  leaveAllRooms() {
    this.joinedRooms.forEach((roomId) => {
      this.socket?.emit("leave-room", { roomId });
    });
    this.joinedRooms.clear();
  }

  sendMessage(
    content: string,
    roomId: string,
    role: MessagesRoleOptions = MessagesRoleOptions.user,
    event = "message",
    metadata: Record<string, any> = {},
    mode: "consulter" | "integration-manager" = "consulter"
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

    const newMsg: Partial<MessagesRecord> = {
      content: content.trim(),
      role,
      visible: true,
      room: roomId,
      sentBy: this.sender?.id,
      metadata,
      event,
    };

    this.socket.emit("send-message", {
      roomId,
      msgStr: JSON.stringify(newMsg),
      mode,
    });

    if (role === "user") {
      this.waitingAnswerRooms.add(roomId);
      setTimeout(() => {
        this.waitingAnswerRooms.delete(roomId);
      }, 60 * 1000); // 1 minute
    }
  }

  disconnect() {
    this.socket?.disconnect();
  }

  private loadPreviousMessages(roomId: string) {
    if (!this.histories.has(roomId)) return;
  }
}

export const socketProvider = new SocketProvider();
