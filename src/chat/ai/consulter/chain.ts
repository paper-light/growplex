import {
  RunnableLambda,
  RunnablePassthrough,
  RunnableSequence,
  RunnableParallel,
} from "@langchain/core/runnables";

import { logger } from "@/shared/lib/logger";

import { chatTools } from "./tools";
import { consulterMemory } from "./memory";
import { baseConsulterModel } from "./models";
import { consulterPromptTemplate } from "./prompts";

const log = logger.child({ module: "chat:ai:consulter" });

export type DynamicConsulterChainInput = {
  roomId: string;
  query: string;
  withTools: boolean;
  withSearch: boolean;
  knowledge: string;
};

export type ConsulterChainInput = {
  memory: Awaited<ReturnType<typeof consulterMemory.loadRoomContext>>;
  chainInput: DynamicConsulterChainInput;
};

export const consulterChain = RunnableSequence.from([
  RunnableParallel.from({
    chainInput: new RunnablePassthrough(),
    memory: consulterMemory.asLambda(),
  }),
  RunnableLambda.from((input: ConsulterChainInput) => {
    const { chainInput, memory } = input;
    const { query, withTools, withSearch, knowledge } = chainInput;
    const { history, agent, lead } = memory;

    let tools = withTools ? chatTools : [];
    if (!withSearch) tools = tools.filter((t) => t.name !== "callSearchChain");

    log.debug(
      { withTools, withSearch, tools },
      "consulterChain withTools and withSearch"
    );
    log.debug({ history }, "consulterChain history");
    log.debug({ knowledge, query, system: agent.system }, "Template variables");

    return consulterPromptTemplate
      .pipe(baseConsulterModel.bindTools(tools))
      .invoke({
        history,
        knowledge,
        system: agent.system,
        query,
        lead: JSON.stringify(lead, null, 2),
      });
  }),
]);
