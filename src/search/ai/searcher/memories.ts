import type {
  RoomsResponse,
  OrgsResponse,
  SourcesResponse,
} from "@/shared/models/pocketbase-types";
import { pb } from "@/shared/lib/pb";

export type SearchMemory = {
  room: RoomsResponse;
  org: OrgsResponse;
  sources: SourcesResponse[];
};

export async function loadSearchMemory(roomId: string): Promise<SearchMemory> {
  const room = await pb.collection("rooms").getOne(roomId, {
    expand:
      "chat,chat.integration,chat.integration.sources,chat.project,chat.project.org",
  });

  return {
    room,
    org: (room.expand as any).chat.expand.project.expand.org as OrgsResponse,
    sources: (room.expand as any).chat.expand.integration.expand
      .sources as SourcesResponse[],
  };
}
