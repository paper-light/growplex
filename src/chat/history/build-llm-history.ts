import {
  MessagesRoleOptions,
  type MessagesResponse,
} from "@/shared/models/pocketbase-types";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { ToolMessage } from "@langchain/core/messages";
import { AIMessage } from "@langchain/core/messages";

export function buildLlmHistory(
  history: MessagesResponse[]
): (AIMessage | ToolMessage | SystemMessage | HumanMessage)[] {
  const llmHistory: (AIMessage | ToolMessage | SystemMessage | HumanMessage)[] =
    [];

  for (const msg of history) {
    switch (msg.role) {
      case MessagesRoleOptions.system:
        llmHistory.push(new SystemMessage({ content: msg.content }));
        break;

      case MessagesRoleOptions.operator:
        llmHistory.push(
          new HumanMessage({
            content: msg.content,
            name: `${msg.role}-${msg.sentBy.replace(/[\s<|\\/>\:]+/g, "_")}`,
          })
        );
        break;

      case MessagesRoleOptions.user:
        llmHistory.push(
          new HumanMessage({
            content: msg.content,
            name: `${msg.role}-${msg.sentBy.replace(/[\s<|\\/>\:]+/g, "_")}`,
          })
        );
        break;

      case MessagesRoleOptions.assistant:
        const toolMessages = (msg.metadata as any)?.toolMessages;
        if (toolMessages && Array.isArray(toolMessages)) {
          llmHistory.push(
            new AIMessage({
              content: msg.content,
              name: `${msg.role}-${msg.sentBy.replace(/[\s<|\\/>\:]+/g, "_")}`,
              tool_calls: toolMessages.map((tool: any, index: number) => {
                return {
                  id: tool.id,
                  name: tool.name,
                  args: tool.args,
                };
              }),
            })
          );
        } else {
          llmHistory.push(
            new AIMessage({
              content: msg.content,
              name: `${msg.role}-${msg.sentBy.replace(/[\s<|\\/>\:]+/g, "_")}`,
            })
          );
        }
        break;

      case MessagesRoleOptions.tool:
        const res = JSON.parse(msg.content);
        llmHistory.push(
          new ToolMessage({
            content: res.content,
            name: `${msg.role}-${msg.sentBy.replace(/[\s<|\\/>\:]+/g, "_")}`,
            tool_call_id: (msg.metadata as any).toolCallId,
            status: res.success ? "success" : "error",
          })
        );
        break;
    }
  }

  return llmHistory;
}
