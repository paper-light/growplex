import { embedder } from "@/search/embedder";
import { pb } from "@/shared/lib/pb";
import {
  MessagesRoleOptions,
  type AgentsResponse,
  type MessagesResponse,
  type MessagesRecord,
  MessagesEventOptions,
} from "@/shared/models/pocketbase-types";
import {
  SystemMessage,
  HumanMessage,
  AIMessageChunk,
} from "@langchain/core/messages";
import { ToolMessage } from "@langchain/core/messages";
import { AIMessage } from "@langchain/core/messages";

export type LangchainMessage =
  | AIMessage
  | ToolMessage
  | SystemMessage
  | HumanMessage
  | AIMessageChunk;

type Opts = {
  roomId: string;
  sentBy?: string;
  agent?: AgentsResponse;
  visible?: boolean;
  userRole?: "operator" | "guest";
  metadata?: Record<string, any>;
};

export type AnnotatedLangchainMessage = {
  msg: LangchainMessage;
  opts: Opts;
};

class HistoryLangchainAdapter {
  buildLangchainHistory(history: MessagesResponse[]): LangchainMessage[] {
    const langchainHistory: LangchainMessage[] = [];

    for (const msg of history) {
      langchainHistory.push(this.getLangchainMessage(msg));
    }

    return langchainHistory;
  }

  buildPBHistory(langchainHistory: AnnotatedLangchainMessage[]) {
    const pbHistory: Partial<MessagesRecord>[] = [];

    for (const data of langchainHistory) {
      pbHistory.push(this.getPBMessage(data.msg, data.opts));
    }

    return pbHistory;
  }

  private getPBMessage(msg: LangchainMessage, opts: Opts) {
    if (msg instanceof SystemMessage) {
      return {
        content: msg.content.toString(),
        role: MessagesRoleOptions.system,
        room: opts.roomId,
        sentBy: opts.sentBy,
        visible: false,
        contentTokensCount: embedder.countTokens(
          msg.content.toString(),
          "gpt-4"
        ),
        metadata: {
          ...(opts.metadata || {}),
          ...(msg.response_metadata || {}),
        },
      };
    } else if (msg instanceof HumanMessage) {
      return {
        content: msg.content.toString(),
        role:
          opts.userRole === "operator"
            ? MessagesRoleOptions.operator
            : MessagesRoleOptions.user,
        room: opts.roomId,
        sentBy: opts.sentBy,
        visible: opts.visible,
        contentTokensCount: embedder.countTokens(
          msg.content.toString(),
          "gpt-4"
        ),
        metadata: {
          ...(opts.metadata || {}),
          ...(msg.response_metadata || {}),
        },
      };
    } else if (msg instanceof AIMessage || msg instanceof AIMessageChunk) {
      return {
        content:
          msg.content.toString() ||
          `SELECTED TOOLS: \n\n${JSON.stringify(msg.tool_calls)}`,
        role: MessagesRoleOptions.assistant,
        room: opts.roomId,
        sentBy: opts.agent?.name,
        visible: opts.visible,
        contentTokensCount: embedder.countTokens(
          msg.content.toString(),
          "gpt-4"
        ),
        metadata: {
          ...(opts.metadata || {}),
          ...(msg.response_metadata || {}),
          avatar: opts.agent?.avatar
            ? pb.files.getURL(opts.agent, opts.agent.avatar)
            : undefined,
          toolMessages: msg.tool_calls || undefined,
        },
      };
    } else if (msg instanceof ToolMessage) {
      return {
        content: msg.content.toString(),
        role: MessagesRoleOptions.tool,
        room: opts.roomId,
        sentBy: opts.agent?.name,
        visible: opts.visible,
        contentTokensCount: embedder.countTokens(
          msg.content.toString(),
          "gpt-4"
        ),
        event: msg.name as MessagesEventOptions,
        metadata: {
          ...(opts.metadata || {}),
          ...(msg.response_metadata || {}),
          toolCallId: msg.tool_call_id!,
        },
      };
    } else {
      throw new Error("Unknown message type");
    }
  }

  private getLangchainMessage(msg: MessagesResponse) {
    switch (msg.role) {
      // SYSTEM, NOT USED NOW BECAUSE I DON'T WRITE SYSTEM MESSAGES IN DB
      case MessagesRoleOptions.system:
        return new SystemMessage({ content: msg.content });

      // OPERATOR AND USER => HUMAN MESSAGE
      case MessagesRoleOptions.operator:
        return new HumanMessage({
          content: msg.content,
          name: `${msg.role}-${msg.sentBy.replace(/[\s<|\\/>\:]+/g, "_")}`,
        });

      case MessagesRoleOptions.user:
        return new HumanMessage({
          content: msg.content,
          name: `${msg.role}-${msg.sentBy.replace(/[\s<|\\/>\:]+/g, "_")}`,
        });

      // ASSISTANT => AIMessage
      case MessagesRoleOptions.assistant:
        const toolMessages = (msg.metadata as any)?.toolMessages;
        // DECIDED TO USE TOOLS
        if (toolMessages && Array.isArray(toolMessages)) {
          return new AIMessage({
            content: msg.content,
            name: `${msg.role}-${msg.sentBy.replace(/[\s<|\\/>\:]+/g, "_")}`,
            tool_calls: toolMessages.map((tool: any, index: number) => {
              return {
                id: tool.id,
                name: tool.name,
                args: tool.args,
              };
            }),
          });
          // NO TOOLS
        } else {
          return new AIMessage({
            content: msg.content,
            name: `${msg.role}-${msg.sentBy.replace(/[\s<|\\/>\:]+/g, "_")}`,
          });
        }

      // TOOL => TOOL MESSAGE
      case MessagesRoleOptions.tool:
        const res = JSON.parse(msg.content);
        return new ToolMessage({
          content: res.content,
          name: `${msg.role}-${msg.sentBy.replace(/[\s<|\\/>\:]+/g, "_")}`,
          tool_call_id: (msg.metadata as any).toolCallId,
          status: res.success ? "success" : "error",
        });
    }
  }
}

export const historyLangchainAdapter = new HistoryLangchainAdapter();
