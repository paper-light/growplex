import { z } from "zod";

const UIStateSchema = z.object({
  integrationsSidebarOpen: z.boolean().default(false),
  chatPreviewOpen: z.boolean().default(true),
});

type UIState = z.infer<typeof UIStateSchema>;

class UIProvider {
  private state: UIState = $state(this.loadState());

  integrationsSidebarOpen = $derived(this.state.integrationsSidebarOpen);
  chatPreviewOpen = $derived(this.state.chatPreviewOpen);

  setIntegrationsSidebarOpen(open: boolean) {
    this.state.integrationsSidebarOpen = open;
    this.saveState();
  }

  toggleIntegrationsSidebar() {
    this.setIntegrationsSidebarOpen(!this.state.integrationsSidebarOpen);
  }

  setChatPreviewOpen(open: boolean) {
    this.state.chatPreviewOpen = open;
    this.saveState();
  }

  toggleChatPreview() {
    this.setChatPreviewOpen(!this.state.chatPreviewOpen);
  }

  private loadState(): UIState {
    try {
      const raw = localStorage.getItem("uiState");
      if (raw) {
        return UIStateSchema.parse(JSON.parse(raw));
      }
    } catch (error) {
      console.error("Failed to load UI state:", error);
    }
    return UIStateSchema.parse({});
  }

  private saveState() {
    try {
      localStorage.setItem("uiState", JSON.stringify(this.state));
    } catch (error) {
      console.error("Failed to save UI state:", error);
    }
  }
}

export const uiProvider = new UIProvider();
