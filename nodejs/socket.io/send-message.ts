import { type Socket, type Server } from "socket.io";

import { pb } from "@/shared/lib/pb";
import { chunker } from "@/search/chunker";
import { runChatWorkflow } from "@/chat/ai/consulter/workflows";
import { pbHistoryRepository } from "@/messages/history/pb-repository";
import { logger } from "@/shared/lib/logger";
import { charger, BILLING_ERRORS } from "@/billing";

import type { SendMessageDTO } from "./types";

const log = logger.child({
  module: "socket.io:send-message",
});

export async function sendMessage(
  socket: Socket,
  io: Server,
  { roomId, msgStr, mode = "consulter" }: SendMessageDTO
) {
  try {
    // ALWAYS ON SEND MESSAGE
    const msg = {
      ...JSON.parse(msgStr),
      contentTokensCount: chunker.countTokens(
        JSON.parse(msgStr).content,
        "gpt-4"
      ),
    };

    let room = await pb.collection("rooms").getOne(roomId);

    const msgs = await pbHistoryRepository.updateHistory([msg]);
    log.debug({ msgs }, "updated history");

    io.to(room.id).emit("new-message", {
      roomId: room.id,
      message: msgs[0],
    });

    if (socket.data.guest) {
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
        await pb.collection("leads").update(room.lead, {
          type: "warm",
        });
      }
    } else if (socket.data.user) {
      log.debug({ room }, "room status");
      if (room.type === "chatWidget") return;
    }

    if (room.status === "operator") return;

    try {
      const sub = await charger.validateRoom(room.id);

      let price = 0;
      if (mode === "consulter") {
        const { price: p } = await runChatWorkflow(room.id, msg.content);
        price = p;
      } else if (mode === "integration-manager") {
        // const { price } = await runIntegrationManagerWorkflow(room.id, msg.content);
      }

      await charger.chargePrice(sub.id, price);
    } catch (error: any) {
      if (error.message.includes(BILLING_ERRORS.NOT_ENOUGH_GAS)) {
        io.to(room.id).emit("limit-exceeded", {
          message: "Usage limit exceeded",
        });
        return;
      }
      if (error.message.includes(BILLING_ERRORS.SUBSCRIPTION_NOT_FOUND)) {
        io.to(room.id).emit("billing-error", {
          message: "Billing configuration error. Please contact support.",
        });
        return;
      }
      console.error(error);
    }
  } catch (err) {
    log.error({ err }, "Error sending message");
  }
}
