import { pb } from "@/shared/lib/pb";
import type { DocumentsResponse } from "@/shared/models/pocketbase-types";

class DocumentsProvider {
  private subscribed = false;

  pageSize = $state(50);
  totalItems = $state(0);
  totalPages = $state(0);

  documents: DocumentsResponse[] = $state([]);

  async init(sourceId: string) {
    const res = await pb.collection("documents").getList(1, this.pageSize, {
      filter: `source = "${sourceId}"`,
      sort: "created",
    });
    this.documents = res.items;
    this.totalItems = res.totalItems;
    this.totalPages = res.totalPages;

    await this.loadAll(sourceId);
  }

  async loadAll(sourceId: string) {
    this.documents = await pb.collection("documents").getFullList({
      filter: `source = "${sourceId}"`,
      sort: "created",
    });
  }

  async subscribe(sourceId: string) {
    if (this.subscribed) return;
    this.subscribed = true;

    await this.init(sourceId);

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
        filter: `source = "${sourceId}"`,
        sort: "created",
      }
    );
  }

  unsubscribe() {
    pb.collection("documents").unsubscribe();
    this.subscribed = false;
    this.documents = [];
    this.totalItems = 0;
    this.totalPages = 0;
  }
}

export const documentsProvider = new DocumentsProvider();
