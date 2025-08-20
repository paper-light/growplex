import type { StructuredTool } from "@langchain/core/tools";

import { callSearchAgent } from "./call-search-agent";
import { updateLead } from "./update-lead";
import { createTicket } from "./create-ticket";
import { callOperator } from "./call-operator";

export const consulterTools: StructuredTool[] = [
  updateLead,
  createTicket,
  callOperator,
  callSearchAgent,
];
export const consulterToolsMap = consulterTools.reduce((acc, tool) => {
  acc[tool.name] = tool;
  return acc;
}, {} as Record<string, StructuredTool>);
