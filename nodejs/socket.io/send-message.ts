import { type Socket, type Server } from "socket.io";

import { pb } from "@/shared/lib/pb";
import { RoomsStatusOptions } from "@/shared/models/pocketbase-types";
import { embedder } from "@/search/embedder";
import { runChatWorkflow } from "@/chat/ai/workflow";
import { historyRepository } from "@/messages/history/repository";
import { logger } from "@/shared/lib/logger";

import type { SendMessageDTO } from "./types";

const log = logger.child({
  module: "socket.io:send-message",
});

export async function sendMessage(
  socket: Socket,
  io: Server,
  { roomId, msgStr }: SendMessageDTO
) {
  try {
    // ALWAYS ON SEND MESSAGE
    const msg = {
      ...JSON.parse(msgStr),
      contentTokensCount: embedder.countTokens(
        JSON.parse(msgStr).content,
        "gpt-4"
      ),
    };

    let room = await pb.collection("rooms").getOne(roomId);

    const msgs = await historyRepository.updateHistory([msg]);
    log.debug({ msgs }, "updated history");

    io.to(room.id).emit("new-message", {
      roomId: room.id,
      message: msgs[0],
    });

    if (socket.data.guest) {
      // GUEST: SEEDED -> AUTO
      if (room.status === "seeded") {
        const lead = await pb.collection("leads").create({
          type: "warm",
        });
        room = await pb.collection("rooms").update(
          room.id,
          {
            status: "auto",
            lead: lead.id,
          },
          {
            expand: "chat",
          }
        );
      }
    } else if (socket.data.user) {
      if (room.status !== RoomsStatusOptions.preview) return;
    }

    if (room.status === "operator") return;

    const newMsgs = await runChatWorkflow(room.id, msg.content);

    for (const msg of newMsgs) {
      io.to(room.id).emit("new-message", { roomId: room.id, message: msg });
    }
  } catch (err) {
    console.error(err);
  }
}
