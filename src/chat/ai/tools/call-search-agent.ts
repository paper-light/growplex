import type { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";

import { searchChain } from "@/search/ai/workflow";
import { EnhancerReturnSchema } from "@/search/ai/enhancer";
import { logger } from "@/shared/lib/logger";

const log = logger.child({ module: "chat:ai:tools:call-search-agent" });

export const callSearchChain = tool(
  async (input: any, config: RunnableConfig) => {
    const args = EnhancerReturnSchema.parse(input);
    const { roomId } = config.configurable || {};

    const result = await searchChain.invoke({
      ...args,
      roomId,
    });

    const usage = result.raw.response_metadata.usage_metadata;
    log.debug({ usage }, "searchChain usage");

    return result.parsed;
  },
  {
    name: "callSearchChain",
    description: `
    CRITICAL: Use this tool IMMEDIATELY when the user asks ANY factual question that requires current information, data, or knowledge not available in the chat history.

    This tool searches through your knowledge base and external sources to find accurate, up-to-date information. 
    
    WHEN TO USE (ALWAYS call this first):
    - User asks about current events, news, or recent developments
    - User asks for specific data, statistics, or facts
    - User asks about topics not covered in previous conversation
    - User asks "what is", "how to", "when", "where", "who" questions
    - User asks for recommendations or comparisons
    - User asks about technical details, specifications, or procedures
    - User asks about pricing, features, or product information
    - User asks about industry trends or market data
    - User asks for case studies or examples
    
    IMPORTANT: NEVER attempt to answer factual questions without real proof from your knowledge base.
    This tool ensures you provide accurate, verifiable information that builds trust with potential customers.
    If there is no information in the knowledge base, you should admit that you do not have the information. Create a ticket and offer to escalate the request to a human.
    
    Input: The enhanced query structure with the user's question, relevant keywords, and entities.
    Output: Comprehensive, factual information from your knowledge base and search results.
    `,
    schema: EnhancerReturnSchema,
  }
);
