import { untrack } from "svelte";

import { pb } from "../../shared/lib/pb";
import { settingsProvider } from "../../user/settings.svelte";
import { socketProvider } from "./socket.svelte";
import type { RoomsResponse } from "../../shared/models/pocketbase-types";

class ChatProvider {
  private subscribed = $state(false);
  private currentChatId: string | null = $state(null);
  private cachedRooms: RoomsResponse[] = $state([]);

  currentRoomId: string | null = $state(null);

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
      this.subscribed = false;
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
    const currentRoomId = this.currentRoomId;
    const roomsPromise = this.rooms;
    const onlinePromise = socketProvider.onlinePromise;

    return await untrack(async () => {
      await onlinePromise;
      const rooms = await roomsPromise;

      if (!currentRoomId) return null;
      socketProvider.joinRoom(currentRoomId);

      return rooms.find((r) => r.id === currentRoomId) || null;
    });
  });

  async setCurrentRoom(roomId: string) {
    const currentRoom = await this.currentRoom;
    if (currentRoom?.id === roomId) return;
    this.currentRoomId = roomId;
  }

  private subscribeRooms(chatId: string) {
    if (this.subscribed) return;
    this.subscribed = true;

    pb.collection("rooms").subscribe(
      "*",
      async (room) => {
        const rooms = await this.rooms;
        switch (room.action) {
          case "create":
            this.rooms = new Promise((resolve) =>
              resolve([...rooms, room.record])
            );
            break;
          case "delete":
            this.rooms = new Promise((resolve) =>
              resolve(rooms.filter((r) => r.id !== room.record.id))
            );
            break;
          case "update":
            this.rooms = new Promise((resolve) =>
              resolve(
                rooms.map((r) => (r.id === room.record.id ? room.record : r))
              )
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
