import { pb } from "@/shared/lib/pb";
import { settingsProvider } from "@/user/settings.svelte";
import type { SourcesResponse } from "@/shared/models/pocketbase-types";

class SourcesProvider {
  private subscribed = $state(false);

  sources: SourcesResponse[] = $state([]);

  selectedSource = $derived.by(() => {
    if (!this.sources.length) return null;
    if (settingsProvider.selectedSourceId) {
      const found = this.sources.find(
        (r) => r.id === settingsProvider.selectedSourceId
      );
      if (found) return found;
    }
    return this.sources[0];
  });

  async load(projectId: string) {
    const sources = await pb.collection("sources").getFullList({
      filter: `project = "${projectId}"`,
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
        console.log("source", source);
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
        filter: `project = "${projectId}"`,
      }
    );
  }

  unsubscribe() {
    pb.collection("sources").unsubscribe();
    this.subscribed = false;
  }
}

export const sourcesProvider = new SourcesProvider();
