import { pb } from "@/shared/lib/pb";
import {
  type ChatsResponse,
  type AgentsResponse,
  type IntegrationsResponse,
  type SourcesResponse,
  type OrgsResponse,
  type ProjectsResponse,
} from "@/shared/models/pocketbase-types";

export type ProjectMemory = {
  project: ProjectsResponse;
  org: OrgsResponse;
  integrations: IntegrationsResponse[];
  agents: AgentsResponse[];
  sources: SourcesResponse[];
  chats: ChatsResponse[];
};

export async function loadProjectMemory(
  projectId: string
): Promise<ProjectMemory> {
  const project = await pb.collection("projects").getOne(projectId, {
    expand:
      "org,integrations_via_project,agents_via_project,sources_via_project,chats_via_project",
  });

  const org: OrgsResponse = (project.expand as any)?.org || null;
  const integrations: IntegrationsResponse[] =
    (project.expand as any)?.integrations_via_project || [];
  const agents: AgentsResponse[] =
    (project.expand as any)?.agents_via_project || [];
  const sources: SourcesResponse[] =
    (project.expand as any)?.sources_via_project || [];
  const chats: ChatsResponse[] =
    (project.expand as any)?.chats_via_project || [];

  project.expand = null;
  org.expand = null;
  integrations.forEach((i) => (i.expand = null));
  agents.forEach((a) => (a.expand = null));
  sources.forEach((s) => (s.expand = null));
  chats.forEach((c) => (c.expand = null));

  return {
    project,
    org,
    integrations,
    agents,
    sources,
    chats: chats.filter((c) => c.type !== "inner"),
  };
}
