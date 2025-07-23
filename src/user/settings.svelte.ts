const SELECTED_KEY = "settings.selected";

interface Selected {
  selectedOrgId: string | null;
  selectedProjectId: string | null;
  selectedAgentId: string | null;
  selectedChatId: string | null;

  selectedIntegrationId: string | null;
  selectedIntegrationAgentId: string | null;
  selectedIntegrationChatId: string | null;

  selectedRoomId: string | null;
  selectedSourceId: string | null;
}

function loadSelected(): Selected {
  try {
    const raw = localStorage.getItem(SELECTED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    selectedOrgId: null,
    selectedProjectId: null,
    selectedAgentId: null,
    selectedChatId: null,

    selectedIntegrationId: null,
    selectedIntegrationAgentId: null,
    selectedIntegrationChatId: null,

    selectedRoomId: null,
    selectedSourceId: null,
  };
}

function saveSelected(selected: Selected) {
  try {
    localStorage.setItem(SELECTED_KEY, JSON.stringify(selected));
  } catch {}
}

class SettingsProvider {
  private selected = $state<Selected>(loadSelected());

  // Selected values
  selectedOrgId = $derived(this.selected.selectedOrgId);
  selectedProjectId = $derived(this.selected.selectedProjectId);
  selectedAgentId = $derived(this.selected.selectedAgentId);
  selectedChatId = $derived(this.selected.selectedChatId);

  selectedIntegrationId = $derived(this.selected.selectedIntegrationId);
  selectedIntegrationAgentId = $derived(
    this.selected.selectedIntegrationAgentId
  );
  selectedIntegrationChatId = $derived(this.selected.selectedIntegrationChatId);

  selectedRoomId = $derived(this.selected.selectedRoomId);
  selectedSourceId = $derived(this.selected.selectedSourceId);

  // Org context
  selectOrg(orgId: string) {
    if (this.selected.selectedOrgId === orgId) return;
    this.selected.selectedOrgId = orgId;
    saveSelected(this.selected);
  }
  selectProject(projectId: string) {
    if (this.selected.selectedProjectId === projectId) return;
    this.selected.selectedProjectId = projectId;
    saveSelected(this.selected);
  }

  // Integration context
  selectIntegration(integrationId: string) {
    if (this.selected.selectedIntegrationId === integrationId) return;
    this.selected.selectedIntegrationId = integrationId;
    saveSelected(this.selected);
  }
  selectAgent(agentId: string) {
    if (this.selected.selectedAgentId === agentId) return;
    this.selected.selectedAgentId = agentId;
    saveSelected(this.selected);
  }
  selectChat(chatId: string) {
    if (this.selected.selectedChatId === chatId) return;
    this.selected.selectedChatId = chatId;
    saveSelected(this.selected);
  }

  // Integration context
  selectIntegrationAgent(agentId: string) {
    if (this.selected.selectedIntegrationAgentId === agentId) return;
    this.selected.selectedIntegrationAgentId = agentId;
    saveSelected(this.selected);
  }
  selectIntegrationChat(chatId: string) {
    if (this.selected.selectedIntegrationChatId === chatId) return;
    this.selected.selectedIntegrationChatId = chatId;
    saveSelected(this.selected);
  }

  // Other
  selectRoom(roomId: string) {
    if (this.selected.selectedRoomId === roomId) return;
    this.selected.selectedRoomId = roomId;
    saveSelected(this.selected);
  }
  selectSource(sourceId: string) {
    if (this.selected.selectedSourceId === sourceId) return;
    this.selected.selectedSourceId = sourceId;
    saveSelected(this.selected);
  }

  clear() {
    this.selected.selectedOrgId = null;
    this.selected.selectedProjectId = null;
    this.selected.selectedAgentId = null;
    this.selected.selectedChatId = null;

    this.selected.selectedIntegrationId = null;
    this.selected.selectedIntegrationAgentId = null;
    this.selected.selectedIntegrationChatId = null;

    this.selected.selectedRoomId = null;
    this.selected.selectedSourceId = null;
    try {
      localStorage.removeItem(SELECTED_KEY);
    } catch {}
  }
}

export const settingsProvider = new SettingsProvider();
