<script lang="ts">
  import { createChat } from "../features/create-chat";
  import { settingsProvider } from "../../user/settings.svelte";
  import { authProvider } from "../../user/auth.svelte";

  let { size = "md" }: { size?: "sm" | "md" | "lg" } = $props();

  const sizesMap = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  async function createGenericChat() {
    if (!settingsProvider.currentProject) return;

    await createChat({
      projectId: settingsProvider.currentProject.id,
      integrationId: settingsProvider.currentIntegration?.id,
    });

    await authProvider.refreshUser();
  }
</script>

<button
  class={["btn btn-primary w-full text-2xl", sizesMap[size]]}
  onclick={createGenericChat}
>
  + Create New Chat
</button>
