import { Document } from "@langchain/core/documents";
import { setContextVariable } from "@langchain/core/context";
import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { RunnableLambda } from "@langchain/core/runnables";

import { pb } from "../../shared/lib/pb";
import { logger } from "../../shared/lib/logger";
import {
  MessagesRoleOptions,
  type IntegrationsResponse,
  type LeadsResponse,
  type MessagesRecord,
  type MessagesResponse,
} from "../../shared/models/pocketbase-types";
import type { IntegrationExpand } from "../../shared/models/expands";

import { extractorService } from "../../rag/extractor";
import { createDocumentIdsFilter } from "../../rag/filters";

import { updateHistory, getHistory } from "../history";
import { assistantAgent, assistantToolsMap, finalStepAgent } from "../agent";
import { globalEncoderService } from "@/llm";
import { buildLlmHistory } from "../history/build-llm-history";

const log = logger.child({ module: "chat-service" });

export async function callChatAssistant(
  integrationId: string,
  roomId: string
): Promise<MessagesResponse[]> {
  // Get integration
  const { integration, org, agent, chat, sources } = await getIntegrationData(
    integrationId
  );
  const responseMessages: MessagesResponse[] = [];

  const { lead, room } = await getLeadData(roomId);

  if (!agent || !chat || !integration) {
    log.warn({ integrationId }, `Integration has not agent`);
    throw Error(`Integration ${integrationId} has not agent`);
  }

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
  const docIds = sources?.flatMap((s) => s.documents) || [];
  let knowledge = "";

  try {
    const retriever = await extractorService.createRetriever(org.id, {
      filter: createDocumentIdsFilter(docIds),
    });
    knowledge = await retriever
      .pipe((documents: Document[]) => {
        return documents.map((document) => document.pageContent).join("\n\n");
      })
      .invoke(msg.content);
  } catch (error) {
    log.error({ error, orgId: org.id, docIds }, "Failed to retrieve knowledge");
    // Continue without knowledge if retrieval fails
    knowledge = "";
  }

  log.info({
    knowledge,
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
        contentTokensCount: globalEncoderService.countTokens(
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
          contentTokensCount: globalEncoderService.countTokens(
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
    contentTokensCount: globalEncoderService.countTokens(
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

// ------------PRIVATE FUNCTIONS---------------

async function getIntegrationData(integrationId: string) {
  const integration = await pb
    .collection("integrations")
    .getOne<IntegrationsResponse<IntegrationExpand>>(integrationId, {
      expand:
        "chat,agent,sources,projects_via_integrations,projects_via_integrations.orgs_via_projects",
    });

  const org =
    integration.expand!.projects_via_integrations![0]!.expand!
      .orgs_via_projects[0]!;

  const agent = integration.expand!.agent;
  const chat = integration.expand!.chat;
  const sources = integration.expand!.sources;

  return {
    integration,
    org,
    agent,
    chat,
    sources,
  };
}

async function getLeadData(roomId: string) {
  const room = await pb
    .collection("rooms")
    .getOne(roomId, { expand: "leads_via_room" });
  const lead =
    ((room.expand as any)?.leads_via_room?.[0] as LeadsResponse | null) || null;

  return {
    lead,
    room,
  };
}
