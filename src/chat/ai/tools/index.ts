import type { StructuredTool } from "@langchain/core/tools";

import { callSearchChain } from "./call-search-agent";
import { updateLead } from "./update-lead";
import { createTicket } from "./create-ticket";
import { callOperator } from "./call-operator";

export const chatTools: StructuredTool[] = [
  updateLead,
  createTicket,
  callOperator,

  // @ts-ignore
  callSearchChain,
];

export const chatToolsMap = chatTools.reduce((acc, tool) => {
  acc[tool.name] = tool;
  return acc;
}, {} as Record<string, StructuredTool>);
