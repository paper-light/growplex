import { SvelteMap } from "svelte/reactivity";

import { pb } from "../../shared/lib/pb";
import { settingsProvider } from "../../user/settings.svelte";
import type { RoomsResponse } from "../../shared/models/pocketbase-types";
import { roomCrud } from "../repositories/room-crud";

class RoomsProvider {
  // STATE
  private subscribed = false;

  rooms: RoomsResponse[] = $state([]);

  previewRoomMap = $derived.by(() => {
    const map: SvelteMap<string, RoomsResponse> = new SvelteMap();
    if (this.rooms.length == 0) return map;

    const previewRooms = this.rooms.filter((r) => r.status === "preview");

    previewRooms.forEach((r) => {
      map.set(r.chat, r);
    });

    return map;
  });

  selectedRoom = $derived.by(() => {
    if (!this.rooms.length) return null;
    if (settingsProvider.selectedRoomId) {
      const found = this.rooms.find(
        (r) => r.id === settingsProvider.selectedRoomId
      );
      if (found) return found;
    }
    return this.rooms[0];
  });

  async load(projectId: string) {
    const rooms = await pb.collection("rooms").getFullList({
      filter: `chat.project = "${projectId}"`,
    });
    this.rooms = rooms;
  }

  subscribe(projectId: string) {
    if (this.subscribed) return;
    this.subscribed = true;

    this.load(projectId);

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
        filter: `chat.project = "${projectId}"`,
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
