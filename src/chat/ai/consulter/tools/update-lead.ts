import { z } from "zod";
import { tool } from "@langchain/core/tools";

import { pb } from "@/shared/lib/pb";
import { logger } from "@/shared/lib/logger";
import type { RunnableConfig } from "@langchain/core/runnables";

import type { ConsulterMemory } from "../memories";
import { RoomsTypeOptions } from "@/shared/models/pocketbase-types";

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
  async (input: any, config: RunnableConfig) => {
    const args = UpdateLeadSchema.parse(input);
    const { description, name, email, phone, tg, payload } = args;
    const { memory } = config.configurable as { memory: ConsulterMemory };

    const room = memory.room;
    const lead = memory.lead;

    if (room.type !== RoomsTypeOptions.chatWidget) {
      return {
        success: true,
        content: `Cannot update lead in ${room.type} mode, only in chatWidget mode`,
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
    description:
      "Update lead information when user provides personal/business details, contact info, or discusses needs/requirements.",
    schema: UpdateLeadSchema,
    metadata: {
      visible: false,
    },
  }
);
