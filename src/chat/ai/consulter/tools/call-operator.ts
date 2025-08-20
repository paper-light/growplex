import { z } from "zod";
import { tool } from "@langchain/core/tools";
import type { RunnableConfig } from "@langchain/core/runnables";

import { pb } from "@/shared/lib/pb";

import type { RoomMemory } from "@/shared/ai/memories/load-room-memory";
import { RoomsTypeOptions } from "@/shared/models/pocketbase-types";

const CallOperatorSchema = z.object({
  description: z
    .string()
    .describe(
      "A comprehensive summary of the conversation, user's needs, current situation, and why human assistance is required"
    ),
  // OPTIONAL
  payload: z
    .any()
    .optional()
    .describe(
      "Additional context including user's business information, technical details, urgency level, previous attempts, and any other relevant information to help the operator understand the situation quickly"
    ),
});

export const callOperator = tool(
  async (input: any, config: RunnableConfig) => {
    const args = CallOperatorSchema.parse(input);
    const { description, payload } = args;
    const { memory } = config.configurable as { memory: RoomMemory };

    const room = memory.room;

    if (room.type !== RoomsTypeOptions.chatWidget) {
      return {
        success: true,
        content: `Cannot call operator in ${room.type} mode, only in chatWidget mode`,
      };
    }

    await pb.collection("rooms").update(room.id, {
      status: "waitingOperator",
      metadata: {
        ...payload,
        description,
      },
    });

    return {
      success: true,
      content: `Room is awaiting for an operator...`,
    };
  },
  {
    name: "callOperator",
    description:
      "Transfer to human operator ONLY when user explicitly requests human assistance.",
    schema: CallOperatorSchema,
    metadata: {
      visible: true,
      needApproval: false,
    },
  }
);
