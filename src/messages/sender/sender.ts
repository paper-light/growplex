import { Socket } from "socket.io";

import type { MessagesResponse } from "@/shared/models/pocketbase-types";

export class Sender {
  // Map of roomId -> Map of socketId -> Socket
  private roomSockets: Map<string, Map<string, Socket>> = new Map();

  constructor() {
    this.roomSockets = new Map();
  }

  addSocket(roomId: string, socket: Socket) {
    if (!this.roomSockets.has(roomId)) this.roomSockets.set(roomId, new Map());

    const roomSocketMap = this.roomSockets.get(roomId)!;
    roomSocketMap.set(socket.id, socket);
  }

  removeSocket(roomId: string, socketId: string) {
    const roomSocketMap = this.roomSockets.get(roomId);
    if (roomSocketMap) {
      roomSocketMap.delete(socketId);
      if (roomSocketMap.size === 0) {
        this.roomSockets.delete(roomId);
      }
    }
  }

  removeSocketFromAllRooms(socketId: string) {
    for (const [roomId, roomSocketMap] of this.roomSockets.entries()) {
      if (roomSocketMap.has(socketId)) {
        roomSocketMap.delete(socketId);
        if (roomSocketMap.size === 0) {
          this.roomSockets.delete(roomId);
        }
      }
    }
  }

  sendMessage(
    roomId: string,
    message: MessagesResponse,
    mode: "update-message" | "new-message" = "new-message"
  ) {
    const roomSocketMap = this.roomSockets.get(roomId);
    if (roomSocketMap) {
      roomSocketMap.forEach((socket) => {
        socket.emit(mode, { roomId, message });
      });
    }
  }

  getRoomSocketCount(roomId: string): number {
    const roomSocketMap = this.roomSockets.get(roomId);
    return roomSocketMap ? roomSocketMap.size : 0;
  }
}

export const sender = new Sender();
