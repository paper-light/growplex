import type { StructuredTool } from "@langchain/core/tools";

import { logger } from "@/shared/lib/logger";

import { updateIntegrationAgentTool } from "./update-integration-agent";
import { updateIntegrationChatTool } from "./update-integration-chat";
import { updateIntegrationTool } from "./update-integration";

const log = logger.child({ module: "gateway:ai:oracle:tools" });

export const oracleTools: StructuredTool[] = [
  updateIntegrationChatTool,
  updateIntegrationAgentTool,
  updateIntegrationTool,
];
export const oracleToolsMap = oracleTools.reduce((acc, tool) => {
  acc[tool.name] = tool;
  return acc;
}, {} as Record<string, StructuredTool>);
