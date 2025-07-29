import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { getContextVariable } from "@langchain/core/context";

import { pb } from "@/shared/lib/pb";
import { logger } from "@/shared/lib/logger";

const log = logger.child({
  module: "chat-service:agent:tools",
});

const UpdateLeadSchema = z.object({
  name: z.string().optional().describe("The name of the user, if provided"),
  email: z.string().optional().describe("The email of the user, if provided"),
  tg: z
    .string()
    .optional()
    .describe("The Telegram ID or username of the user, if provided"),
  phone: z
    .string()
    .optional()
    .describe("The phone number of the user, if provided"),
  payload: z
    .any()
    .optional()
    .describe(
      "The payload of the user, any important information in JSON format"
    ),
});

export const updateLead = tool(
  async ({
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
        error: "Lead is not set",
      };
    }

    let updateData: Record<string, any> = {};
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
    Call this tool, when user has provided important information about himself, like name, email, phone, or any relevant information.
    If you are not sure about the information, do not update the lead.
    `,
    schema: UpdateLeadSchema,
  }
);
