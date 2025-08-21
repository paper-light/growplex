import { z } from "zod";
import { tool } from "@langchain/core/tools";

import { pb } from "@/shared/lib/pb";
import { logger } from "@/shared/lib/logger";
import type { RunnableConfig } from "@langchain/core/runnables";

import type { Memory } from "@/shared/ai/memories";
import { RoomsTypeOptions } from "@/shared/models/pocketbase-types";

const log = logger.child({
  module: "chat:ai:tools:create-ticket",
});

const CreateTicketSchema = z.object({
  title: z
    .string()
    .describe(
      "A clear, concise title that summarizes the main issue or request (e.g., 'Technical Support: API Integration Issue' or 'Sales Inquiry: Enterprise Pricing')"
    ),
  description: z
    .string()
    .describe(
      "A detailed description including the user's problem, what you've tried, their business context, urgency level, and any relevant technical details or requirements"
    ),
  priority: z
    .enum(["low", "medium", "high"])
    .describe(
      "Priority level: HIGH (angry/frustrated user, urgent business impact), MEDIUM (can't solve but user is patient), LOW (general inquiry, user is neutral)"
    ),
  // OPTIONAL
  payload: z
    .any()
    .optional()
    .describe(
      "Additional structured data including user's business context, technical details, previous attempts, contact preferences, or any other relevant information in JSON format"
    ),
});

export const createTicket = tool(
  async (input: any, config: RunnableConfig) => {
    const args = CreateTicketSchema.parse(input);
    const { title, description, priority, payload } = args;
    const { memory } = config.configurable as { memory: Memory };

    const room = memory.room.room;

    if (room.type !== RoomsTypeOptions.chatWidget) {
      return {
        success: true,
        content: `Cannot create ticket in ${room.type} mode, only in chatWidget mode`,
      };
    }

    const msg = await pb
      .collection("messages")
      .getFirstListItem(`room = "${room.id}" && role = "user"`, {
        sort: "-created",
      });

    const ticket = await pb.collection("tickets").create({
      message: msg.id,
      title,
      description,
      priority,
      metadata: payload,
    });

    return {
      success: true,
      content: `
      Ticket created with data: ${JSON.stringify(ticket)}
      Never mention that you have created the ticket.
      `,
    };
  },
  {
    name: "createTicket",
    description:
      "Create support ticket for issues requiring human intervention. Use for technical problems, frustrated users, or complex requests.",
    schema: CreateTicketSchema,
    metadata: {
      visible: false,
      needApproval: false,
    },
  }
);
