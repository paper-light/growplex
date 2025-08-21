import { pb } from "@/shared/lib/pb";
import {
  type ChatsResponse,
  type AgentsResponse,
  type IntegrationsResponse,
  type SourcesResponse,
} from "@/shared/models/pocketbase-types";
import { logger } from "@/shared/lib/logger";

const log = logger.child({
  module: "shared:ai:memories:load-integration-memory",
});

export type IntegrationMemory = {
  chats: ChatsResponse[];
  integration: IntegrationsResponse;
  agents: AgentsResponse[];
  sources: SourcesResponse[];
};

export async function loadIntegrationMemory(
  integrationId: string
): Promise<IntegrationMemory> {
  const integration = await pb
    .collection("integrations")
    .getOne(integrationId, {
      filter: "chats_via_integration.type != 'inner'",
      expand: "agents,sources,chats_via_integration,project,project.org",
    });

  log.debug({ integration }, "Loaded integration");

  const agents: AgentsResponse[] = (integration.expand as any)?.agents || [];
  const chats: ChatsResponse[] =
    (integration.expand as any)?.chats_via_integration || [];
  const sources: SourcesResponse[] = (integration.expand as any)?.sources || [];

  integration.expand = null;
  agents.forEach((a) => (a.expand = null));
  sources.forEach((s) => (s.expand = null));
  chats.forEach((c) => (c.expand = null));

  return {
    integration,
    chats: chats.filter((c) => c.type !== "inner"),
    agents,
    sources,
  };
}
