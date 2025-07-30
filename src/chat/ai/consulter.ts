// import * as hub from "langchain/hub/node";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableLambda } from "@langchain/core/runnables";
import { getContextVariable } from "@langchain/core/context";

import { getEnv } from "@/shared/helpers/get-env";
import { logger } from "@/shared/lib/logger";
import { SystemMessage } from "@langchain/core/messages";
import type { LangchainMessage } from "@/messages/history/langchain-adapter";

import { chatTools } from "./tools";

const log = logger.child({ module: "chat:ai:consulter" });

const ENV = getEnv("ENV");
const OPENAI_API_KEY = getEnv("OPENAI_API_KEY");

const CONSULTER_PROMPT_TEMPLATE_START = `
You are a helpful assistant that can answer questions and help with tasks.

Knowledge: {knowledge}

Answer:
`;

const CONSULTER_PROMPT_TEMPLATE_END = `
Always answer in the same language as the user query.

Additional instructions: {system}

User query: {query}

Answer:
`;

const consulterPromptTemplate = ChatPromptTemplate.fromMessages([
  new SystemMessage(CONSULTER_PROMPT_TEMPLATE_START),
  new MessagesPlaceholder("history"),
  new SystemMessage(CONSULTER_PROMPT_TEMPLATE_END),
]);

export const baseConsulterModel = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0.5,
  // maxTokens: MAX_TOKENS,
  apiKey: OPENAI_API_KEY,
});

export const consulterChain = RunnableLambda.from(
  ({ history }: { history: LangchainMessage[] }) => {
    const knowledge = getContextVariable("knowledge") || "";
    const query = getContextVariable("query");
    const agent = getContextVariable("agent");

    const tools = getContextVariable("withTools") ? chatTools : [];

    log.debug({ history }, "consulterChain history");

    return consulterPromptTemplate
      .pipe(baseConsulterModel.bindTools(tools))
      .invoke({
        history,
        knowledge,
        query,
        system: agent.system,
      });
  }
);
