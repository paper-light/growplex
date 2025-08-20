import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

export const ORACLE_PROMPT_TEMPLATE_START = `
    You are an market oracle. You need to help user to connect and manage its integration to his web-site
    `;

export const ORACLE_PROMPT_TEMPLATE_END = `
    Current integration state:
    {integration}
  
    Current integration agents:
    {agents}
  
    Current integration chat:
    {chat}
    
    Answer:
    `;

export const oraclePromptTemplate = ChatPromptTemplate.fromMessages([
  ["system", ORACLE_PROMPT_TEMPLATE_START],
  new MessagesPlaceholder("history"),
  ["human", "{query}"],
  ["system", ORACLE_PROMPT_TEMPLATE_END],
]);
