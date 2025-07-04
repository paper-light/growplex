import { io, Socket } from "socket.io-client";

import { chatProvider } from "./chat.svelte";
import { pb } from "../auth/auth.svelte";

class SocketProvider {
  socket: Socket | null = null;
  private isConnected = $state(false);

  async init() {
    const token = pb.authStore.token || null;

    this.socket = io({
      auth: {
        token,
      },
    });

    this.socket.on("connect", () => {
      console.log("🟢 Socket connected:", this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      this.isConnected = false;
    });

    this.socket.on("new-message", (msg: any) => {
      chatProvider.pushMessage(msg);
    });

    this.socket.on("chat-history", (history: any[]) => {
      chatProvider.setHistory(history);
    });
  }

  joinRoom(roomId: string, username?: string) {
    if (!this.socket || !this.isConnected) {
      console.warn("Socket not connected, cannot join room");
      return;
    }
    this.socket.emit("join-room", {
      roomId,
      username: username || "Operator",
    });
    console.log("Joined room:", roomId);
  }

  leaveRoom(roomId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit("leave-room", { roomId });
    console.log("Left room:", roomId);
  }

  sendMessage(roomId: string, message: any) {
    if (!this.socket || !this.isConnected) {
      console.warn("Socket not connected, cannot send message");
      return;
    }
    this.socket.emit("send-message", {
      roomId,
      msgStr: JSON.stringify(message),
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  get connected() {
    return this.isConnected;
  }
}

export const socketProvider = new SocketProvider();
