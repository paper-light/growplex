import { pb } from "@/shared/lib/pb";
import type {
  ChatsResponse,
  IntegrationsResponse,
  ProjectsResponse,
  SubscriptionsResponse,
} from "@/shared/models/pocketbase-types";
import { logger } from "@/shared/lib/logger";

interface RoomUsage {
  usage: number;
}
type RoomsUsage = Record<string, RoomUsage>;

interface IntegrationUsage {
  usage: number;
}
type IntegrationsUsage = Record<string, IntegrationUsage>;

interface ChatUsage {
  usage: number;
  rooms: RoomsUsage;
}
type ChatsUsage = Record<string, ChatUsage>;

interface ProjectUsage {
  usage: number;
  integrations: IntegrationsUsage;
  chats: ChatsUsage;
}
type ProjectsUsage = Record<string, ProjectUsage>;

interface UsagePayload {
  projects: ProjectsUsage;
}

const log = logger.child({
  module: "analytics",
});

export async function saveRoomCharge(roomId: string) {
  const room = await pb.collection("rooms").getOne(roomId, {
    expand:
      "chat,chat.integration,chat.project,chat.project.org,chat.project.org.subscription",
  });
  const chat: ChatsResponse = (room.expand as any)?.chat;
  const integration: IntegrationsResponse = (chat.expand as any)?.integration;
  const project: ProjectsResponse = (chat.expand as any)?.project;
  const sub: SubscriptionsResponse = (project.expand as any)?.org.expand
    ?.subscription;

  log.info({ roomId }, "Saving room charge");

  // Init usagePayload
  let usagePayload: UsagePayload;
  if (
    sub.usagePayload &&
    typeof sub.usagePayload === "object" &&
    "projects" in sub.usagePayload
  ) {
    usagePayload = sub.usagePayload as UsagePayload;
  } else {
    usagePayload = { projects: {} };
  }

  // Build the nested structure
  if (!usagePayload.projects[project.id]) {
    usagePayload.projects[project.id] = {
      usage: 0,
      integrations: {},
      chats: {},
    };
  }

  const projectUsage = usagePayload.projects[project.id];

  if (!projectUsage.integrations[integration.id]) {
    projectUsage.integrations[integration.id] = { usage: 0 };
  }

  if (!projectUsage.chats[chat.id]) {
    projectUsage.chats[chat.id] = {
      usage: 0,
      rooms: {},
    };
  }

  const integrationUsage: IntegrationUsage =
    projectUsage.integrations[integration.id];
  const chatUsage = projectUsage.chats[chat.id];

  if (!chatUsage.rooms[roomId]) {
    chatUsage.rooms[roomId] = { usage: 0 };
  }

  const roomUsage = chatUsage.rooms[roomId];

  // Increment usage
  roomUsage.usage += 1;
  chatUsage.usage += 1;
  integrationUsage.usage += 1;
  projectUsage.usage += 1;

  // Save the updated usage payload
  await pb.collection("subscriptions").update(sub.id, {
    usagePayload: usagePayload,
  });
}
