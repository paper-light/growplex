import { pb } from "@/shared/lib/pb";
import type { TicketsResponse } from "@/shared/models/pocketbase-types";

class TicketsProvider {
  private subscribed = false;

  tickets: TicketsResponse[] = $state([]);

  private async load(projectId: string) {
    const tickets = await pb.collection("tickets").getFullList({
      filter: `message.room.chat.project = "${projectId}"`,
      sort: "-created",
    });
    this.tickets = tickets;
  }

  async subscribe(projectId: string) {
    if (this.subscribed) return;
    this.subscribed = true;

    await this.load(projectId);

    pb.collection("tickets").subscribe(
      "*",
      async (ticket) => {
        switch (ticket.action) {
          case "create":
            this.tickets.push(ticket.record);
            break;
          case "delete":
            this.tickets = this.tickets.filter(
              (r) => r.id !== ticket.record.id
            );
            break;
          case "update":
            this.tickets = this.tickets.map((r) =>
              r.id === ticket.record.id ? ticket.record : r
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
    pb.collection("tickets").unsubscribe();
    this.subscribed = false;
  }
}

export const ticketsProvider = new TicketsProvider();
