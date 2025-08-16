import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

export const INTEGRATION_MANAGER_PROMPT_TEMPLATE_START = `
  You are an integration manager. You need to help user to connect and manage its integration to his web-site
  `;

export const INTEGRATION_MANAGER_PROMPT_TEMPLATE_END = `
  Current integration state:
  {integration}

  Current agent state:
  {agent}

  Current chat state:
  {chat}
  
  Answer:
  `;

export const integrationManagerPromptTemplate = ChatPromptTemplate.fromMessages(
  [
    ["system", INTEGRATION_MANAGER_PROMPT_TEMPLATE_START],
    new MessagesPlaceholder("history"),
    ["human", "{query}"],
    ["system", INTEGRATION_MANAGER_PROMPT_TEMPLATE_END],
  ]
);
