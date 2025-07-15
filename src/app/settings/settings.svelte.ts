import { authProvider } from "../auth/auth.svelte";
import type { ProjectsResponse } from "../../shared/models/pocketbase-types";
import type { ProjectExpand } from "../../shared/models/expands";

const SELECTED_KEY = "settings.selected";

interface Selected {
  orgId: string | null;
  projectId: string | null;
  integrationId: string | null;
}

function loadSelected(): Selected {
  try {
    const raw = localStorage.getItem(SELECTED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { orgId: null, projectId: null, integrationId: null };
}

function saveSelected(selected: Selected) {
  try {
    localStorage.setItem(SELECTED_KEY, JSON.stringify(selected));
  } catch {}
}

class SettingsProvider {
  private selected = $state<Selected>(loadSelected());

  currentOrg = $derived.by(() => {
    const orgs = authProvider.orgs;
    if (!orgs.length) return null;
    if (this.selected.orgId) {
      const found = orgs.find((o) => o && o.id === this.selected.orgId);
      if (found) return found;
    }
    return orgs[0];
  });
  currentRole = $derived.by(() => {
    if (!this.selected.orgId) return null;
    const role = authProvider.orgMembers.find(
      (m) => m.expand!.org?.id === this.selected.orgId
    );
    return role?.role;
  });

  currentProject: ProjectsResponse<ProjectExpand> | null = $derived.by(() => {
    const org = this.currentOrg;
    if (!org) return null;
    const projects = org.expand!.projects!;
    if (!projects.length) return null;
    if (this.selected.projectId) {
      const found = projects.find((p) => p.id === this.selected.projectId);
      if (found) return found;
    }
    return projects[0];
  });

  currentIntegration = $derived.by(() => {
    const project = this.currentProject;

    if (!project) return null;
    const integrations = project.expand!.integrations!;
    if (!integrations.length) return null;
    if (this.selected.integrationId) {
      const found = integrations.find(
        (i) => i.id === this.selected.integrationId
      );
      if (found) return found;
    }
    return integrations[0];
  });

  currentChat = $derived.by(() => {
    const integration = this.currentIntegration;
    if (!integration) return null;
    return integration.expand!.chat!;
  });
  currentAgent = $derived.by(() => {
    const integration = this.currentIntegration;
    if (!integration) return null;
    return integration.expand!.agent!;
  });
  currentSources = $derived.by(() => {
    const integration = this.currentIntegration;
    if (!integration) return null;
    return integration.expand!.sources!;
  });

  setCurrentOrg(orgId: string) {
    if (this.selected.orgId === orgId) return;
    this.selected.orgId = orgId;
    this.selected.projectId = null;
    this.selected.integrationId = null;
    saveSelected(this.selected);
  }

  setCurrentProject(projectId: string) {
    if (this.selected.projectId === projectId) return;
    this.selected.projectId = projectId;
    this.selected.integrationId = null;
    saveSelected(this.selected);
  }

  setCurrentIntegration(integrationId: string) {
    if (this.selected.integrationId === integrationId) return;
    this.selected.integrationId = integrationId;
    saveSelected(this.selected);
  }

  clear() {
    this.selected.orgId = null;
    this.selected.projectId = null;
    this.selected.integrationId = null;
    try {
      localStorage.removeItem(SELECTED_KEY);
    } catch {}
  }
}

export const settingsProvider = new SettingsProvider();
