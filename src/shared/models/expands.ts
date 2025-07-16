import type {
  OrgMembersResponse,
  OrgsResponse,
  ProjectsResponse,
  IntegrationsResponse,
  AgentsResponse,
  SourcesResponse,
  ChatsResponse,
  UsersResponse,
  RoomsResponse,
} from "./pocketbase-types";

// INTEGRATIONS
export type ProjectsViaIntegrations = ProjectsResponse<{
  orgs_via_projects: OrgsResponse[];
}>[];

export type ProjectExpandStrict = {
  agents: AgentsResponse[];
  sources: SourcesResponse[];
  chats: ChatsResponse[];
  integrations: IntegrationsResponse<IntegrationExpand>[];
};
export type ProjectExpand = Partial<ProjectExpandStrict>;

export type IntegrationExpandStrict = {
  agent: AgentsResponse;
  sources: SourcesResponse[];
  chat: ChatsResponse;
  operators: UsersResponse[];
  projects_via_integrations: ProjectsViaIntegrations;
};
export type IntegrationExpand = Partial<IntegrationExpandStrict>;

// USERS
export type UserExpandStrict = {
  orgMembers: OrgMembersResponse<{
    org: OrgsResponse<{
      projects: ProjectsResponse<ProjectExpandStrict>[];
    }>;
  }>[];
};
export type UserExpand = Partial<UserExpandStrict>;

// CHAT & ROOMS
export type RoomExpandStrict = {
  chat: ChatsResponse;
};
export type RoomExpand = Partial<RoomExpandStrict>;
