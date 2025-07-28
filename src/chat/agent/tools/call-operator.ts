import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { getContextVariable } from "@langchain/core/context";

import { pb } from "../../../shared/lib/pb";

const CallOperatorSchema = z.object({
  description: z.string().describe("The description of the problem"),
  payload: z
    .any()
    .optional()
    .describe(
      "Any additional information in JSON format, that will help the operator to understand the user's problem"
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
    Call this tool when user is unable to solve their problem and you can't help them.
    The operator will be notified and will try to help the user.
    `,
    schema: CallOperatorSchema,
  }
);
