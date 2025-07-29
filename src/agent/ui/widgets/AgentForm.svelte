<script lang="ts">
  import Card from "@/shared/ui/lib/Card.svelte";
  import AgentSelect from "@/agent/ui/features/AgentSelect.svelte";
  import AgentNameUpdate from "@/agent/ui/features/AgentNameUpdate.svelte";
  import AgentAvatarUpdate from "@/agent/ui/features/AgentAvatarUpdate.svelte";
  import AgentSystemUpdate from "@/agent/ui/features/AgentSystemUpdate.svelte";
  import { agentsProvider } from "@/agent/providers/agents.svelte";

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
