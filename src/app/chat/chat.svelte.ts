import { untrack } from "svelte";

import { pb } from "../../shared/lib/pb";
import { settingsProvider } from "../settings/settings.svelte";
import { socketProvider } from "./socket.svelte";
import type {
  MessagesResponse,
  RoomsResponse,
} from "../../shared/models/pocketbase-types";

class ChatProvider {
  private currentChatId: string | null = $state(null);
  private currentRoomId: string | null = $state(null);
  private cachedRooms: RoomsResponse[] = $state([]);

  messages: MessagesResponse[] = $state([]);

  rooms = $derived.by(async () => {
    const chat = settingsProvider.currentChat;

    return await untrack(async () => {
      if (!chat) {
        console.log("no chat");
        this.currentRoomId = null;
        this.currentChatId = null;
        this.cachedRooms = [];
        pb.collection("rooms").unsubscribe();
        return [];
      }

      console.log("yes chat");
      if (this.currentChatId === chat.id) {
        return this.cachedRooms;
      }

      console.log("new chat id");

      pb.collection("rooms").unsubscribe();
      this.currentRoomId = null;

      const rooms = await pb.collection("rooms").getFullList({
        filter: `chat = "${chat.id}"`,
      });
      this.currentChatId = chat.id;
      this.cachedRooms = rooms;
      this.subscribeRooms(chat.id);

      this.currentRoomId = rooms.length > 0 ? rooms[0]?.id : null;

      return rooms;
    });
  });

  currentRoom = $derived.by(async () => {
    this.currentRoomId;
    const rooms = await this.rooms;
    await socketProvider.isConnectedPromise;

    this.messages = [];
    if (!rooms || !this.currentRoomId) return null;

    socketProvider.joinRoom(this.currentRoomId);

    return rooms.find((r) => r.id === this.currentRoomId) || null;
  });

  async setCurrentRoom(roomId: string) {
    const currentRoom = await this.currentRoom;
    if (currentRoom?.id === roomId) return;
    this.currentRoomId = roomId;
  }

  private subscribeRooms(chatId: string) {
    pb.collection("rooms").subscribe(
      "*",
      (room) => {
        switch (room.action) {
          case "create":
            const newRoom = room.record;
            this.cachedRooms = [...this.cachedRooms, newRoom];
            break;
          case "delete":
            this.cachedRooms = this.cachedRooms.filter(
              (r) => r.id !== room.record.id
            );
            break;
          case "update":
            const updatedRoom = room.record;
            this.cachedRooms = this.cachedRooms.map((r) =>
              r.id === room.record.id ? updatedRoom : r
            );
            break;
          default:
            break;
        }
      },
      {
        filter: `chat = "${chatId}"`,
      }
    );
  }
}

export const chatProvider = new ChatProvider();
