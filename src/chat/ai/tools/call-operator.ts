import { z } from "zod";
import { tool } from "@langchain/core/tools";
import type { RunnableConfig } from "@langchain/core/runnables";

import { pb } from "@/shared/lib/pb";

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
    const { roomId } = config.configurable || {};

    const room = await pb.collection("rooms").getOne(roomId);

    if (room.status === "preview") {
      return {
        success: true,
        content: `Cannot call operator in preview mode`,
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
    description: `
    EXPLICIT HUMAN TRANSFER TOOL: Transfer to human operator ONLY when user explicitly requests human assistance. This tool should be used extremely sparingly.

    WHEN TO USE (ONLY when user explicitly asks):
    - User says "I want to speak with a human"
    - User says "Can I talk to a real person?"
    - User says "I need to speak with someone"
    - User says "Transfer me to a human"
    - User says "I want to talk to a person"
    - User explicitly requests human escalation in any form

    WHEN NOT TO USE (CREATE TICKET INSTEAD):
    - User is frustrated but doesn't ask for human
    - User is dissatisfied with responses but doesn't request human
    - User has complex issues but doesn't ask for human
    - User has urgent needs but doesn't request human
    - User is angry but doesn't ask for human
    - Any situation where user hasn't explicitly asked for human assistance
    - Search results being irrelevant
    - Technical issues or support questions
    - Feature requests or general inquiries

    STRATEGY:
    - ONLY use when user explicitly asks for human assistance
    - For all other issues, create a ticket instead
    - Do not assume user wants human help even if they seem frustrated
    - Always try to help first before considering any escalation
    - If user doesn't explicitly ask for human, create a ticket

    This ensures operators are only called when genuinely requested by the user.
    `,
    schema: CallOperatorSchema,
    metadata: {
      visible: true,
    },
  }
);
