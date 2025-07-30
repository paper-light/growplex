import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { getContextVariable } from "@langchain/core/context";

import { pb } from "@/shared/lib/pb";

const CallSearchAgentSchema = z.object({
  description: z.string().describe("The description of the problem"),
  // OPTIONAL
  payload: z
    .any()
    .optional()
    .describe(
      "Any additional information in JSON format, that will help the operator to understand the user's problem"
    ),
});

export const callSearchAgent = tool(
  async ({ description, payload }: z.infer<typeof CallSearchAgentSchema>) => {
    const room = getContextVariable("room");
    if (!room)
      throw new Error("Call operator tool call error: Room is not set");
  },
  {
    name: "callSearchAgent",
    description: `
        Call this tool when user is asking for information that is not available in the chat history.
        The search agent will do the search and return the information to the user.
    `,
    schema: CallSearchAgentSchema,
  }
);
