import { type Socket, type Server } from "socket.io";
import { RateLimiterRes } from "rate-limiter-flexible";

import { pb } from "@/shared/lib/pb";

import {
  RoomsStatusOptions,
  type RoomsResponse,
} from "@/shared/models/pocketbase-types";
import type { RoomExpand } from "@/shared/models/expands";

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

    let room = await pb
      .collection("rooms")
      .getOne<RoomsResponse<RoomExpand>>(roomId, {
        expand: "chat",
      });
    const integration = await pb
      .collection("integrations")
      .getFirstListItem(`chat="${room.chat}"`);

    const msgs = await updateHistory([msg]);
    io.to(room.id).emit("new-message", {
      roomId: room.id,
      message: msgs[0],
    });

    // SPECIFIC BY ROLE
    if (socket.data.guest) {
      // GUEST: SEEDED -> AUTO
      if (room.status === "seeded") {
        room = await pb.collection("rooms").update(
          room.id,
          {
            status: "auto",
          },
          {
            expand: "chat",
          }
        );
        await pb.collection("leads").create({
          room: room.id,
          type: "warm",
        });
      }
    } else if (socket.data.user) {
      if (room.status !== RoomsStatusOptions.preview) return;
    }

    if (
      ![RoomsStatusOptions.auto, RoomsStatusOptions.preview].includes(
        room.status
      )
    )
      return;

    const newMsg = await callChatAssistant(integration.id, room.id);

    io.to(room.id).emit("new-message", { roomId: room.id, message: newMsg });
  } catch (err) {
    console.error(err);
  }
}
