import { type Socket, type Server } from "socket.io";
import { RateLimiterRes } from "rate-limiter-flexible";

import { pb } from "@/shared/lib/pb";

import {
  RoomsStatusOptions,
  type RoomsResponse,
  type IntegrationsResponse,
} from "@/shared/models/pocketbase-types";

import { callChatAssistant } from "@/chat/service";
import { updateHistory } from "@/chat/history/update-history";
import { globalEncoderService } from "@/llm";

import type { SendMessageDTO } from "./types";

export async function sendMessage(
  socket: Socket,
  io: Server,
  { roomId, msgStr }: SendMessageDTO
) {
  try {
    // ALWAYS ON SEND MESSAGE
    const msg = {
      ...JSON.parse(msgStr),
      contentTokensCount: globalEncoderService.countTokens(
        JSON.parse(msgStr).content,
        "gpt-4"
      ),
    };

    let room = await pb.collection("rooms").getOne(roomId, {
      expand: "chat,chat.integration",
    });
    const integration: IntegrationsResponse = (room.expand as any).chat.expand
      .integration!;

    const msgs = await updateHistory([msg]);
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

    const newMsgs = await callChatAssistant(integration.id, room.id);

    for (const msg of newMsgs) {
      io.to(room.id).emit("new-message", { roomId: room.id, message: msg });
    }
  } catch (err) {
    console.error(err);
  }
}
