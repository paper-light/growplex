import { z } from "zod";

import { pb } from "../auth/auth.svelte";
import { settingsProvider } from "../settings/settings.svelte";
import { ChatMessageSchema, ChatRoomSchema } from "../../models/chat";
import { socketProvider } from "./socket.svelte";

class ChatProvider {
  private currentChatId: string | null = null;

  messages = $state<z.infer<typeof ChatMessageSchema>[]>([]);

  rooms = $derived.by(async () => {
    const chat = settingsProvider.currentIntegration?.expand?.chat || null;
    if (!chat) {
      pb.collection("rooms").unsubscribe();
      return [];
    }
    const res = await pb.collection("rooms").getFullList({
      filter: `chat = "${chat.id}"`,
    });
    if (this.currentChatId !== chat.id) {
      this.currentChatId = chat.id;
      this.subscribeRooms(chat.id);
    }
    return z.array(ChatRoomSchema).parse(res);
  });

  currentRoom = $derived.by(async () => {
    const rooms = await this.rooms;
    return rooms.length > 0 ? ChatRoomSchema.parse(rooms[0]) : null;
  });

  async setCurrentRoom(room: z.infer<typeof ChatRoomSchema>) {
    const currentRoom = await this.currentRoom;
    if (currentRoom) {
      socketProvider.leaveRoom(currentRoom.id);
    }
    this.messages = [];
    socketProvider.joinRoom(room.id);
  }

  pushMessage(msg: any) {
    this.messages.push(ChatMessageSchema.parse(msg));
  }

  setHistory(history: any[]) {
    this.messages = z.array(ChatMessageSchema).parse(history);
  }

  private subscribeRooms(chatId: string) {
    pb.collection("rooms").subscribe(
      "*",
      (res) => {
        switch (res.action) {
          case "create":
            this.rooms
              .then((rooms) => {
                rooms.push(ChatRoomSchema.parse(res.record));
              })
              .catch((err) => {
                console.error(err);
              });
            break;
          case "delete":
            this.rooms
              .then((rooms) => {
                rooms = rooms.filter((r) => r.id !== res.record.id);
              })
              .catch((err) => {
                console.error(err);
              });
            break;
          case "update":
            this.rooms
              .then((rooms) => {
                rooms = rooms.map((r) =>
                  r.id === res.record.id ? ChatRoomSchema.parse(res.record) : r
                );
              })
              .catch((err) => {
                console.error(err);
              });
            break;
          default:
            console.log("ignore action", res.action);
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
