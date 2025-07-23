import { pb } from "../../shared/lib/pb";
import type { DocumentsResponse } from "../../shared/models/pocketbase-types";

class DocumentsProvider {
  private subscribed = $state(false);

  documents: DocumentsResponse[] = $state([]);

  async load(projectId: string) {
    const documents = await pb.collection("documents").getFullList({
      filter: `source.project = "${projectId}"`,
    });
    this.documents = documents;
  }

  async subscribe(projectId: string) {
    if (this.subscribed) return;
    this.subscribed = true;

    await this.load(projectId);

    pb.collection("documents").subscribe(
      "*",
      async (document) => {
        switch (document.action) {
          case "create":
            this.documents.push(document.record);
            break;
          case "delete":
            this.documents = this.documents.filter(
              (r) => r.id !== document.record.id
            );
            break;
          case "update":
            this.documents = this.documents.map((r) =>
              r.id === document.record.id ? document.record : r
            );
            break;
          default:
            break;
        }
      },
      {
        filter: `source.project = "${projectId}"`,
      }
    );
  }

  unsubscribe() {
    pb.collection("documents").unsubscribe();
    this.subscribed = false;
  }
}

export const documentsProvider = new DocumentsProvider();
