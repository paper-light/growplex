<script lang="ts">
  import AgentSelect from "../features/AgentSelect.svelte";
  import Card from "../../../shared/ui/lib/Card.svelte";
  import AgentNameUpdate from "../features/AgentNameUpdate.svelte";
  import AgentAvatarUpdate from "../features/AgentAvatarUpdate.svelte";
  import AgentSystemUpdate from "../features/AgentSystemUpdate.svelte";
  import { agentsProvider } from "../../providers/agents.svelte";

  const agent = $derived(agentsProvider.selectedIntegrationAgent);
</script>

<Card title="Agent" class="max-w-2xl mx-auto">
  <div class="space-y-4">
    <AgentSelect />

    {#if agent}
      <div class="flex gap-6 mb-2">
        <AgentAvatarUpdate {agent} class="flex-1 max-w-24" />

        <AgentNameUpdate {agent} class="flex-1" />
      </div>

      <AgentSystemUpdate {agent} />
    {/if}
  </div>
</Card>
