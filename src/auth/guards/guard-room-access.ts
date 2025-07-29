import type { Socket } from "socket.io";

import { pb } from "@/shared/lib/pb";
import type { RoomsResponse } from "@/shared/models/pocketbase-types";

export async function guardRoomAccess(socket: Socket, room: RoomsResponse) {
  if (socket.data.guest) {
    if (socket.data.guest.roomId === room.id) return;
  } else if (socket.data.user) {
    const user = socket.data.user;
    const ownedOrgId = user.expand!.orgMembers!.find(
      (o: any) => (o.role = "owner")
    )!.org;
    const integrationIds = (
      await pb.collection("integrations").getFullList({
        filter: `project.org = '${ownedOrgId}' || operators.id ?= '${user.id}'`,
      })
    ).map((i) => i.id);

    const chat = (room.expand as any).chat!;
    if (integrationIds.includes(chat.integration)) return;
  }

  // Unauthorized
  socket.emit("unauthorized", {
    message: "Unauthorized",
  });
  throw new Error("Unauthorized");
}
