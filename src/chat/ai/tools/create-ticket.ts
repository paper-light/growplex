import { z } from "zod";
import { tool } from "@langchain/core/tools";

import { pb } from "@/shared/lib/pb";
import { logger } from "@/shared/lib/logger";
import type { RunnableConfig } from "@langchain/core/runnables";

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
    const { roomId } = config.configurable || {};

    const room = await pb.collection("rooms").getOne(roomId);

    if (room.status === "preview") {
      return {
        success: true,
        content: `Ticket is not created in preview mode`,
      };
    }

    const msg = await pb
      .collection("messages")
      .getFirstListItem(`room = "${roomId}" && role = "user"`, {
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
    description: `
    PRIMARY ESCALATION TOOL: Create a support ticket for issues that require human intervention. This should be your FIRST choice for escalation.

    WHEN TO USE (CREATE TICKET FIRST):
    - User has a technical problem you cannot solve
    - User is frustrated, angry, or unsatisfied with responses
    - User requests specific features or custom solutions
    - User has complex business requirements that need human review
    - User needs account changes or administrative actions
    - User reports bugs or system issues
    - User asks for custom pricing or enterprise solutions
    - User needs integration support or technical consultation
    - User has urgent business needs requiring immediate attention
    - User requests refunds, cancellations, or account modifications
    - Search results are irrelevant or insufficient for user's query
    - User needs information not available in your knowledge base
    - User has questions about features or capabilities you can't answer
    - User needs help with implementation or configuration
    - User has feedback or suggestions that require review

    PRIORITY GUIDELINES:
    - HIGH: Angry/frustrated users, urgent business impact, system outages
    - MEDIUM: Can't solve but user is patient, general support requests
    - LOW: General inquiries, feature requests, non-urgent questions

    STRATEGY:
    - ALWAYS create a ticket FIRST for any issue you cannot resolve
    - Only consider calling operator for truly urgent/important situations
    - Provide clear explanation of what you've tried
    - Include relevant business context and urgency
    - Set appropriate priority based on user's emotional state and business impact
    - Ensure the ticket contains enough information for human agents to help effectively

    This ensures all issues are properly tracked and users get systematic help.
    `,
    schema: CreateTicketSchema,
    metadata: {
      visible: false,
    },
  }
);
