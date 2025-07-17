import type { Socket } from "socket.io";

import { pb } from "../../shared/lib/pb";
import type { RoomsResponse } from "../../shared/models/pocketbase-types";
import type { RoomExpand } from "../../shared/models/expands";

export async function guardRoomAccess(
  socket: Socket,
  room: RoomsResponse<RoomExpand>
) {
  if (socket.data.guest) {
    if (socket.data.guest.roomId === room.id) return;
  } else if (socket.data.user) {
    const user = socket.data.user;
    const chat = room.expand!.chat!;
    const project = await pb
      .collection("projects")
      .getFirstListItem(`chats:each ?= '${chat.id}'`);
    const projects = user.expand!.orgMembers!.flatMap(
      (m: any) => m.expand!.org!.projects
    );
    if (project && projects.includes(project.id)) return;
  }

  // Unauthorized
  socket.emit("unauthorized", {
    message: "Unauthorized",
  });
  throw new Error("Unauthorized");
}
