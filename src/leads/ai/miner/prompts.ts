import { PromptTemplate } from "@langchain/core/prompts";

export const PROMPT_TEMPLATE = `
You are a lead miner agent. Your job is to mine leads from the provided text.

Page text: {pageText}

Leads: 
`;

export const minerPromptTemplate = PromptTemplate.fromTemplate(PROMPT_TEMPLATE);
