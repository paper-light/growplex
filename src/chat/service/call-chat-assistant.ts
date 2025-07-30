import { Document } from "@langchain/core/documents";
import { setContextVariable } from "@langchain/core/context";
import { ToolMessage } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";

import { pb } from "@/shared/lib/pb";
import { logger } from "@/shared/lib/logger";
import {
  MessagesRoleOptions,
  type AgentsResponse,
  type SourcesResponse,
  type IntegrationsResponse,
  type LeadsResponse,
  type MessagesRecord,
  type MessagesResponse,
  type OrgsResponse,
  type ChatsResponse,
  type DocumentsResponse,
  MessagesEventOptions,
} from "@/shared/models/pocketbase-types";

import { vectorRetriever } from "@/search/retrievers";
import { createSourcesFilter } from "@/search/filters";
import { embedder } from "@/search/embedder";

import { updateHistory, getHistory } from "../history";
import { buildLlmHistory } from "../history/build-llm-history";

const log = logger.child({ module: "chat-service" });

export async function callChatAssistant(
  integrationId: string,
  roomId: string
): Promise<MessagesResponse[]> {
  // Prepare history
  const rawHistory = await getHistory(integrationId, roomId, false);

  // Check if there are messages in history
  if (rawHistory.length === 0) {
    log.warn({ integrationId, roomId }, "No messages in history");
    throw new Error("No messages in history");
  }

  const msg = rawHistory.at(-1)!;
  const history = buildLlmHistory(rawHistory);

  // Get knowledge
  let knowledge = "";
  const sourceIds = sources?.map((s) => s.id) || [];
  log.info({ sourceIds }, "Source IDs");

  if (sourceIds.length > 0) {
    try {
      const retriever = await vectorRetriever.createRetriever(org.id, {
        filter: createSourcesFilter(sourceIds),
        k: 100,
      });
      knowledge = await retriever
        .pipe((documents: Document[]) => {
          return documents.map((document) => document.pageContent).join("\n\n");
        })
        .invoke(msg.content);
    } catch (error) {
      log.error(
        { error, orgId: org.id, sourceIds },
        "Failed to retrieve knowledge"
      );
    }
  }

  log.info({
    knowledgeLength: knowledge.length,
    historyLength: history.length - 1,
    msg: msg.content,
  });

  // Call LLM

  log.debug({ history }, "Assistant agent history");

  const assistantResp = await assistantAgent.invoke({
    history,
    knowledge,
    additional: agent.system,
  });
  let finalStepResp = assistantResp;

  log.info({ assistantResp }, "Assistant response");

  const toolMessages: ToolMessage[] = [];
  const toolMetadataArray: { visible: boolean }[] = [];
  const messagesToPersist: Partial<MessagesRecord>[] = [];

  // Only process tool calls if they exist
  if (assistantResp.tool_calls && assistantResp.tool_calls.length > 0) {
    for (const toolCall of assistantResp.tool_calls) {
      const toolLambda = RunnableLambda.from(async (toolCall: any) => {
        setContextVariable("message", msg);
        setContextVariable("lead", lead);
        setContextVariable("room", room);
        setContextVariable("integration", integration);
        setContextVariable("agent", agent);
        setContextVariable("sources", sources);
        setContextVariable("chat", chat);

        const toolMsg: ToolMessage = await assistantToolsMap[
          toolCall.name
        ].invoke(toolCall);

        const visible = ["callOperator"].includes(toolCall.name);

        const metadata = {
          visible,
        };

        return {
          toolMsg,
          metadata,
        };
      });

      const { toolMsg, metadata } = await toolLambda.invoke(toolCall);
      toolMessages.push(toolMsg);
      toolMetadataArray.push(metadata);
    }

    log.info({ toolMessages, toolMetadataArray }, "ToolMessages array");

    // Add assistant response and tool messages to persist list
    messagesToPersist.push(
      {
        content: "<BLANK>",
        role: MessagesRoleOptions.assistant,
        room: roomId,
        sentBy: agent.name,
        visible: false,
        contentTokensCount: embedder.countTokens(
          assistantResp.content.toString(),
          "gpt-4"
        ),
        metadata: {
          avatar: pb.files.getURL(agent, agent.avatar),
          toolMessages: assistantResp.tool_calls?.map((tool) => {
            return {
              id: tool.id, // Include the tool call ID
              name: tool.name,
              args: tool.args,
            };
          }),
        },
      },
      ...toolMessages.map((msg, index) => {
        return {
          content: msg.content.toString(),
          role: MessagesRoleOptions.tool,
          room: roomId,
          sentBy: agent.name,
          event:
            msg.name === "callOperator"
              ? MessagesEventOptions.wailtingOperator
              : undefined,
          contentTokensCount: embedder.countTokens(
            msg.content.toString(),
            "gpt-4"
          ),
          visible: toolMetadataArray[index].visible,
          metadata: {
            toolCallId: msg.tool_call_id,
          },
        };
      })
    );

    try {
      finalStepResp = await finalStepAgent.invoke({
        history: [...history, assistantResp, ...toolMessages],
        knowledge,
        additional: agent.system,
      });
      log.info({ finalStepResp }, "Final step response");
    } catch (error) {
      log.error(
        { error, integrationId, roomId },
        "Failed to get final step response"
      );
      finalStepResp = assistantResp;
    }
  }

  const tokenUsage = finalStepResp.response_metadata.tokenUsage;
  log.info({ tokenUsage }, "Token usage");

  // Add final response to persist list
  messagesToPersist.push({
    content: finalStepResp.content.toString(),
    role: MessagesRoleOptions.assistant,
    visible: true,
    room: roomId,
    sentBy: agent.name,
    contentTokensCount: embedder.countTokens(
      finalStepResp.content.toString(),
      "gpt-4"
    ),
    metadata: {
      avatar: pb.files.getURL(agent, agent.avatar),
      tokenUsage,
    },
  });

  // Persist all messages in a single update
  try {
    const newMsgs = await updateHistory(messagesToPersist);
    log.info(
      { roomId, persistedCount: newMsgs.length },
      "Successfully persisted all messages"
    );

    const visibleMessages = newMsgs.filter((m) => m.visible);
    for (const msg of visibleMessages) {
      responseMessages.push(msg);
    }
  } catch (error) {
    log.error(
      { error, roomId, messageCount: messagesToPersist.length },
      "Failed to persist messages"
    );
    throw new Error(`Failed to persist chat messages: ${error}`);
  }

  return responseMessages;
}