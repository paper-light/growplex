import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { getContextVariable } from "@langchain/core/context";

import { pb } from "../../../shared/lib/pb";

const CreateTicketSchema = z.object({
  title: z.string().describe("The title of the ticket"),
  description: z.string().describe("The detailed description of the ticket"),
  priority: z
    .enum(["low", "medium", "high"])
    .describe("The priority of the ticket"),
  payload: z
    .any()
    .optional()
    .describe("Any additional information in JSON format, if relevant"),
});

export const createTicket = tool(
  async ({
    title,
    description,
    priority,
    payload,
  }: z.infer<typeof CreateTicketSchema>) => {
    const msg = getContextVariable("message");
    if (!msg)
      throw new Error(
        "Create ticket tool call error: Triggering message is not set"
      );

    const ticket = await pb.collection("tickets").create({
      message: msg.id,
      title,
      description,
      priority,
      metadata: payload,
    });

    return {
      success: true,
      content: `Ticket created with data: ${JSON.stringify(ticket)}`,
    };
  },
  {
    name: "createTicket",
    description:
      "Create a ticket in the CRM system, with the provided title, description, and priority. Call this tool when user is unable to solve their problem and you can't help them.",
    schema: CreateTicketSchema,
  }
);
