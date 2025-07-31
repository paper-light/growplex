import { z } from "zod";

import { searchChainWithContext } from "@/search/ai/workflow";
import { tool } from "@langchain/core/tools";
import { EnhancerReturnSchema } from "@/search/ai/enhancer";

export const callSearchChain = tool(
  async (input: z.infer<typeof EnhancerReturnSchema>) => {
    const result = await searchChainWithContext.invoke(input);
    return result;
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
    
    Input: The enhanced query structure with the user's question, relevant keywords, and entities.
    Output: Comprehensive, factual information from your knowledge base and search results.
    `,
    schema: EnhancerReturnSchema,
  }
);
