<script lang="ts">
  import { authProvider } from "../app/auth/auth.svelte";
  import { settingsProvider } from "../app/settings/settings.svelte";
  import { createAgent } from "./create-agent";

  let { size = "md" }: { size?: "sm" | "md" | "lg" } = $props();

  const sizesMap = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  async function createGenericAgent() {
    if (!settingsProvider.currentProject) return;

    await createAgent({
      projectId: settingsProvider.currentProject.id,
      integrationId: settingsProvider.currentIntegration?.id,
    });

    await authProvider.refreshUser();
  }
</script>

<button
  class={["btn btn-primary w-full text-2xl", sizesMap[size]]}
  onclick={createGenericAgent}
>
  + Create New Agent
</button>
