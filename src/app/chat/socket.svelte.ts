import { io, Socket } from "socket.io-client";

import { chatProvider } from "./chat.svelte";
import { authProvider } from "../auth/auth.svelte";
import { ChatMessageSchema } from "../../models/chat";
import z from "zod";
import { pb } from "../auth/pb";

class SocketProvider {
  socket: Socket | null = null;
  private isConnected = $state(false);
  private resolveConnection: ((value: boolean) => void) | null = null;

  isConnectedPromise = $derived.by(async () => {
    if (this.isConnected) {
      return true;
    }
    
    return new Promise<boolean>((resolve) => {
      this.resolveConnection = resolve;
    });
  });

  token = $derived(authProvider.token || pb.authStore.token);

  connect() {
    console.log(authProvider.token);
    this.socket = io({
      auth: {
        token: this.token,
      },
    });

    this.socket.on("connect", () => {
      console.log("🟢 socket.svelte.ts connected:", this.socket?.id);
      this.isConnected = true;
      if (this.resolveConnection) {
        this.resolveConnection(true);
        this.resolveConnection = null;
      }
    });

    this.socket.on("disconnect", () => {
      console.log("🔴 socket.svelte.ts disconnected");
      this.isConnected = false;
    });

    this.socket.on("new-message", (msg: any) => {
      chatProvider.messages.push(ChatMessageSchema.parse(msg));
    });

    this.socket.on("chat-history", (history: any[]) => {
      chatProvider.messages = z.array(ChatMessageSchema).parse(history);
    });
  }

  joinRoom(roomId: string) {
    if (!this.socket || !this.isConnected) {
      console.warn("Socket not connected, cannot join room");
      return;
    }
    this.socket.emit("join-room", {
      roomId,
    });
    console.log("Joined room:", roomId);
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
