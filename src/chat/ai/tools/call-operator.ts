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
    URGENT HUMAN TRANSFER TOOL: Transfer to human operator ONLY for truly urgent or critical situations that require immediate human attention. This should be used SPARINGLY and only after creating a ticket.

    WHEN TO USE (ONLY FOR URGENT SITUATIONS):
    - User is in crisis or experiencing severe emotional distress
    - User has a critical business emergency requiring immediate resolution
    - User is threatening to cancel or leave due to urgent unresolved issues
    - User has a security incident or data breach concern
    - User is experiencing system downtime affecting their business operations
    - User has a legal or compliance issue requiring immediate attention
    - User is a VIP customer with urgent high-priority needs
    - User has a billing emergency (overcharged, payment issues)
    - User is experiencing a service outage affecting multiple users
    - User has a safety or security concern

    WHEN NOT TO USE (CREATE TICKET INSTEAD):
    - General support questions or technical issues
    - Feature requests or product inquiries
    - Implementation or configuration help
    - Search results being irrelevant
    - User dissatisfaction with automated responses
    - Account changes or administrative requests
    - General feedback or suggestions

    STRATEGY:
    - ALWAYS create a ticket FIRST for any issue
    - Only call operator for truly urgent/critical situations
    - Provide clear explanation of why immediate human attention is needed
    - Include comprehensive context about the urgency
    - Ensure the situation genuinely requires immediate human intervention
    - Set appropriate expectations about operator availability

    This ensures operators are available for truly urgent situations while maintaining systematic ticket tracking.
    `,
    schema: CallOperatorSchema,
    metadata: {
      visible: true,
    },
  }
);
