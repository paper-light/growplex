import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { getContextVariable } from "@langchain/core/context";

import { pb } from "@/shared/lib/pb";
import { logger } from "@/shared/lib/logger";

const log = logger.child({
  module: "chat-service:agent:tools",
});

const UpdateLeadSchema = z.object({
  description: z
    .string()
    .describe(
      "A comprehensive summary of the conversation, including user's needs, pain points, business context, and any decisions or next steps discussed"
    ),
  // OPTIONAL
  name: z
    .string()
    .optional()
    .describe("The full name of the user or contact person"),
  email: z
    .string()
    .optional()
    .describe("The email address of the user for follow-up communication"),
  tg: z
    .string()
    .optional()
    .describe("The Telegram ID or username of the user for messaging"),
  phone: z
    .string()
    .optional()
    .describe("The phone number of the user for calls or SMS"),
  payload: z
    .any()
    .optional()
    .describe(
      "Additional structured data including company info, role, budget, timeline, decision makers, specific requirements, or any other relevant business information in JSON format"
    ),
});

export const updateLead = tool(
  async ({
    description,
    name,
    email,
    phone,
    tg,
    payload,
  }: z.infer<typeof UpdateLeadSchema>) => {
    const lead = getContextVariable("lead");
    const room = getContextVariable("room");

    if (room.type === "preview") {
      return {
        success: true,
        content: `Lead is not updated in preview mode`,
      };
    }

    if (!lead) {
      log.warn(
        { roomId: getContextVariable("room")?.id },
        "Update lead tool call error: Lead is not set"
      );
      return {
        success: false,
        content: "Lead is not set",
      };
    }

    let updateData: Record<string, any> = {};
    if (description) updateData.description = description;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (tg) updateData.tg = tg;
    if (payload) updateData.metadata = payload;

    await pb.collection("leads").update(lead.id, updateData);
    return {
      success: true,
      content: `
      Lead updated with data: ${JSON.stringify(updateData)}
      Never mention that you have updated the lead.
      `,
    };
  },
  {
    name: "updateLead",
    description: `
    STRATEGIC LEAD CAPTURE: Use this tool to systematically collect and update customer information for sales follow-up.

    WHEN TO USE:
    - User provides ANY personal information (name, email, phone, etc.)
    - User shares business information (company, role, industry)
    - User discusses needs, pain points, or requirements
    - User mentions budget, timeline, or decision-making process
    - User shows interest in your solutions or services
    - User asks about pricing, features, or implementation
    - User provides contact information for follow-up
    - User shares specific use cases or requirements
    - User mentions competitors or current solutions
    - User discusses decision makers or approval process

    STRATEGY:
    - Always be helpful first, then capture information naturally
    - Use this to build comprehensive customer profiles
    - Include context about their business needs and pain points
    - Track their level of interest and buying signals
    - Collect information that will help sales team follow up effectively
    - Never be pushy - only capture what they willingly share

    This information is crucial for converting prospects into customers and enabling effective sales follow-up.
    `,
    schema: UpdateLeadSchema,
    metadata: {
      visible: false,
    },
  }
);
