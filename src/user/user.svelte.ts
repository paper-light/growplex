import { pb } from "../shared/lib/pb";
import type {
  IntegrationExpandStrict,
  ProjectExpandStrict,
  UserExpand,
} from "../shared/models/expands";
import type {
  IntegrationsResponse,
  ProjectsResponse,
  UsersResponse,
} from "../shared/models/pocketbase-types";
import { initData } from "./init-data";

import { settingsProvider } from "./settings.svelte";

class UserProvider {
  user = $state<UsersResponse<unknown, UserExpand> | null>(
    pb.authStore.isValid
      ? (pb.authStore.record as UsersResponse<unknown, UserExpand>)
      : null
  );
  token = $state(pb.authStore.token);

  orgMembers = $derived(this.user?.expand?.orgMembers || []);
  orgs = $derived(this.orgMembers.map((m) => m.expand!.org!));

  org = $derived.by(() => {
    if (!this.orgs.length) return null;
    if (settingsProvider.org) {
      const found = this.orgs.find((o) => o && o.id === settingsProvider.org);
      if (found) return found;
    }
    return this.orgs[0];
  });
  role = $derived.by(() => {
    if (!this.org) return null;
    const mem = this.orgMembers.find((m) => m.expand!.org?.id === this.org!.id);
    return mem?.role;
  });

  projects = $derived(this.org?.expand!.projects! || []);
  project = $derived.by(() => {
    if (!this.org) return null;
    if (!this.projects.length) return null;
    if (settingsProvider.project) {
      const found = this.projects.find(
        (p) => p.id === settingsProvider.project
      );
      if (found) return found;
    }
    return this.projects[0];
  });

  agents = $derived(this.project?.expand!.agents! || []);
  chats = $derived(this.project?.expand!.chats! || []);

  integrations = $derived(this.project?.expand!.integrations! || []);
  integration = $derived.by(() => {
    if (!this.integrations.length) return null;
    if (settingsProvider.integration) {
      const found = this.integrations.find(
        (i) => i.id === settingsProvider.integration
      );
      if (found) return found;
    }

    return this.integrations[0];
  });
  chat = $derived.by(() => {
    const chatId = this.integration?.chat;
    if (!chatId) return null;
    return this.chats.find((c) => c.id === chatId) || null;
  });
  agent = $derived.by(() => {
    const agentId = this.integration?.agent;
    if (!agentId) return null;
    return this.agents.find((a) => a.id === agentId) || null;
  });

  // USER MANAGEMENT
  async updateUser(data: Record<string, any>) {
    if (!this.user) return;
    const res = await pb.collection("users").update(this.user.id, data);
    const user = await initData();
    this.user = user;
    return res;
  }

  // ORG MANAGEMENT
  async updateOrg(id: string, data: Record<string, any>) {
    const org = this.orgs.find((o) => o.id === id);
    if (!org) return;
    const res = await pb.collection("orgs").update(id, data);
    const user = await initData();
    
    this.user = user;
    return res;
  }

  // PROJECT MANAGEMENT
  async createProject(data: Record<string, any>) {
    const res: ProjectsResponse<ProjectExpandStrict> = await pb
      .collection("projects")
      .create(data, {
        expand: "integrations,sources,agents,chats,operators",
      });
    this.projects.push(res);
    return res;
  }
  async deleteProject(id: string) {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return;
    await pb.collection("projects").delete(id);
    this.projects = this.projects.filter((p) => p.id !== id);
    return project;
  }
  async updateProject(id: string, data: Record<string, any>) {
    const project = this.projects.find((p) => p.id === id);
    if (!project) return;
    const res: ProjectsResponse<ProjectExpandStrict> = await pb
      .collection("projects")
      .update(id, data, {
        expand: "integrations,sources,agents,chats,operators",
      });
    this.projects = this.projects.map((p) => (p.id === id ? res : p));
    return res;
  }

  // INTEGRATION MANAGEMENT
  async createIntegration(data: Record<string, any>) {
    const res: IntegrationsResponse<IntegrationExpandStrict> = await pb
      .collection("integrations")
      .create(data, {
        expand: "agent,chat,sources,operators",
      });
    this.integrations.push(res);
    return res;
  }
  async deleteIntegration(id: string) {
    const integration = this.integrations.find((i) => i.id === id);
    if (!integration) return;
    await pb.collection("integrations").delete(id);
    this.integrations = this.integrations.filter((i) => i.id !== id);
    return integration;
  }
  async updateIntegration(id: string, data: Record<string, any>) {
    const integration = this.integrations.find((i) => i.id === id);
    if (!integration) return;
    const res: IntegrationsResponse<IntegrationExpandStrict> = await pb
      .collection("integrations")
      .update(id, data, {
        expand: "agent,chat,sources,operators",
      });
    this.integrations = this.integrations.map((i) => (i.id === id ? res : i));
    return res;
  }

  // AGENT MANAGEMENT
  async createAgent(data: Record<string, any>) {
    const res = await pb.collection("agents").create(data);
    this.agents.push(res);
    return res;
  }
  async deleteAgent(id: string) {
    const agent = this.agents.find((a) => a.id === id);
    if (!agent) return;
    await pb.collection("agents").delete(id);
    this.agents = this.agents.filter((a) => a.id !== id);
    return agent;
  }
  async updateAgent(id: string, data: Record<string, any>) {
    const agent = this.agents.find((a) => a.id === id);
    if (!agent) return;
    const res = await pb.collection("agents").update(id, data);
    this.agents = this.agents.map((a) => (a.id === id ? res : a));

    if (this.agent?.id === id) this.agent = res;

    return res;
  }

  // CHAT MANAGEMENT
  async createChat(data: Record<string, any>) {
    const res = await pb.collection("chats").create(data);
    this.chats.push(res);
    return res;
  }
  async deleteChat(id: string) {
    const chat = this.chats.find((c) => c.id === id);
    if (!chat) return;
    await pb.collection("chats").delete(id);
    this.chats = this.chats.filter((c) => c.id !== id);
    return chat;
  }
  async updateChat(id: string, data: Record<string, any>) {
    const chat = this.chats.find((c) => c.id === id);
    if (!chat) return;
    const res = await pb.collection("chats").update(id, data);
    this.chats = this.chats.map((c) => (c.id === id ? res : c));

    if (this.chat?.id === id) this.chat = res;

    return res;
  }
}

export const userProvider = new UserProvider();
