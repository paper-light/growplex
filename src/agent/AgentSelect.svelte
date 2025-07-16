<script lang="ts">
  import { userProvider } from "../user/user.svelte";

  let { size = "md" }: { size?: "sm" | "md" | "lg" } = $props();

  const sizesMap = {
    sm: "select-sm",
    md: "select-md",
    lg: "select-lg",
  };

  const integration = $derived(userProvider.integration);
  const allAgents = $derived(userProvider.project?.expand?.agents || []);

  async function handleSelectAgent(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    if (!id || !integration) return;
    await userProvider.updateIntegration(integration.id, { agent: id });
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
