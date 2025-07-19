import { z } from "zod";

const UIStateSchema = z.object({
  integrationsSidebarOpen: z.boolean().default(false),
  chatPreviewOpen: z.boolean().default(true),

  selectedChatTheme: z.string().default("light"),
  initialChatTheme: z.string().default("light"),
});

type UIState = z.infer<typeof UIStateSchema>;

class UIProvider {
  private state: UIState = $state(this.loadState());

  integrationsSidebarOpen = $derived(this.state.integrationsSidebarOpen);
  chatPreviewOpen = $derived(this.state.chatPreviewOpen);

  selectedChatTheme = $derived(this.state.selectedChatTheme);
  initialChatTheme = $derived(this.state.initialChatTheme);

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

  setInitialChatTheme(theme: string) {
    this.state.initialChatTheme = theme;
    this.saveState();
  }

  setSelectedChatTheme(theme: string) {
    this.state.selectedChatTheme = theme;
    this.saveState();
  }

  private loadState(): UIState {
    try {
      const raw = localStorage.getItem("uiState");
      if (raw) {
        const state = UIStateSchema.parse(JSON.parse(raw));
        state.selectedChatTheme = state.initialChatTheme;
        return state;
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

  clear() {
    this.state = UIStateSchema.parse({});
    this.saveState();
  }
}

export const uiProvider = new UIProvider();
