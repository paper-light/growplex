import { pb } from "@/shared/lib/pb";
import type { LeadsResponse } from "@/shared/models/pocketbase-types";

class LeadsProvider {
  private subscribed = false;

  leads: LeadsResponse[] = $state([]);

  private async load(projectId: string) {
    const leads = await pb.collection("leads").getFullList({
      filter: `project = "${projectId}"`,
      sort: "-created",
    });
    this.leads = leads;
  }

  async subscribe(projectId: string) {
    if (this.subscribed) return;
    this.subscribed = true;

    await this.load(projectId);

    pb.collection("leads").subscribe(
      "*",
      async (lead) => {
        switch (lead.action) {
          case "create":
            this.leads.unshift(lead.record);
            break;
          case "delete":
            this.leads = this.leads.filter((r) => r.id !== lead.record.id);
            break;
          case "update":
            this.leads = this.leads.map((r) =>
              r.id === lead.record.id ? lead.record : r
            );
            break;
          default:
            break;
        }
      },
      {
        filter: `project = "${projectId}"`,
        sort: "-created",
      }
    );
  }

  unsubscribe() {
    pb.collection("leads").unsubscribe();
    this.subscribed = false;
  }
}

export const leadsProvider = new LeadsProvider();
