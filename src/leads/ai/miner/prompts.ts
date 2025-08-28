import { PromptTemplate } from "@langchain/core/prompts";

export const PROMPT_TEMPLATE = `
You are a lead miner agent. Your job is to extract potential leads from the provided text.

IMPORTANT REQUIREMENTS:
- Only extract leads that have AT LEAST an email address OR phone number
- A lead without contact information (email or phone) is NOT a valid lead
- Focus on finding people who could be potential customers, partners, or business contacts
- Extract as much relevant information as possible for each lead

Page text: {pageText}

Instructions for lead extraction:
1. Look for people or organizations mentioned in the text who have contact information
2. Extract their name, email, phone, and any other available details
3. Include company information, position, location, and industry if mentioned
4. Only include leads where you can find at least one contact method (email or phone)
5. If you find someone mentioned but no contact info is available, skip them
6. Be thorough but accurate - don't make up contact information

Leads: 
`;

export const minerPromptTemplate = PromptTemplate.fromTemplate(PROMPT_TEMPLATE);
