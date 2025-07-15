<script lang="ts">
   import { settingsProvider } from "../user/settings.svelte";
  import { authProvider } from "../user/auth.svelte";
  import { pb } from "../shared/lib/pb";

  let { size = "md" }: { size?: "sm" | "md" | "lg" } = $props();

  const sizesMap = {
    sm: "select-sm",
    md: "select-md",
    lg: "select-lg",
  };

  const currentIntegration = $derived(settingsProvider.currentIntegration);
  const allAgents = $derived(
    settingsProvider.currentProject?.expand?.agents || []
  );

  async function handleSelectAgent(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    if (!id || !currentIntegration) return;
    await pb
      .collection("integrations")
      .update(currentIntegration.id, { agent: id });
    await authProvider.refreshUser();
  }
</script>

<select
  class={["select select-bordered w-full", sizesMap[size]]}
  onchange={handleSelectAgent}
>
  <option value="">Select from project…</option>
  {#each allAgents as agent}
    <option value={agent.id}>{agent.name || agent.id}</option>
  {/each}
</select>
