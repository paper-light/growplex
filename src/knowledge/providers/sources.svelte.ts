import { pb } from "../../shared/lib/pb";
import { settingsProvider } from "../../user/settings.svelte";
import type { SourcesResponse } from "../../shared/models/pocketbase-types";

class SourcesProvider {
  private subscribed = $state(false);

  sources: SourcesResponse[] = $state([]);

  source = $derived.by(() => {
    if (!this.sources.length) return null;
    if (settingsProvider.source) {
      const found = this.sources.find((r) => r.id === settingsProvider.source);
      if (found) return found;
    }
    return this.sources[0];
  });

  async load(projectId: string) {
    const sources = await pb.collection("sources").getFullList({
      filter: `projects_via_sources.id="${projectId}"`,
    });
    this.sources = sources;
  }

  async subscribe(projectId: string) {
    if (this.subscribed) return;
    this.subscribed = true;

    await this.load(projectId);

    pb.collection("sources").subscribe(
      "*",
      async (source) => {
        switch (source.action) {
          case "create":
            this.sources.push(source.record);
            break;
          case "delete":
            this.sources = this.sources.filter(
              (r) => r.id !== source.record.id
            );
            break;
          case "update":
            this.sources = this.sources.map((r) =>
              r.id === source.record.id ? source.record : r
            );
            break;
          default:
            break;
        }
      },
      {
        filter: `projects_via_sources.id = "${projectId}"`,
      }
    );
  }

  unsubscribe() {
    pb.collection("rooms").unsubscribe();
    this.subscribed = false;
  }
}

export const sourcesProvider = new SourcesProvider();
