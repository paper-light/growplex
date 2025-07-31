import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { getContextVariable } from "@langchain/core/context";

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
  async ({ description, payload }: z.infer<typeof CallOperatorSchema>) => {
    const room = getContextVariable("room");
    if (!room)
      throw new Error("Call operator tool call error: Room is not set");

    if (room.status === "preview") {
      return {
        success: true,
        content: `Cannot call operator in preview mode`,
      };
    }

    await pb.collection("rooms").update(room.id, {
      status: "waitingOperator",
      metadata: {
        ...room.metadata,
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
    HUMAN TRANSFER TOOL: Transfer the conversation to a human operator when automated assistance is insufficient or inappropriate.

    WHEN TO USE:
    - User explicitly requests to speak with a human
    - User is dissatisfied with automated responses
    - Conversation becomes too complex for automated handling
    - User has urgent business needs requiring immediate human attention
    - User needs personalized consultation or custom solutions
    - User requests account changes or administrative actions
    - User has sensitive or confidential information to discuss
    - User needs technical consultation or integration support
    - User is frustrated and needs human empathy and understanding
    - User asks for enterprise solutions or custom pricing
    - User needs help with complex implementation or onboarding
    - User has complaints or feedback that require human handling

    STRATEGY:
    - Always try to help first before transferring
    - Provide clear explanation of why human assistance is needed
    - Include comprehensive context to help the operator understand quickly
    - Ensure smooth transition by summarizing the situation
    - Set appropriate expectations about when an operator will be available
    - Maintain professional tone and reassure the user they'll get help

    This ensures users get the personalized attention they need while maintaining service quality.
    `,
    schema: CallOperatorSchema,
    metadata: {
      visible: true,
    },
  }
);
