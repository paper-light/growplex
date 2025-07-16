const SELECTED_KEY = "settings.selected";

interface Selected {
  org: string | null;
  project: string | null;
  integration: string | null;

  room: string | null;
  source: string | null;
}

function loadSelected(): Selected {
  try {
    const raw = localStorage.getItem(SELECTED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    org: null,
    project: null,
    integration: null,
    room: null,
    source: null,
  };
}

function saveSelected(selected: Selected) {
  try {
    localStorage.setItem(SELECTED_KEY, JSON.stringify(selected));
  } catch {}
}

class SettingsProvider {
  private selected = $state<Selected>(loadSelected());

  org = $derived(this.selected.org);
  project = $derived(this.selected.project);
  integration = $derived(this.selected.integration);
  room = $derived(this.selected.room);
  source = $derived(this.selected.source);

  setOrg(orgId: string) {
    if (this.selected.org === orgId) return;
    this.selected.org = orgId;
    this.selected.project = null;
    this.selected.integration = null;
    this.selected.room = null;
    this.selected.source = null;
    saveSelected(this.selected);
  }

  setProject(projectId: string) {
    if (this.selected.project === projectId) return;
    this.selected.project = projectId;
    this.selected.integration = null;
    this.selected.room = null;
    this.selected.source = null;
    saveSelected(this.selected);
  }

  setIntegration(integrationId: string) {
    if (this.selected.integration === integrationId) return;
    this.selected.integration = integrationId;
    saveSelected(this.selected);
  }

  setRoom(roomId: string) {
    if (this.selected.room === roomId) return;
    this.selected.room = roomId;
    saveSelected(this.selected);
  }

  setSource(sourceId: string) {
    if (this.selected.source === sourceId) return;
    this.selected.source = sourceId;
    saveSelected(this.selected);
  }

  clear() {
    this.selected.org = null;
    this.selected.project = null;
    this.selected.integration = null;
    this.selected.room = null;
    this.selected.source = null;
    try {
      localStorage.removeItem(SELECTED_KEY);
    } catch {}
  }
}

export const settingsProvider = new SettingsProvider();
