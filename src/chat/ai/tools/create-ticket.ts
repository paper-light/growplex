import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { getContextVariable } from "@langchain/core/context";

import { pb } from "@/shared/lib/pb";

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
  async ({
    title,
    description,
    priority,
    payload,
  }: z.infer<typeof CreateTicketSchema>) => {
    // RUNNABLE DYNAMIC CONTEXT
    const msg = getContextVariable("message");
    const room = getContextVariable("room");
    if (!room || !msg)
      throw new Error(
        "Create ticket tool call error: Room or message is not set"
      );

    if (room.type === "preview") {
      return {
        success: true,
        content: `Ticket is not created in preview mode`,
      };
    }

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
    ESCALATION TOOL: Create a support ticket when you cannot resolve the user's issue and human intervention is required.

    WHEN TO USE:
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

    PRIORITY GUIDELINES:
    - HIGH: Angry/frustrated users, urgent business impact, system outages
    - MEDIUM: Can't solve but user is patient, general support requests
    - LOW: General inquiries, feature requests, non-urgent questions

    STRATEGY:
    - Always try to help first before escalating
    - Provide clear explanation of what you've tried
    - Include relevant business context and urgency
    - Set appropriate priority based on user's emotional state and business impact
    - Ensure the ticket contains enough information for human agents to help effectively

    This ensures users get the help they need while maintaining customer satisfaction.
    `,
    schema: CreateTicketSchema,
    metadata: {
      visible: false,
    },
  }
);
