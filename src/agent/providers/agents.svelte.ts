import { pb } from "@/shared/lib/pb";
import { settingsProvider } from "@/user/settings.svelte";
import type { AgentsResponse } from "@/shared/models/pocketbase-types";
import { integrationsProvider } from "@/integration/providers/integrations.svelte";

class AgentsProvider {
  // STATE
  private subscribed = false;

  agents: AgentsResponse[] = $state([]);

  integrationAgents = $derived.by(() => {
    const integration = integrationsProvider.selectedIntegration;
    if (this.agents.length == 0 || !integration) return [];

    return this.agents.filter((a) => {
      return integration.agents.includes(a.id);
    });
  });

  selectedAgent = $derived.by(() => {
    if (this.agents.length == 0) return null;

    if (settingsProvider.selectedAgentId) {
      const found = this.agents.find(
        (r) => r.id === settingsProvider.selectedAgentId
      );
      if (found) return found;
    }

    return this.agents[0];
  });

  selectedIntegrationAgent = $derived.by(() => {
    if (this.integrationAgents.length == 0) return null;

    if (settingsProvider.selectedIntegrationAgentId) {
      const found = this.integrationAgents.find(
        (r) => r.id === settingsProvider.selectedIntegrationAgentId
      );
      if (found) return found;
    }

    return this.integrationAgents[0];
  });

  // SUBSCRIPTIONS
  private async load(projectId: string) {
    const agents = await pb.collection("agents").getFullList({
      filter: `project = "${projectId}"`,
    });
    this.agents = agents;
  }

  async subscribe(projectId: string) {
    if (this.subscribed) return;
    this.subscribed = true;

    await this.load(projectId);

    pb.collection("agents").subscribe(
      "*",
      async (agent) => {
        console.log("agent", agent);
        switch (agent.action) {
          case "create":
            this.agents.push(agent.record);
            break;
          case "delete":
            this.agents = this.agents.filter((r) => r.id !== agent.record.id);
            break;
          case "update":
            this.agents = this.agents.map((r) =>
              r.id === agent.record.id ? agent.record : r
            );
            break;
          default:
            break;
        }
      },
      {
        filter: `project = "${projectId}"`,
      }
    );
  }

  unsubscribe() {
    pb.collection("agents").unsubscribe();
    this.subscribed = false;
  }
}

export const agentsProvider = new AgentsProvider();
