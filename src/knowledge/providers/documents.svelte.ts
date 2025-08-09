import { SvelteMap } from "svelte/reactivity";

import { pb } from "@/shared/lib/pb";
import type { DocumentsResponse } from "@/shared/models/pocketbase-types";

class DocumentsProvider {
  pageSize = $state(50);

  private subscribed = false;

  documentsMap: SvelteMap<string, DocumentsResponse[]> = $state(
    new SvelteMap()
  );

  async initSource(sourceId: string) {
    if (this.documentsMap.has(sourceId)) return;
    this.documentsMap.set(sourceId, []);

    const pageResult = await pb
      .collection("documents")
      .getList(1, this.pageSize, {
        filter: `source = "${sourceId}"`,
        sort: "created",
      });
    this.documentsMap.set(sourceId, pageResult.items);

    const allSourceDocs = await pb.collection("documents").getFullList({
      filter: `source = "${sourceId}"`,
      sort: "created",
    });
    this.documentsMap.set(sourceId, allSourceDocs);
  }

  async loadAll(projectId: string) {
    const sources = await pb.collection("sources").getFullList({
      filter: `project = "${projectId}"`,
    });

    for (const source of sources) {
      await this.initSource(source.id);
    }
  }

  async subscribe(projectId: string) {
    if (this.subscribed) return;

    this.subscribed = true;

    this.loadAll(projectId);

    pb.collection("documents").subscribe(
      "*",
      async (document) => {
        switch (document.action) {
          case "create": {
            const docs = this.documentsMap.get(document.record.source) || [];
            const newDocs = [...docs, document.record];
            this.documentsMap.set(document.record.source, newDocs);
            break;
          }
          case "delete": {
            const docs = this.documentsMap.get(document.record.source) || [];
            const filteredDocs = docs.filter(
              (r) => r.id !== document.record.id
            );
            this.documentsMap.set(document.record.source, filteredDocs);
            break;
          }

          case "update": {
            const docs = this.documentsMap.get(document.record.source) || [];
            const updatedDocs = docs.map((r) =>
              r.id === document.record.id ? document.record : r
            );
            this.documentsMap.set(document.record.source, updatedDocs);
            break;
          }
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
    this.documentsMap.clear();
  }
}

export const documentsProvider = new DocumentsProvider();
