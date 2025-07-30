import { z } from "zod";

import { searchChainWithContext } from "@/search/ai/workflow";

export const callSearchChain = searchChainWithContext.asTool({
  name: "callSearchChain",
  description: `
    Call this tool when user is asking for information that is not available in the chat history.
    The search agent will do the search and return the information to the user.
  `,
  schema: z.object(),
});
