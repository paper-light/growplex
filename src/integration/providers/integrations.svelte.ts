import { pb } from "@/shared/lib/pb";
import { settingsProvider } from "@/user/settings.svelte";

import type { IntegrationsResponse } from "@/shared/models/pocketbase-types";

class IntegrationsProvider {
  // STATE
  private subscribed = false;

  integrations: IntegrationsResponse[] = $state([]);

  selectedIntegration = $derived.by(() => {
    if (!this.integrations.length) return null;

    if (settingsProvider.selectedIntegrationId) {
      const found = this.integrations.find(
        (r) => r.id === settingsProvider.selectedIntegrationId
      );
      if (found) return found;
    }

    return this.integrations[0];
  });

  // SUBSCRIPTIONS
  private async load(projectId: string) {
    const integrations = await pb.collection("integrations").getFullList({
      filter: `project = "${projectId}"`,
      sort: "created",
    });
    this.integrations = integrations;
  }

  async subscribe(projectId: string) {
    if (this.subscribed) return;
    this.subscribed = true;

    await this.load(projectId);

    pb.collection("integrations").subscribe(
      "*",
      async (integration) => {
        console.log("integration", integration);
        switch (integration.action) {
          case "create":
            this.integrations.push(integration.record);
            break;
          case "delete":
            this.integrations = this.integrations.filter(
              (r) => r.id !== integration.record.id
            );
            break;
          case "update":
            this.integrations = this.integrations.map((r) =>
              r.id === integration.record.id ? integration.record : r
            );
            break;
          default:
            break;
        }
      },
      {
        filter: `project = "${projectId}"`,
        sort: "created",
      }
    );
  }

  unsubscribe() {
    pb.collection("integrations").unsubscribe();
    this.subscribed = false;
  }
}

export const integrationsProvider = new IntegrationsProvider();
