import { pb } from "../../shared/lib/pb";
import { settingsProvider } from "../../user/settings.svelte";
import type { RoomsResponse } from "../../shared/models/pocketbase-types";

class RoomsProvider {
  private subscribed = false;

  rooms: RoomsResponse[] = $state([]);
  previewRoom: RoomsResponse | null = $state(null);

  room = $derived.by(() => {
    if (!this.rooms.length) return null;
    if (settingsProvider.room) {
      const found = this.rooms.find((r) => r.id === settingsProvider.room);
      if (found) return found;
    }
    return this.rooms[0];
  });

  async load(chatId: string) {
    const rooms = await pb.collection("rooms").getFullList({
      filter: `chat = "${chatId}"`,
    });
    this.rooms = rooms;
    this.previewRoom = rooms.find((r) => r.status === "preview") || null;
  }

  subscribe(chatId: string) {
    if (this.subscribed) return;
    this.subscribed = true;

    this.load(chatId);

    pb.collection("rooms").subscribe(
      "*",
      (room) => {
        switch (room.action) {
          case "create":
            this.rooms.push(room.record);
            break;

          case "delete":
            this.rooms = this.rooms.filter((r) => r.id !== room.record.id);
            break;

          case "update":
            this.rooms = this.rooms.map((r) =>
              r.id === room.record.id ? room.record : r
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

  unsubscribe() {
    pb.collection("rooms").unsubscribe();
    this.subscribed = false;
    this.rooms = [];
  }
}

export const roomsProvider = new RoomsProvider();
